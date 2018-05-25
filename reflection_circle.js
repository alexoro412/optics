(function () {
    let w = 400,
        h = 350,
        circle_radius = 120;

    let sim = new Sim("#reflection_circle", h, w)

    let circle = new Circle(w / 2, h / 2, circle_radius);

    let border_width = 150;

    sim.add_solid([
        new Line(0, border_width, border_width, 0),
        new Line(border_width, 0, w - border_width, 0),
        new Line(w - border_width, 0, w, border_width),
        new Line(w, border_width, w, h - border_width),
        new Line(w, h - border_width, w - border_width, h),
        new Line(w - border_width, h, border_width, h),
        new Line(border_width, h, 0, h - border_width),
        new Line(0, h - border_width, 0, border_width)
        // new Line(0,h-border_width,border_width,h),
        // new Line(w-border_width,h,w,h-border_width)
    ], {
        style: "solid mirror"
    })

    sim.add_circle(circle, {
        reflective: true,
        style: "solid white"
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

    let lamp = new PointLamp({
        x: 40, y:80,
        num_rays: 30,
        ui: {}
    })
    sim.add_light(lamp);

    let cone = new ConeLamp({
        x: 380, y: 340,
        num_rays: 20,
        angle: -3*Math.PI/4,
        width: Math.PI/4,
        handle_gap: 60,
        ui: {
        }
    })
    sim.add_light(cone);
})();