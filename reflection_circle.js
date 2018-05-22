(function () {
    let w = 400,
        h = 350,
        circle_radius = 120;

    let sim = new Sim("#reflection_circle", h, w)

    let circle = new Circle(w / 2, h / 2, circle_radius);

    sim.add_circle(circle, {
        reflective: true,
        style: "solid mirror"
    })

    // let beam = new Beam(116, 111, 200, 200, 10, 20);
    let beam = new Beam({
        x1: 116,
        y1: 111,
        x2: 200,
        y2: 200,
        num_rays: 10,
        width: 20,
        ui: {}
    })
    sim.add_light(beam);
})();