(function () {
    let w = 400,
        h = 350,
        angle_radius = 35,
        handle_radius = 10;

    let handle = {
        x: 41,
        y: 129
    }


    let coords = {};

    function updateCoords() {
        coords.x2 = w / 2;
        coords.y2 = 2 * h / 3;

        coords.m = ((handle.y - coords.y2) / (handle.x - coords.x2))

        coords.x1 = handle.x;
        coords.y1 = handle.y;



        coords.h = 2 * h / 3;
        coords.x3 = (coords.h - coords.y1) / coords.m + coords.x1;

        coords.x4 = coords.x1 > coords.x2 ? 0 : w;
        coords.y4 = -coords.m * (coords.x4 - ((coords.h - coords.y1) / coords.m + coords.x1)) + coords.h;

    }

    updateCoords();

    let svg = d3.select("#reflection_flat")
        .append("svg")
        .attr("class", "sim")
        .attr("width", w)
        .attr("height", h);


    let mirror = svg.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", coords.h)
        .attr("y2", coords.h)
        .attr("class", "mirror");

    let block = svg.append("rect")
        .attr("x", 0)
        .attr("y", coords.h)
        .attr("width", w)
        .attr("height", h - coords.h)
        .attr("class", "solid mirror");

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
        .attr("x", coords.x3 - 2 * angle_radius / 3)
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

    let angles = svg.append("path").attr("class", "arc");

    function updateAngles() {
        theta = Math.abs(Math.atan(coords.m));

        cost = Math.abs(Math.cos(theta));
        sint = Math.abs(Math.sin(theta));

        // FIXME
        // Can this be cleaned up / refactored at all?

        angles.attr("d", "M " + coords.x3 + " " + coords.h +
            " L " + (coords.x3 + angle_radius * cost) + " " + (coords.h - angle_radius * sint) +
            " A " + angle_radius + " " + angle_radius + " 0 0 0 " + (coords.x3 - angle_radius * cost) + " " + (coords.h - angle_radius * sint) +
            "L " + coords.x3 + " " + coords.h +
            " M " + (coords.x3 + 0.8 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2))) +
            " L " + (coords.x3 + 1.2 * angle_radius * Math.abs(Math.cos(((-Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((-Math.PI / 2) - theta) / 2))) +
            " M " + (coords.x3 - 0.8 * angle_radius * Math.abs(Math.cos(((3 * Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 0.8 * Math.abs(Math.sin(((3 * Math.PI / 2) - theta) / 2))) +
            " L " + (coords.x3 - 1.2 * angle_radius * Math.abs(Math.cos(((3 * Math.PI / 2) - theta) / 2))) + " " + (coords.h - angle_radius * 1.2 * Math.abs(Math.sin(((3 * Math.PI / 2) - theta) / 2))) +
            " M " + coords.x3 + " " + coords.h +
            " L " + coords.x3 + " " + (coords.h - 1.2 * angle_radius) +
            " Z");
    }

    updateAngles();

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {

        d3.select(this)
            .attr("cx", d.x = clamp(d3.event.x, 0, w))
            .attr("cy", d.y = clamp(d3.event.y, 0, coords.h - handle_radius));

        if (handle.x == coords.x2) return;

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
            .attr("x", coords.x3 + (coords.x2 - coords.x1 > 0 ? -2 * angle_radius / 3 : angle_radius / 3))

        svg.select("#thetaf")
            .attr("x", coords.x3 + (coords.x2 - coords.x1 < 0 ? -2 * angle_radius / 3 : angle_radius / 3))

        updateAngles();
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
    }

     svg.selectAll("circle")
         .data([handle])
         .enter().append("circle")
         .attr("cx", function (d) {
             return d.x;
         })
         .attr("cy", function (d) {
             return d.y;
         })
         .attr("r", handle_radius)
         .attr("class", "handle")
         .call(d3.drag()
             .on("start", dragstarted)
             .on("drag", dragged)
             .on("end", dragended));
})();

// FOR PARABOLIC REFLECTOR

// let mirror = [

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