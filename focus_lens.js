(function () {
    let w = 400,
        h = 400,
        x_shift = 80,
        y_shift = 40;

    let lens_height = 120;

    let lens_width = 80;

    let sim = new Sim("#focus_lens", h, w);

    sim.add_thins([
        new Line(0,h-80,w,h-80),
        new Line(w/2,h-80,w/2,h)
    ],{
        style: "mirror"
    })

    let lens = sim.add_solid([
        new Arc(w / 2 - x_shift, h / 2 - lens_height - y_shift, w / 2 - x_shift, h / 2 + lens_height - y_shift, w / 2 - lens_width - x_shift, h / 2 - y_shift),
        new Arc(w / 2 - x_shift, h / 2 + lens_height - y_shift, w / 2 - x_shift, h / 2 - lens_height - y_shift, w / 2 + lens_width - x_shift, h / 2 - y_shift)
    ], {
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    })

    function update_lens() {
        sim.update_shape_geometry(lens, [
            new Arc(w / 2 - x_shift, h / 2 - lens_height - y_shift, w / 2 - x_shift, h / 2 + lens_height - y_shift, w / 2 - lens_width - x_shift, h / 2 - y_shift),
                new Arc(w / 2 - x_shift, h / 2 + lens_height - y_shift, w / 2 - x_shift, h / 2 - lens_height - y_shift, w / 2 + lens_width - x_shift, h / 2 - y_shift)
        ]);
    }

    // let beam = new Beam(10, h / 2, 40, h / 2, 10, 80, 0);
    let beam = new Beam({
        x1: 10,
        y1: h / 2 - y_shift,
        num_rays: 10,
        width: 70,
        angle: 0,
        ui: {
            max_y: h
        }
    })
    sim.add_light(beam);

    let cone = new ConeLamp({
        x: 350,
        y: 360,
        angle: Math.PI,
        width: Math.PI/8,
        fixed: true,
        ui:{
            max_y: h,
            style: "thandle handle"
        }
    })

    sim.add_light(cone);

    let height_slider = new Slider({
        x: w / 2 - x_shift,
        y: h / 2 - 10 - y_shift,
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
        x: w / 2 + 5 - x_shift,
        y: h / 2 - y_shift,
        length: lens_width - 5,
        min: 5,
        handle_style: "thandle handle",
        max: lens_width,
        value: lens_width / 2,
        angle: 0,
        callback: function (value) {
            lens_width = value;
            update_lens();
        }
    })

    let ior_slider = new Slider({
        x: 150,
        y: 300,
        length: 145,
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