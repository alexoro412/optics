(function () {
    let w = 400,
        h = 350;

    let lens_height = 120;

    let lens_width = 40;

    let sim = new Sim("#focus_lens", h, w);

    let lens = sim.add_solid([
        new Arc(w / 2, h / 2 - lens_height, w / 2, h / 2 + lens_height, w / 2 - lens_width, h / 2),
        new Arc(w / 2, h / 2 + lens_height, w / 2, h / 2 - lens_height, w / 2 + lens_width, h / 2)
    ], {
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    })

    function update_lens() {
        sim.update_shape_geometry(lens, [
            new Arc(w / 2, h / 2 - lens_height, w / 2, h / 2 + lens_height, w / 2 - lens_width, h / 2),
            new Arc(w / 2, h / 2 + lens_height, w / 2, h / 2 - lens_height, w / 2 + lens_width, h / 2)
        ]);
    }

    let beam = new Beam(10, h / 2, 40, h / 2, 10, 80, 0);
    sim.add_beam(beam);

    let height_slider = new Slider({
        x: w / 2,
        y: h / 2 - 10,
        length: lens_height - 10,
        min: 10,
        max: lens_height,
        value: lens_height,
        angle: -Math.PI / 2,
        handle_style: "thandle handle",
        callback: function (value) {
            lens_height = value;
            update_lens();
        }
    })

    let width_slider = new Slider({
        x: w / 2 + 5,
        y: h / 2,
        length: lens_width - 5,
        min: 5,
        handle_style: "thandle handle",
        max: lens_width,
        value: lens_width,
        angle: 0,
        callback: function (value) {
            lens_width = value;
            update_lens();
        }
    })

    let ior_slider = new Slider({
        x: 150,
        y: 300,
        length: 120,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 1.5,
        num_decimals: 2,
        callback: function (value) {
            sim.update_shape_opts(lens, {
                ior: value
            })
            return "IOR: " + value;
        },
        text_dx: -73,
        text_dy: 3.5,
        min: 1,
        max: 4
    })

    sim.add_ui(height_slider);
    sim.add_ui(width_slider);
    sim.add_ui(ior_slider);
})();