

(function(){
    let w = 400,
        h = 350,
        angle_radius = 15,
        handle_radius = 10,
        dome_radius = 120;

    let coords = {
        h: 216
    }

    // let svg = d3.select("#reflection_parabola")
    //     .append("svg")
    //     .attrs({
    //         class: "sim",
    //         height: h,
    //         width: w
    //     })

    let svg = make_sim("#reflection_parabola", h, w);

    let space = new Space();

    space.add_solid([
        new Line(0,coords.h, 100, coords.h),
        new Bezier(100, 216,
        166.666, 362.666,
        233.333, 362.666, 300, 216),
        new Line(300, coords.h, w, coords.h),
        new Line(w, coords.h, w, h),
        new Line(w,h,0,h),
        new Line(0,h,0,coords.h)], {
            reflective: true,
            style: "solid mirror"
        });

    space.add_borders();

    space.install(svg);

    let beam = new Beam(48,106,0,0,10,100, "down");
    beam.install(svg, space);
})();