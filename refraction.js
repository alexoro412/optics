(function(){
    let w = 400,
        h = 350;
    
    let svg = make_sim("#refraction_test", h, w);

    let space = new Space();

    // space.add_circle(new Circle(w/2, h/2, 100), {
    //     reflective: true,
    //     style: "solid mirror"
    // });

    space.add_circle(new Circle(3 * w / 4, h / 3, 40), {
        reflective: false,
        refractive: true,
        style: "solid glass",
        ior: 1.5
    });

    space.add_rect(30,50,70,200,{
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    });

    let prism_width = 80;
    let prism_x = w/2 - 40;
    let prism_y = 2 * h / 3

    space.add_solid([
        new Line(prism_x, prism_y, prism_x + prism_width, prism_y),
        new Line(prism_x + prism_width, prism_y, prism_x + prism_width, prism_y + prism_width),
        new Line(prism_x + prism_width, prism_y + prism_width, prism_x, prism_y)
    ], {
        refractive: true,
        ior: 1.5, 
        style: "solid glass"
    })

    space.add_borders();

    space.install(svg);

    let beam = new Beam(150,80,150,220,10,20);
    beam.install(svg, space);

})();