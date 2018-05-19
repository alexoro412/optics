(function () {
    let w = 400,
        h = 350,
        angle_radius = 15,
        handle_radius = 10,
        dome_radius = 120;

    let coords = {
        h: h - dome_radius - 10
    }

    let svg = d3.select("#reflection_dish")
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })

    let space = new Space();

    let dome = new Arc(w / 2 - dome_radius, coords.h, w / 2 + dome_radius, coords.h, w / 2, coords.h + dome_radius);

    // let dome_left = new Circle(w/2, coords.h, dome_radius, true);
    // dome_left.reflective = true;
    // dome_left.arc(w / 2 - dome_radius, coords.h, w / 2, coords.h + dome_radius, dome_radius, 0, 1);

    // let dome_right = new Circle();
    // dome_right.reflective = true;
    // dome_right.arc(w / 2, coords.h + dome_radius, w / 2 + dome_radius, coords.h, dome_radius, 0, 1);

    space.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        // dome_left,
        // dome_right,
        dome,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], {
        reflective: true,
        style: "solid mirror"
    })

    space.add_borders();

    space.install(svg);

    let beam = new Beam(100, 100, 200, 200, 30, 200, "down");
    beam.install(svg, space);
})();