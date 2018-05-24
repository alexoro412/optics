(function () {
    let w = 400,
        h = 350;

    let sim = new Sim("#refraction_test", h, w)

    sim.add_circle(new Circle(3 * w / 4, h / 3, 40), {
        reflective: false,
        refractive: true,
        style: "solid glass",
        ior: 1.5
    });

    sim.add_rect(30, 50, 70, 200, {
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    });

    let prism_width = 80;
    let prism_x = w / 2 - 40;
    let prism_y = h / 3

    sim.add_solid([
        new Line(prism_x, prism_y, prism_x + prism_width, prism_y),
        new Line(prism_x + prism_width, prism_y, prism_x + prism_width, prism_y + prism_width),
        new Line(prism_x + prism_width, prism_y + prism_width, prism_x, prism_y)
    ], {
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    })

    sim.add_solid([
        new Line(prism_x, prism_y, prism_x + prism_width, prism_y),
        new Line(prism_x + prism_width, prism_y, prism_x + prism_width, prism_y - prism_width),
        new Line(prism_x + prism_width, prism_y - prism_width, prism_x, prism_y)
    ], {
        refractive: true,
        ior: 4,
        style: "darkglass"
    })

    sim.add_solid([
        new Bezier(100 + 10, 216,
            166.666 + 10, 362.666,
            233.333 + 10, 362.666,
            300 + 10, 216),
        new Line(300 + 10, 216, 100 + 10, 216)
    ], {
        refractive: true,
        ior: 1.33333,
        style: "solid water"
    })

    let beam = new Beam({
        x1: 41,
        y1: 17,
        x2: 178,
        y2: 143,
        num_rays: 10,
        width: 20,
        strength: 0.8,
        ui: {},
        max_bounce: 2
    })

    sim.add_light(beam);
})();