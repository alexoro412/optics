(function () {
    let w = 400,
        h = 350;

    let sim = new Sim("#planet_shadows", h, w);

    let atmosGradient = sim.svg.append("defs").append("radialGradient")
        .attrs({
            id: "atmosGradient"
        })

    atmosGradient.append("stop").attrs({
        offset: "0%",
        "stop-color": "rgba(155, 192, 241, 1)"
    })

    atmosGradient.append("stop").attrs({
        offset: "98%",
        "stop-color": "rgba(155, 192, 241, 0)"
    })

    let atmos_c = new Circle(w / 2, h / 2 - 70, 55);

    let atmos = sim.add_circle(atmos_c, {
        style: "solid atmos",
        refractive: true,
        ior: 1.15
    })

    let planet_c = new Circle(w / 2, h / 2 - 70, 35);

    let planet = sim.add_circle(planet_c, {
        style: "solid moon"
    })

    

    let beam = new ConeLamp({
        x: 20,
        y: 3 * h / 4,
        width: Math.PI / 4,
        num_rays: 30,
        angle: 0,
        ui: {}
    })

    let moon_c = new Circle(w / 2, h / 2 + 70, 35);

    sim.add_circle(moon_c, {
        style: "solid moon"
    })

    sim.add_light(beam);

    sim.svg.append("text")
        .attrs({
            x: w/2,
            y: h - 20,
            "text-anchor": "middle"
        }).text("NOT TO SCALE")
})();