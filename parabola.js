(function () {
    let w = 400,
        h = 350;

    let coords = {
        h: 216
    }

    let sim = new Sim("#reflection_parabola", h, w)

    let para_id = sim.add_solid([
        new Line(0, coords.h, 100, coords.h),
        new Bezier(100, 216,
            166.666, 362.666,
            233.333, 362.666, 300, 216),
        new Line(300, coords.h, w, coords.h),
        new Line(w, coords.h, w, h),
        new Line(w, h, 0, h),
        new Line(0, h, 0, coords.h)
    ], {
        reflective: true,
        style: "solid mirror",
        reflectance: 1.0
    });

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
})();