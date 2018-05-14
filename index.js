var w = 400,
    h = 350;

var svg = d3.select("body")
    .append("svg")
    .attr("class", "sim")
    .attr("width", w)
    .attr("height", h);


var mirror = svg.append("line")
    .attr("x1", 0)
    .attr("x2", w)
    .attr("y1", 2*h/3)
    .attr("y2", 2*h/3)
    .attr("class", "mirror");

var block = svg.append("rect")
    .attr("x", 0)
    .attr("y", 2*h/3)
    .attr("width", w)
    .attr("height", h/3)
    .attr("class", "solid");

var handles = [
    {x: 60, y:70},
    {x: 90, y:130}
]

var rays = [
    {x1: 60, y1: 70, x2: 90, y2: 130},
    { x1: 60, y1: 70, x2: 90, y2: 130 }
]

svg.selectAll("circle")
    .data(handles)
    .enter().append("circle")
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .attr("r", 10)
        .attr("class", "handle")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

svg.append("g")
    .attr("class", "incident-rays")
    .selectAll("line")
    .data([handles])
    .enter().append("line")
        .attr("x1", function(d) {return d[0].x})
        .attr("y1", function (d) { return d[0].y; /*return d[0].y - ((d[0].y - d[1].y) / (d[0].x - d[1].x)) * d[0].x*/ })
        .attr("x2", function(d){return ((2*h/3) - d[0].y)/((d[0].y - d[1].y)/(d[0].x - d[1].x)) + d[0].x })
        .attr("y2", 2 * h / 3)
        .attr("class", "ray");

svg.append("g")
    .attr("class", "reflection-rays")
    .selectAll("line")
    .data([handles])
    .enter().append("line")
        .attr("x1", function (d) { return ((2 * h / 3) - d[0].y) / ((d[0].y - d[1].y) / (d[0].x - d[1].x)) + d[0].x })
        .attr("y1", 2 * h / 3)
        .attr("x2", function(d) {return d[0].x > d[1].x ? 0 : w})
        .attr("y2", function (d) { return -((d[0].y - d[1].y) / (d[0].x - d[1].x)) * ((d[0].x > d[1].x ? 0 : w) - (((2 * h / 3) - d[0].y) / ((d[0].y - d[1].y) / (d[0].x - d[1].x)) + d[0].x)) + 2 * h / 3})
        .attr("class", "ray");

svg.append("g")

function dragstarted(d){
    d3.select(this).raise().classed("active", true);
}

function dragged(d, i){
    // console.log(i);
    d3.select(this)
        .attr("cx", d.x = d3.event.x)
        .attr("cy", d.y = i == 1 ? Math.max(d3.event.y, handles[0].y + 20) : Math.min(d3.event.y, handles[1].y - 20));

    svg.select(".incident-rays").selectAll("line").data([handles])
        .attr("x1", function(d) {return d[0].x;})
        .attr("y1", function (d) { return d[0].y;/*return d[0].y - ((d[0].y - d[1].y) / (d[0].x - d[1].x)) * d[0].x*/ })
        .attr("x2", function (d) { return ((2 * h / 3) - d[0].y) / ((d[0].y - d[1].y) / (d[0].x - d[1].x)) + d[0].x });
    
    svg.select(".reflection-rays").selectAll("line").data([handles])
        .attr("x1", function (d) { return ((2 * h / 3) - d[0].y) / ((d[0].y - d[1].y) / (d[0].x - d[1].x)) + d[0].x })
        .attr("x2", function (d) { return d[0].x > d[1].x ? 0 : w })
        .attr("y2", function (d) { return -((d[0].y - d[1].y) / (d[0].x - d[1].x)) * ((d[0].x > d[1].x ? 0 : w) - (((2 * h / 3) - d[0].y) / ((d[0].y - d[1].y) / (d[0].x - d[1].x)) + d[0].x)) + 2 * h / 3 });
}

function dragended(d){
    d3.select(this).classed("active", false);
}

// FOR PARABOLIC REFLECTOR

// var mirror = [
    
// ];

// for(let i = -10; i <= 10; i++){
//     mirror.push({
//         y: i * 10 + h/2,
//         x: w - 10 - 0.005 * (i*10) ** 2
//     })
// }


// polyPath = mirror.reduce(function(acc, x){
//     return acc += x.x + "," + x.y + " ";
// }, "");

// svg.append("polyline")
//     .attr("class", "mirror")
//     .attr("points", polyPath);