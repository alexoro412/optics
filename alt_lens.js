(function(){
    let w = 400,
        h = 350;

    let sim = new Sim("#alt_lens",h,w);

    let para = new Parabola(w/2,150,-0.01,100);

    let para_id = sim.add_solid(
        [para.shape(),
        new Line(para.x[0], para.y[0], para.x[3], para.y[3])],
        {
            refractive: true,
            style: "solid glass",
            ior: 1.5
        }
    )

    let beam = new Beam({
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        angle: Math.PI/2,
        ui: {},
        width: 80,
        num_rays: 10,
        strength: 1
    })

    sim.add_light(beam);
})();