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

var coords = {};

function updateCoords(){
    coords.m = ((handles[0].y - handles[1].y) / (handles[0].x - handles[1].x))

    coords.x1 = handles[0].x;
    coords.y1 = handles[0].y;

    coords.x2 = handles[1].x;
    coords.y2 = handles[1].y;

    coords.h = 2 * h / 3;
    coords.x3 = (coords.h - coords.y1) / coords.m + coords.x1;

    coords.x4 = coords.x1 > coords.x2 ? 0 : w;
    coords.y4 = -coords.m * (coords.x4 - ((coords.h - coords.y1) / coords.m + coords.x1)) + coords.h;

}

updateCoords();

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

svg.append("line")
    .attr("id", "incident")
        .attr("x1", coords.x1)
        .attr("y1", coords.y1)
        .attr("x2", coords.x3)
        .attr("y2", coords.h)
        .attr("class", "ray");

svg.append("line")
    .attr("id", "reflection")
        .attr("x1", coords.x3)
        .attr("y1", coords.h)
        .attr("x2", coords.x4)
        .attr("y2", coords.y4)
        .attr("class", "ray");

// svg.append("path")
//     .attr("class", "arc")
//     .attr("d", "M " + 
//         (((2 * h / 3) - handles[0].y) / ((handles[0].y - handles[1].y) / (handles[0].x - handles[1].x)) + handles[0].x) 
//         + " " + (2*h/3) 
//         + " L "
//         + 10 * Math.cos(Math.atan2(handles[0].y - handles[1].y, handles[0].x - handles[1].x))
//         + " " + 10 * Math.sin(Math.atan2(handles[0].y - handles[1].y, handles[0].x - handles[1].x)) 
//         + " Z");
    //M115,115 L115,0 A115,115 1 0,1 196.317, 33.6827 z

function dragstarted(d){
    d3.select(this).raise().classed("active", true);
}

function dragged(d, i){
    // console.log(i);
    d3.select(this)
        .attr("cx", d.x = d3.event.x)
        .attr("cy", d.y = i == 1 ? Math.max(d3.event.y, handles[0].y + 20) : Math.min(d3.event.y, handles[1].y - 20));

    updateCoords();

    svg.select("#incident")
        .attr("x1", coords.x1)
        .attr("y1", coords.y1)
        .attr("x2", coords.x3)
    
    svg.select("#reflection")
        .attr("x1", coords.x3)
        .attr("x2", coords.x4)
        .attr("y2", coords.y4);
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