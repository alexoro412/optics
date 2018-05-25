(function(){
    let w = 400,
        h = 350,
        dome_radius = 120;

    let coords = {
        h: 4 * h / 5
    }

    let sim = new Sim("#curved_glass", h, w);

    let root2over2 = Math.sqrt(2) / 2;

    let dome_left = new Arc(w / 2 - dome_radius, coords.h, w / 2, coords.h - dome_radius, w / 2 - dome_radius * (1 - root2over2), coords.h - dome_radius * (1 - root2over2));

    let dome_right = new Arc(w / 2, coords.h - dome_radius, w / 2 + dome_radius, coords.h, w / 2 + dome_radius * root2over2, coords.h - dome_radius * root2over2);

    let dome = sim.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        dome_left,
        dome_right,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], {
        refractive: true,
        ior: 3,
        style: "solid glass"
    })

    let beam = new Beam({
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        num_rays: 10,
        width: 20,
        ui: {},
        max_bounce: 2
    })
    sim.add_light(beam);

    let slider = new Slider({
        x: 20,
        y: 315,
        length: 120,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 2,
        num_decimals: 0,
        callback: function (value) {
            // sim.update_shape_opts(beam, {
            //     max_bounce: value
            // })
            beam.max_bounce = value;
            beam.updateRays();
            beam.drawRays();
            return "Bounces: " + (value-1);
        },
        text_dx: 0,
        text_dy: 24,
        min: 1,
        max: 11
    })
    sim.add_ui(slider);

    let ior_slider = new Slider({
        x: 260,
        y: 315,
        length: 120,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 3,
        num_decimals: 1,
        callback: function (value) {
            sim.update_shape_opts(dome, {
                ior: value
            })
            return "IOR: " + value;
        },
        text_dx: 0,
        text_dy: 24,
        min: 1,
        max: 4
    })
    sim.add_ui(ior_slider);
})();