(function(){
    let w = 400,
        h = 350;
    
    let svg = make_sim("#refraction_test", h, w);

    let space = new Space();


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
    let prism_y =  h / 3

    space.add_solid([
        new Line(prism_x, prism_y, prism_x + prism_width, prism_y),
        new Line(prism_x + prism_width, prism_y, prism_x + prism_width, prism_y + prism_width),
        new Line(prism_x + prism_width, prism_y + prism_width, prism_x, prism_y)
    ], {
        refractive: true,
        ior: 1.5, 
        style: "solid glass"
    })
    
    space.add_solid([
        new Bezier(100 + 10, 216,
            166.666 + 10, 362.666,
            233.333 + 10, 362.666, 
            300 + 10, 216),
        new Line(300 + 10,216,100 + 10,216)
    ], {
       refractive: true,
       ior: 1.33333,
       style: "solid water" 
    })

    space.add_borders();

    space.install(svg);

    

    let beam = new Beam(41,17,178,143,10,20);
    beam.install(svg, space);

})();