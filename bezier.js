(function () {
    let w = 400,
        h = 350;

    let sim = new Sim("#bezier", h, w);

    let handles = [{
            x: 22,
            y: 153
        },
        {
            x: 144,
            y: 32
        },
        {
            x: 218,
            y: 237
        },
        {
            x: 375,
            y: 92
        }
    ];

    let bezier = sim.add_thin(
        new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
            handles[2].x, handles[2].y,
            handles[3].x, handles[3].y), {
            reflective: true,
            style: "mirror",
            reflectance: 0.5
        })

    let lines = sim.add_thins([
        new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y),
        new Line(handles[2].x, handles[2].y, handles[3].x, handles[3].y)
    ], {
        transparent: true,
        style: "bezier-line"
    })

    sim.add_thins([
        new Line(0, h - 50, w, h - 50),
        new Line(w / 2, h - 50, w / 2, h)
    ], {
        style: "mirror"
    })

    function update_bezier(x, y) {
        sim.update_shape_geometry(bezier, new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
            handles[2].x, handles[2].y,
            handles[3].x, handles[3].y));
        sim.update_shape_geometry(lines, [
            new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y),
            new Line(handles[2].x, handles[2].y, handles[3].x, handles[3].y)
        ])
    }

    for (let i = 0; i < 4; i++) {
        handles[i] = new Point({
            x: handles[i].x,
            y: handles[i].y,
            max_x: w,
            max_y: h,
            num_decimals: 2,
            callback: update_bezier,
            radius: 7,
            style: "slider-handle handle"
        })
        sim.add_ui(handles[i])
    }

    let lamp = new PointLamp({
        x: 313,
        y: 326,
        num_rays: 40,
        strength: 0.6,
        ui: {}
    });

    let beam = new Beam({
        x1: 22,
        y1: 215,
        x2: 106,
        y2: 176,
        num_rays: 10,
        width: 20,
        ui: {
            max_x: w,
            max_y: h,
            num_decimals: 2
        }
    })

    // let beam = new Beam(22, 215, 106, 176, 10, 20);
    sim.add_light(beam);
    sim.add_light(lamp);
    // sim.add_ui(lamp_handle);
})();