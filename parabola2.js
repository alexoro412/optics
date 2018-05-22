(function () {
    let w = 800,
        h = 350;

    let sim = new Sim("#beaming_parabola", h, w);

    let x1 = 400,
        y1 = -25,
        x2 = 0,
        y2 = -25;

    sim.add_thins([
        new Bezier(216 + x1, 100 + y1,
            362.666 + x1, 166.666 + y1,
            362.666 + x1, 233.333 + y1,
            216 + x1, 300 + y1),
        new Bezier(216 + x2, 100 + y2,
            69.334 + x2, 166.666 + y2,
            69.334 + x2, 233.333 + y2,
            216 + x2, 300 + y2)
    ], {
        style: "hollow mirror thick",
        reflective: true
    })

    let cone = new ConeLamp({
        x: 68,
        y: 175,
        angle: Math.PI,
        width: 2 * Math.PI / 3,
        handle_gap: 30,
        max_bounce: 3,
        ui: {
            max_x: w
        }
    })
    sim.add_light(cone);
})();