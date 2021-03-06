(function () {
    let w = 400,
        h = 350,
        dome_radius = 120;

    let coords = {
        h: 4 * h / 5
    }

    let sim = new Sim("#reflection_dome", h, w)

    let root2over2 = Math.sqrt(2) / 2;

    let dome_left = new Arc(w / 2 - dome_radius, coords.h, w / 2, coords.h - dome_radius, w / 2 - dome_radius * (1 - root2over2), coords.h - dome_radius * (1 - root2over2));

    let dome_right = new Arc(w / 2, coords.h - dome_radius, w / 2 + dome_radius, coords.h, w / 2 + dome_radius * root2over2, coords.h - dome_radius * root2over2);

    sim.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        dome_left,
        dome_right,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], {
        reflective: true,
        style: "solid mirror"
    })

    let beam = new Beam({
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        num_rays: 10,
        width: 20,
        ui: {}
    })
    sim.add_light(beam);
})();