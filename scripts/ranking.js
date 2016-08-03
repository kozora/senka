$(function() {

const server = $(".server-ranking-article").data("server");

function format_api_no_diff(player) {
    const api_no_diff = player.api_no_diff;
    const api_rate_diff = player.api_rate_diff;
    const color = api_no_diff > 0 ? "red" : api_no_diff < 0 ? "green" : "grey";
    const value = api_no_diff == null ? `・。・` : api_no_diff >= 0 ? `&uarr;${api_no_diff}` : `&darr;${-api_no_diff}`;
    return `<span class="${color}">(${value}${(player.diff_guess ? `<sup>?</sup>` : ``)})</span>`;
}

function format_api_rate_diff(player) {
    const api_rate_diff = player.api_rate_diff;
    const color = api_rate_diff >= 150 ? "blue bold" : api_rate_diff >= 100 ? "blue" : api_rate_diff >= 50 ? "green" : "gray";
    const value = api_rate_diff == null ? `・。・` : `+${api_rate_diff}`;
    return `<span class="${color}">(${value}${(player.diff_guess ? `<sup>?</sup>` : ``)})</span>`;
}

function format_api_medals(api_medals) {
    return `<span>${(api_medals > 0 ? `甲<sub class="bold">${api_medals}</sub>` : ``)}</span>`;
}

$.getJSON(`index/server/${server}/ranking.json`, function(data) {

    $("#last-update-date").text(`(${data.last_update_date})`);

    var html = "";
    for (var player of data.ranking) {
        html += `<tr>` +
            `<td>${player.api_no}</td>` +
            `<td data-value="${(player.api_no_diff == null ? -1000 : player.api_no_diff)}">${format_api_no_diff(player)}</td>` +
            `<td>${player.api_nickname}</td>` +
            `<td>${player.api_comment}</td>` +
            `<td>${player.api_rate}</td>` +
            `<td data-value="${(player.api_rate_diff == null ? -1 : player.api_rate_diff)}">${format_api_rate_diff(player)}</td>` +
            `<td data-value="${(player.api_medals)}">${format_api_medals(player.api_medals)}</td>` +
            `</tr>`;
    }
    $("#ranking-table tbody").append(html);

    $.bootstrapSortable();

    $("#top-table tbody").append(
        `<tr>${data.top.map((e) => `<td>${e}</td>`).join("")}</tr>`
    );

    $("#medal-table thead").append(
        `<tr>${data.medals.map((e) => `<th>甲<sub class="bold">${e[0]}</sub></th>`).join("")}</tr>`
    );
    $("#medal-table tbody").append(
        `<tr>${data.medals.map((e) => `<td>${e[1]}</td>`).join("")}</tr>` +
        `<tr>${data.medals.map((e) => `<td>${(100 * (e[1] / data.users).toFixed(4)).toFixed(2)}%</td>`).join("")}</tr>`
    );

    $("#increment-table thead").append(
        `<tr>${data.increments.map((e) => `<th>${e[0]}+</th>`).join("")}</tr>`
    );
    $("#increment-table tbody").append(
        `<tr>${data.increments.map((e) => `<td>${e[1]}</td>`).join("")}</tr>` +
        `<tr>${data.increments.map((e) => `<td>${(100 * (e[1] / data.rated_users).toFixed(4)).toFixed(2)}%</td>`).join("")}</tr>`
    );

});

});
