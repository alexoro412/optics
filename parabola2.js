(function () {
    let w = 350,
        h = 450;

    let sim = new Sim("#beaming_parabola", h, w);

    let x1 = 100,
        y1 = -25,
        x2 = -70,
        y2 = -25;

    let para1 = new Parabola(w/2, 50, 0.01, 100);
    let para1_id = sim.add_thin(
        para1.shape(), {
        reflective: true,
        style: "thick hollow mirror",
        reflectance: 1.0
    });

    let slider1 = new Slider({
        x: w/2 - 65,
        y: 15,
        length: 130,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 0.005,
        num_decimals: 4,
        min: 0.002,
        max: 0.01,
        text_dx: 0,
        text_dy: 25,
        callback: function(value){
            para1.a = value;
            para1.recalc();
            sim.update_shape_geometry(para1_id, para1.shape())
            return `Focal Length: ${(1/(4*value)).toFixed(0)} px`
        }
    })
    sim.add_ui(slider1);

    let para2 = new Parabola(w/2, 450 - 50, -0.01, 100);
    let para2_id = sim.add_thin(
        para2.shape(), 
        {
            reflective: true,
            style: "thick hollow mirror", 
            reflectance: 1.0
        }
    )
    let slider2 = new Slider({
        x: w / 2 + 65,
        y: h - 30,
        length: 130,
        angle: Math.PI,
        style: "slider",
        handle_style: "slider-handle handle",
        value: -0.005,
        num_decimals: 4,
        min: -0.01,
        max: -0.002,
        text_dx: -130,
        text_dy: 25,
        callback: function (value) {
            para2.a = value;
            para2.recalc();
            sim.update_shape_geometry(para2_id, para2.shape())
            return `Focal Length: ${(-1/(4*value)).toFixed(0)} px`
        }
    })
    sim.add_ui(slider2);

    let cone = new ConeLamp({
        x: 175.66,
        y: 99.5,
        angle: -Math.PI/2,
        width: 2 * Math.PI / 3,
        handle_gap: 30,
        max_bounce: 3,
        ui: {
            max_x: w,
            max_y: h
        }
    })
    sim.add_light(cone);
})();