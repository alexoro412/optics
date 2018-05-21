

(function(){
    let w = 400,
        h = 350,
        angle_radius = 15,
        handle_radius = 10,
        dome_radius = 120;

    let coords = {
        h: 216
    }

    let sim = new Sim("#reflection_parabola", h, w)

    let para_id = sim.add_solid([
        new Line(0,coords.h, 100, coords.h),
        new Bezier(100, 216,
        166.666, 362.666,
        233.333, 362.666, 300, 216),
        new Line(300, coords.h, w, coords.h),
        new Line(w, coords.h, w, h),
        new Line(w,h,0,h),
        new Line(0,h,0,coords.h)], {
            reflective: true,
            style: "solid mirror",
            reflectance: 1.0
        });

    console.log("para id", para_id);

    sim.add_circle(new Circle(100,80,24), {
        reflective: false,
        style: "solid water"
    })

    setTimeout(function(){
        sim.add_solid([], {
            reflectance: 0.5
        }, para_id);
    }, 2000)

    let beam = new Beam(48,106,0,0,10,100, "down");
    // beam.install(svg, space);
    sim.add_beam(beam);

    console.log(sim.space);
})();