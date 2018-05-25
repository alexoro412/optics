(function () {
    let w = 400,
        h = 350;

    let coords = {
        h: 216
    }

    let sim = new Sim("#reflection_parabola", h, w)

    let P_h = w / 2,
        P_k = 300, // (P_h, P_k) is the vertex of the parabola
        P_w = 100; // width of parabola

    let P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y;

    let P_a = -0.0084;

    function f(x) {
        return P_a * (x - P_h) ** 2 + P_k;
    }

    function g(x) {
        return 2 * P_a * (P0x - P_h) * (x - P0x) + P0y;
    }

    function recalc_parabola() {

        P0x = P_h - P_w
        P0y = f(P0x)
        P3x = P_h + P_w
        P3y = f(P3x); // First and last control points

        P1x = (4 / 3) * (((2 * P_h - P_w) / 2) - (P_h - P_w)) + (P_h - P_w)
        P1y = g(P1x)
        P2x = 2 * P_h - P1x
        P2y = P1y;

    }

    recalc_parabola();

    let para_id = sim.add_solid([
        new Bezier(P0x, P0y,
            P1x, P1y,
            P2x, P2y,
            P3x, P3y),
        new Line(P3x, P3y, P3x, h),
        new Line(P3x, h, P0x, h),
        new Line(P0x, h, P0x, P0y)
    ], {
        reflective: true,
        style: "solid mirror",
        reflectance: 1.0
    });

    sim.add_thins([
        new Line(100, 0, 100, h),
        new Line(300, 0, 300, h),
        // new Line(300,h/2,w,h/2)
    ], {
        style: "mirror"
    })

    // let beam = new Beam(48, 106, 0, 0, 10, 100, Math.PI / 2);
    let beam = new Beam({
        x1: 48,
        y1: 106,
        num_rays: 20,
        width: 100,
        angle: Math.PI / 2,
        ui: {}
    })
    sim.add_light(beam);

    let cone = new ConeLamp({
        x: 350,
        y: 60,
        angle: Math.PI / 2,
        width: 2 * Math.PI / 3,
        handle_gap: 30,
        ui: {
            max_y: h - 30,
            style: "thandle handle"
        }
    })

    sim.add_light(cone);

    let slider = new Slider({
        x: w/2 + 65,
        y: 315,
        length: 130,
        angle: Math.PI,
        style: "slider", 
        handle_style: "slider-handle handle",
        value: -0.005,
        num_decimals: 4,
        text_dx: -130,
        text_dy: 25,
        callback: function(value){
            P_a = value
            recalc_parabola();
            sim.update_shape_geometry(para_id, [
                new Bezier(P0x, P0y,
                    P1x, P1y,
                    P2x, P2y,
                    P3x, P3y),
                new Line(P3x, P3y, P3x, h),
                new Line(P3x, h, P0x, h),
                new Line(P0x, h, P0x, P0y)
            ]);
            return `Focal Length: ${(-1/(4*value)).toFixed(0)} px`
        },
        min: -0.01,
        max: -0.001
    })

    sim.add_ui(slider);
})();