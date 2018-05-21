(function () {
    let w = 400,
        h = 350,
        dome_radius = 120;

    let coords = {
        h: h - dome_radius - 10
    }

    let sim = new Sim("#reflection_dish", h, w)

    let dome = new Arc(w / 2 - dome_radius, coords.h, w / 2 + dome_radius, coords.h, w / 2, coords.h + dome_radius);

    let dish_id = sim.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        dome,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], {
        reflective: true,
        style: "solid mirror"
    })

    let beam = new Beam(100, 100, 0, 0, 30, 200, Math.PI / 2);
    sim.add_light(beam);

    let slider = new Slider({
        x: w / 2 + 10,
        y: coords.h,
        length: dome_radius - 10,
        min: 10,
        max: dome_radius,
        angle: 0,
        num_decimals: 0,
        value: dome_radius,
        callback: function (value) {
            dome_radius = value;
            sim.update_shape_geometry(dish_id, [
                new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
                new Arc(w / 2 - dome_radius, coords.h, w / 2 + dome_radius, coords.h, w / 2, coords.h + dome_radius),
                new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
                new Line(w, coords.h, w, h, true),
                new Line(w, h, 0, h, true),
                new Line(0, h, 0, coords.h, true)
            ])
        }
    })

    sim.add_ui(slider);
})();