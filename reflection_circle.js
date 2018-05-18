(function () {
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

    let circle = new Circle(w / 2, h / 2, circle_radius);

    space.add_circle(circle, {
        reflective: true,
        style: "solid mirror"
    })

    space.add_thins([
        new Line(0, 0, 0, h),
        new Line(0, h, w, h),
        new Line(w, h, w, 0),
        new Line(w, 0, 0, 0)
    ], {
        reflective: false,
        style: "mirror"
    })

    space.install(svg);

    let beam = new Beam(116, 111, 200, 200, 10, 20);
    beam.install(svg, space);
})();