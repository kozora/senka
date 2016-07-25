import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

// * Config.

const config = require("./config");
const member_id = config.member_id;
const api_direcory = config.api_direcory;
const month_request = config.month_request;

// * API functions (api_req_ranking/getlist responses).

function decodeApiRate(api_rate: number, api_no: number): number {
    const magic = [2, 5, 7, 2, 7, 3, 1, 6, 9, 9];
    return api_rate / api_no / magic[member_id % 10];
}

enum ApiResponseFormat {
    KCV,
    EO,
}

const kcv_filename_format =
    `(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d) (\\d\\d)-\\d\\d-\\d\\d\\.svdata`;

class ApiResponse {

    // TODO: edge cases (first and last days, unsynced time?)
    private static cycle(day: number, hour: number): string {
        return (Math.floor((day * 24 + hour - 3) / 12) / 2).toString();
    }

    public readonly file: string;

    public readonly year: number;
    public readonly month: number;
    public readonly day: number;
    public readonly hour: number;
    public readonly cycle: string;

    public readonly valid: boolean;

    // TODO: EO format
    public constructor(file: string, format: ApiResponseFormat = ApiResponseFormat.KCV) {
        this.file = file;
        const match = file.match(new RegExp(kcv_filename_format));
        if (match) {
            [this.year, this.month, this.day, this.hour] = match.slice(1, 5).map(Number);
            this.cycle = ApiResponse.cycle(this.day, this.hour);
            this.valid = true;
        } else {
            this.valid = false;
        }
    }

    public read() {
        if (this.valid) {
            return JSON.parse(fs.readFileSync(path.join(api_direcory, this.file))
                .toString().replace("svdata=", "")).api_data.api_list;
        }
    }

}

// * Full index, merging api_req_ranking/getlist responses from API directory.

const index = {};

for (const file of fs.readdirSync(api_direcory)) {
    const apiResponse = new ApiResponse(file);
    if (apiResponse.valid) {
        if (apiResponse.month === month_request) {
            try {
                for (const user of apiResponse.read()) {
                    if (!index[apiResponse.cycle]) {
                        index[apiResponse.cycle] = { ranking: {} };
                    }
                    user.api_rate
                        = user.api_level
                        ? user.api_rate
                        : decodeApiRate(user.api_rate, user.api_no);
                    user.api_flag = undefined;
                    user.api_rank = undefined;
                    index[apiResponse.cycle].ranking[user.api_no] = user;
                }
            } catch (e) {
                console.log("error, bad format:", file);
            }
        }
    }
}

function getPoints(cycle: string, api_no: number): number {
    const player_data = index[cycle].ranking[api_no];
    return player_data && player_data.api_rate;
}

// * Build index/server/<number>/overview.json endpoint

const overview = {
    last_update_date: "",
    top1: <any[]>[],
    top5: <any[]>[],
    top20: <any[]>[],
    top100: <any[]>[],
    top500: <any[]>[],
};

let last_cycle: number = null;

for (const cycle in index) {
    const cycle_number = parseFloat(cycle);
    if (!last_cycle || cycle_number > last_cycle) {
        last_cycle = cycle_number;
    }
    if (cycle_number >= 1) {
        overview.top1.push({ x: cycle_number, y: getPoints(cycle, 1) });
        overview.top5.push({ x: cycle_number, y: getPoints(cycle, 5) });
        overview.top20.push({ x: cycle_number, y: getPoints(cycle, 20) });
        overview.top100.push({ x: cycle_number, y: getPoints(cycle, 100) });
        overview.top500.push({ x: cycle_number, y: getPoints(cycle, 500) })
    }
}

// apply 19/2016/7 patch
const patch = require("../site/index/server/19/overview.patch");
for (const k of ["top1", "top5", "top20", "top100", "top500"]) {
    for (const new_point of patch[k]) {
        if (! _.find(overview[k], (p: any) => p.x === new_point.x && p.y)) {
            overview[k].push(new_point);
        }
    }
    _.remove(overview[k], (p: any) => p.x && ! p.y);
}

const last_update_date = `2016/${month_request}/${last_cycle}`;

overview.last_update_date = last_update_date;

overview.top1 = _.sortBy(overview.top1, "x");
overview.top5 = _.sortBy(overview.top5, "x");
overview.top20 = _.sortBy(overview.top20, "x");
overview.top100 = _.sortBy(overview.top100, "x");
overview.top500 = _.sortBy(overview.top500, "x");

fs.writeFileSync("site/index/server/19/overview.json", JSON.stringify(overview));

// * Build index/server/<number>/ranking.json endpoint

const ranking = {
    last_update_date: last_update_date,
    ranking: <any[]>[],
};

for (const k in index[last_cycle].ranking) {
    ranking.ranking.push(index[last_cycle].ranking[k]);
}
ranking.ranking = _.sortBy(ranking.ranking, "api_no");

function getPlayerClass(ranking: any, player: any): any[] {
    return _.values(ranking).filter((other_player: any) => other_player.api_nickname === player.api_nickname);
}

// build increment
const pre_last_cycle = last_cycle - 0.5;
if (index[pre_last_cycle]) {
    const pre_ranking = index[pre_last_cycle].ranking;
    for (const player of ranking.ranking) {
        const playerClass = _.sortBy(getPlayerClass(pre_ranking, player), "api_rate");
        if (playerClass.length === 1) {
            player.api_no_diff = player.api_no - playerClass[0].api_no;
            player.api_rate_diff = player.api_rate - playerClass[0].api_rate;
        } else {
            // TODO: name conflicts
        }
    }
}

fs.writeFileSync("site/index/server/19/ranking.json", JSON.stringify(ranking));

// * Report on completeness for each cycle.

for (const cycle of _.sortBy(Object.keys(index), parseFloat)) {
    console.log("players in:", cycle, Object.keys(index[cycle].ranking).length);
}

for (let i = 5; i < 990; i += 5) {
    if (! index[last_cycle].ranking[i]) {
        console.log("missing page:", i);
    }
}
