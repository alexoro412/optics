(function() {
    let w = 400,
        h = 350,
        circle_radius = 120;

    let svg = d3.select("#reflection_circle")
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })

    let space = new Space();

    let arc = new Arc(w/2 - circle_radius, h/2, w/2 + circle_radius, h/2, w/2, h/2 + circle_radius);

    space.add_thins([
        arc
    ], true, "mirror");

    space.add_thins([
        new Line(0,0,0,h),
        new Line(0,h,w,h),
        new Line(w,h,w,0),
        new Line(w,0,0,0)
    ], false, "")

    space.install(svg);

    // svg.append("g").attr("id", "space")
    //     .selectAll("path").data(space.draw()).enter().append("path")
    //     .attrs({
    //         class: function (d) {
    //             return d.class;
    //         },
    //         d: function (d) {
    //             return d.path;
    //         }
    //     })

        let beam = new Beam(100, 100, 200, 200, 10, 20);
        beam.install(svg, space);
})();