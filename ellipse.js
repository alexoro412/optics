(function(){
    let w = 400,
        h = 450;

    let sim = new Sim("#ellipse", h, w);

    // sim.svg.attrs({
    //     "id": "ellipse"
    // })

    let e = new Ellipse(50,25,300,400);

    sim.add_solid(e.shapes, 
    {
        reflective: true,
        style: "solid white"
    })

    let beam = new PointLamp({
        x: 200, y: 92.7,
        max_bounce: 2,
        num_rays: 30,
        ui: {
            max_y: h
        }
    })

    sim.add_light(beam);
})();