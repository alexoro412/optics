(function () {
    let w = 400,
        h = 350,
        dome_radius = 120;

    let coords = {
        h: h - dome_radius - 10
    }

    let sim = new Sim("#reflection_dish", h, w)

    let dome = new Arc(w / 2 - dome_radius, coords.h, w / 2 + dome_radius, coords.h, w / 2, coords.h + dome_radius);

    sim.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        // dome_left,
        // dome_right,
        dome,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], {
        reflective: true,
        style: "solid mirror"
    })

    let beam = new Beam(100, 100, 200, 200, 30, 200, "down");
    sim.add_beam(beam);
})();