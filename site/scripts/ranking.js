$(function() {

function format_api_no_diff(api_no_diff) {
    const color = api_no_diff > 0 ? "red" : api_no_diff < 0 ? "green" : "grey";
    const value = api_no_diff == null ? `・。・` : api_no_diff >= 0 ? `&uarr;${api_no_diff}` : `&darr;${api_no_diff}`;
    return `<span class="${color}">(${value})</span>`;
}

function format_api_rate_diff(api_rate_diff) {
    const color = api_rate_diff >= 150 ? "blue bold" : api_rate_diff >= 100 ? "blue" : api_rate_diff >= 50 ? "green" : "gray";
    const value = api_rate_diff == null ? `・。・` : api_rate_diff >= 0 ? `+${api_rate_diff}` : `-${api_rate_diff}`;
    return `<span class="${color}">(${value})</span>`;
}

function format_api_medals(api_medals) {
    return `<span>${(api_medals > 0 ? `甲<sub class="bold">${api_medals}</sub>` : ``)}</span>`;
}

$.getJSON("index/server/19/ranking.json", function(data) {

    $("#last-update-date").text(`(${data.last_update_date})`);

    var html = "";
    for (var player of data.ranking) {
        html += `<tr>` +
            `<td>${player.api_no} ${format_api_no_diff(player.api_no_diff)}</td>` +
            `<td>${player.api_nickname}</td>` +
            `<td>${player.api_comment}</td>` +
            `<td>${player.api_rate} ${format_api_rate_diff(player.api_rate_diff)}   </td>` +
            `<td>${format_api_medals(player.api_medals)}</td>` +
            `</tr>`;
    }
    $("#ranking-table tbody").append(html);

});

});
