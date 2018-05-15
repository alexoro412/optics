var w = 400,
    h = 350,
    angle_radius = 35,
    handle_radius = 10;

var handles = [
    { x: 41, y: 129 },
    { x: 112, y: 170 }
]

var coords = {};

function updateCoords() {
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

var svg = d3.select("#main")
    .append("svg")
    .attr("class", "sim")
    .attr("width", w)
    .attr("height", h);


var mirror = svg.append("line")
    .attr("x1", 0)
    .attr("x2", w)
    .attr("y1", coords.h)
    .attr("y2", coords.h)
    .attr("class", "mirror");

var block = svg.append("rect")
    .attr("x", 0)
    .attr("y", coords.h)
    .attr("width", w)
    .attr("height", h - coords.h)
    .attr("class", "solid");

svg.selectAll("circle")
    .data(handles)
    .enter().append("circle")
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .attr("r", handle_radius)
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

svg.append("text")
    .attr("id", "thetai")
    .attr("x", coords.x3 - 2*angle_radius/3)
    .attr("y", coords.h + 15)
    .attr("font-size", "14")
    .text("θ")
    .append("tspan")
        .attr("baseline-shift", "sub")
        .attr("font-size", "10")
        .text("i");

svg.append("text")
    .attr("id", "thetaf")
    .attr("x", coords.x3 + angle_radius / 3)
    .attr("y", coords.h + 15)
    .attr("font-size", "14")
    .text("θ")
    .append("tspan")
        .attr("baseline-shift", "sub")
        .attr("font-size", "10")
        .text("r");

var angles = svg.append("path").attr("id", "arc");

function updateAngles(){
    theta = Math.abs(Math.atan(coords.m));

    cost = Math.abs(Math.cos(theta));
    sint = Math.abs(Math.sin(theta));

    // FIXME
    // Can this be cleaned up / refactored at all?

    angles.attr("d", "M " + coords.x3 + " " + coords.h
        + " L " + (coords.x3 + angle_radius * cost) + " " + (coords.h - angle_radius * sint)
        +" A " + angle_radius + " " + angle_radius + " 0 0 0 " + (coords.x3 - angle_radius * cost) + " " + (coords.h - angle_radius * sint)
        + "L " + coords.x3 + " " + coords.h
        +" M " + (coords.x3 + 0.8 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2)))
        +" L " + (coords.x3 + 1.2 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2)))
        +" M " + (coords.x3 - 0.8 * angle_radius * Math.abs(Math.cos(((3*Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((3*Math.PI / 2) - theta) / 2)))
        +" L " + (coords.x3 - 1.2 * angle_radius * Math.abs(Math.cos(((3*Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((3*Math.PI / 2) - theta) / 2)))
        + " M " + coords.x3 + " " + coords.h 
        + " L " + coords.x3 + " " + (coords.h - 1.2 * angle_radius)
        + " Z");

        //  angles.attr("d", "M " + coords.x3 + " " + coords.h +
        //      " L " + (coords.x3 + angle_radius * cost) + " " + (coords.h - angle_radius * sint) +
        //      " A " + angle_radius + " " + angle_radius + " 0 0 0 " + (coords.x3) + " " + (coords.h - angle_radius) +
        //      "L " + coords.x3 + " " + coords.h +
        //      " L " + (coords.x3 - angle_radius * cost) + " " + (coords.h - angle_radius * sint) +
        //      " A " + angle_radius + " " + angle_radius + " 0 0 1 " + (coords.x3) + " " + (coords.h - angle_radius) +
        //      " M " + (coords.x3 + 0.8 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2))) +
        //      " L " + (coords.x3 + 1.2 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2))) +
        //      " M " + (coords.x3 - 0.8 * angle_radius * Math.abs(Math.cos(((3 * Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((3 * Math.PI / 2) - theta) / 2))) +
        //      " L " + (coords.x3 - 1.2 * angle_radius * Math.abs(Math.cos(((3 * Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((3 * Math.PI / 2) - theta) / 2))) +
        //      " M " + coords.x3 + " " + coords.h +
        //      " L " + coords.x3 + " " + (coords.h - 1.2 * angle_radius) +
        //      " Z");
}

updateAngles();

function dragstarted(d){
    d3.select(this).raise().classed("active", true);
}

function dragged(d, i){
    d3.select(this)
        .attr("cx", d.x = clamp(d3.event.x, 0, w))
        .attr("cy", d.y = i == 1 ? Math.max(Math.min(coords.h, d3.event.y), handles[0].y + 2 * handle_radius) : Math.min(Math.max(0,d3.event.y), handles[1].y - 2 * handle_radius));

    if(handles[0].x == handles[1].x) return;

    updateCoords();

    svg.select("#incident")
        .attr("x1", coords.x1)
        .attr("y1", coords.y1)
        .attr("x2", coords.x3)
    
    svg.select("#reflection")
        .attr("x1", coords.x3)
        .attr("x2", coords.x4)
        .attr("y2", coords.y4);

    svg.select("#thetai")
        .attr("x", coords.x3 + (coords.x2 - coords.x1 > 0 ? -2*angle_radius/3 : angle_radius/3) )

    svg.select("#thetaf")
        .attr("x", coords.x3 + (coords.x2 - coords.x1 < 0 ? -2 * angle_radius / 3 : angle_radius / 3) )

    updateAngles();
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