(function () {
    let w = 400,
        h = 350;

    let sim = new Sim("#fiber", h, w);

    // let handles = [{
    //         x: 22,
    //         y: 153
    //     },
    //     {
    //         x: 144,
    //         y: 32
    //     },
    //     {
    //         x: 218,
    //         y: 237
    //     },
    //     {
    //         x: 375,
    //         y: 92
    //     }
    // ];

    // let bezier = sim.add_solid([
    //     new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
    //         handles[2].x, handles[2].y,
    //         handles[3].x, handles[3].y),
    //     new Line(handles[3].x, handles[3].y, handles[3].x, handles[3].y + fiber.thickness),
    //     new Bezier(handles[3].x, handles[3].y + fiber.thickness, 
    //         handles[2].x, handles[2].y + fiber.thickness,
    //         handles[1].x, handles[1].y + fiber.thickness,
    //         handles[0].x, handles[0].y + fiber.thickness),
    //     new Line(handles[0].x, handles[0].y + fiber.thickness, handles[0].x, handles[0].y)], {
    //         refractive: true,
    //         ior: 1.5,
    //         style: "solid glass",
    //         reflectance: 0.5
    //     })

    // function update_fiber(x,y){
    //     sim.update_shape_geometry(bezier, [new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
    //             handles[2].x, handles[2].y,
    //             handles[3].x, handles[3].y),
    //         new Line(handles[3].x, handles[3].y, handles[3].x, handles[3].y + fiber.thickness),
    //         new Bezier(handles[3].x, handles[3].y + fiber.thickness,
    //             handles[2].x, handles[2].y + fiber.thickness,
    //             handles[1].x, handles[1].y + fiber.thickness,
    //             handles[0].x, handles[0].y + fiber.thickness),
    //         new Line(handles[0].x, handles[0].y + fiber.thickness, handles[0].x, handles[0].y)
    //     ])
    // }

    // for (let i = 0; i < 4; i++) {
    //     handles[i] = new Point({
    //         x: handles[i].x,
    //         y: handles[i].y,
    //         max_x: w,
    //         max_y: h,
    //         num_decimals: 2,
    //         callback: update_fiber,
    //         radius: 7,
    //         style: "slider-handle handle"
    //     })
    //     sim.add_ui(handles[i])
    // }

    // sim.add_rect(50,60,fiber.thickness,250,{
    //     style: "solid glass",
    //     refractive: true,
    //     ior: 1.5
    // })

    // let fiber.thickness = 40;
    let fiber = {
        x1: 50,
        y1: 60,
        l1: 200,
        l2: 180,
        r: 30,
        thickness: 40,
    }

    let root2over2 = Math.sqrt(2) / 2;

    // console.log(50 + fiber.thickness, 260, 50 + fiber.thickness + 40, 300, 50 + fiber.thickness + 40 - root2over2 * 40, 300 - root2over2 * 40);

    let fiber_shape = sim.add_solid([
        new Line(fiber.x1, fiber.y1, fiber.x1 + fiber.thickness, fiber.y1),
        new Line(fiber.x1 + fiber.thickness, fiber.y1, fiber.x1 + fiber.thickness, fiber.y1 + fiber.l1),

        new Arc(fiber.x1 + fiber.thickness, fiber.y1 + fiber.l1,
            fiber.x1 + fiber.thickness + fiber.r, fiber.y1 + fiber.l1 + fiber.r,
            fiber.x1 + fiber.thickness + fiber.r - root2over2 * fiber.r, fiber.y1 + fiber.l1 + root2over2 * fiber.r),
        new Line(fiber.x1 + fiber.thickness + fiber.r, fiber.y1 + fiber.l1 + fiber.r, fiber.x1 + fiber.thickness + fiber.r + fiber.l2, fiber.y1 + fiber.l1 + fiber.r),
        new Line(fiber.x1 + fiber.thickness + fiber.r + fiber.l2, fiber.y1 + fiber.l1 + fiber.r, fiber.x1 + fiber.thickness + fiber.r + fiber.l2, fiber.y1 + fiber.l1 + fiber.r + fiber.thickness),

        new Line(fiber.x1 + fiber.thickness + fiber.r + fiber.l2, fiber.y1 + fiber.l1 + fiber.r + fiber.thickness,
            fiber.x1 + fiber.r + fiber.thickness, fiber.y1 + fiber.l1 + fiber.r + fiber.thickness),

        new Arc(fiber.x1 + fiber.r + fiber.thickness, fiber.y1 + fiber.l1 + fiber.r + fiber.thickness,
            fiber.x1, fiber.y1 + fiber.l1,
            fiber.x1 + fiber.r + fiber.thickness - root2over2 * (fiber.r + fiber.thickness), fiber.y1 + fiber.l1 + root2over2 * (fiber.r + fiber.thickness)),
        new Line(fiber.x1, fiber.y1 + fiber.l1, fiber.x1, fiber.y1)
    ], {
        style: "solid glass",
        refractive: true,
        ior: 1.5
    })

    let mirror = {
        x1: 100,
        y1: 60,
        l1: 150,
        l2: 130,
        r: 30,
        thickness: 40,
    }
        
    let mirror_shape = sim.add_thins([
        // new Line(fiber.x1, fiber.y1, fiber.x1 + fiber.thickness, fiber.y1),
        new Line(mirror.x1 + mirror.thickness, mirror.y1, mirror.x1 + mirror.thickness, mirror.y1 + mirror.l1),

        new Arc(mirror.x1 + mirror.thickness, mirror.y1 + mirror.l1,
            mirror.x1 + mirror.thickness + mirror.r, mirror.y1 + mirror.l1 + mirror.r,
            mirror.x1 + mirror.thickness + mirror.r - root2over2 * mirror.r, mirror.y1 + mirror.l1 + root2over2 * mirror.r),
        new Line(mirror.x1 + mirror.thickness + mirror.r, mirror.y1 + mirror.l1 + mirror.r, 
            mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r),
        // new Line(mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r, mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness),

        new Line(mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness,
            mirror.x1 + mirror.r + mirror.thickness, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness),

        new Arc(mirror.x1 + mirror.r + mirror.thickness, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness,
            mirror.x1, mirror.y1 + mirror.l1,
            mirror.x1 + mirror.r + mirror.thickness - root2over2 * (mirror.r + mirror.thickness), mirror.y1 + mirror.l1 + root2over2 * (mirror.r + mirror.thickness)),
        new Line(mirror.x1, mirror.y1 + mirror.l1, 
            mirror.x1, mirror.y1)
    ], {
        style: "thick hollow mirror",
        reflective: true,
        reflectance: 0.6,
        // refractive: true,
        // ior: 1.5
    })

    sim.add_solid([
        new Line(mirror.x1, mirror.y1, mirror.x1 + mirror.thickness, mirror.y1),
        new Line(mirror.x1 + mirror.thickness, mirror.y1, mirror.x1 + mirror.thickness, mirror.y1 + mirror.l1),

        new Arc(mirror.x1 + mirror.thickness, mirror.y1 + mirror.l1,
            mirror.x1 + mirror.thickness + mirror.r, mirror.y1 + mirror.l1 + mirror.r,
            mirror.x1 + mirror.thickness + mirror.r - root2over2 * mirror.r, mirror.y1 + mirror.l1 + root2over2 * mirror.r),
        new Line(mirror.x1 + mirror.thickness + mirror.r, mirror.y1 + mirror.l1 + mirror.r,
            mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r),
        new Line(mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r, mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness),

        new Line(mirror.x1 + mirror.thickness + mirror.r + mirror.l2, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness,
            mirror.x1 + mirror.r + mirror.thickness, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness),

        new Arc(mirror.x1 + mirror.r + mirror.thickness, mirror.y1 + mirror.l1 + mirror.r + mirror.thickness,
            mirror.x1, mirror.y1 + mirror.l1,
            mirror.x1 + mirror.r + mirror.thickness - root2over2 * (mirror.r + mirror.thickness), mirror.y1 + mirror.l1 + root2over2 * (mirror.r + mirror.thickness)),
        new Line(mirror.x1, mirror.y1 + mirror.l1,
            mirror.x1, mirror.y1)
    ], {
        style: "solid mirror nostroke",
        transparent: true,
    })

    let beam = new Beam({
        x1: 130, y1: 43,
        x2: 115, y2: 73,
        num_rays: 10,
        ui: {}
    })

    let slider = new Slider({
        x: 230,
        y: 70,
        length: 120,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 1.5,
        num_decimals: 2,
        callback: function (value) {
            sim.update_shape_opts(fiber_shape, {
                ior: value
            })
            return "IOR: " + value;
        },
        text_dx: 0,
        text_dy: 25,
        min: 1,
        max: 4
    })

    sim.add_ui(slider);

    let slider2 = new Slider({
        x: 230,
        y: 140,
        length: 120,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 0.6,
        num_decimals: 2,
        callback: function (value) {
            sim.update_shape_opts(mirror_shape, {
                reflectance: value
            })
            return `Reflectance: ${(value*100).toFixed(0)}%`;
        },
        text_dx: 0,
        text_dy: 25,
        min: 0,
        max: 1
    })

    sim.add_ui(slider2);



    sim.add_light(beam);
})();