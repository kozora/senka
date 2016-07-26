$(function() {

let server = $(".server-overview-article").data("server");

$.getJSON(`index/server/${server}/overview.json`, (data) => {

    $("#last-update-date").text(`(${data.last_update_date})`);

    $('#overview-chart').highcharts({
        chart: { type: 'spline' },
        title: null,
        tooltip: { crosshairs: true, shared: true },
        plotOptions: { spline: { marker: { radius: 3, lineColor: '#666666', lineWidth: 1 } } },
        series: [
            { name: 'Top 1', marker: { symbol: 'circle' }, data: data.top1, color: "#B71C1C" },
            { name: 'Top 5', marker: { symbol: 'circle' }, data: data.top5, color: "#E65100" },
            { name: 'Top 20', marker: { symbol: 'circle' }, data: data.top20, color: "#F57F17" },
            { name: 'Top 100', marker: { symbol: 'circle' }, data: data.top100, color: "#0D47A1" },
            { name: 'Top 500', marker: { symbol: 'circle' }, data: data.top500, color: "#1B5E20" },
        ],
    });

});

});
