(function(){
    let w = 400,
        h = 350,
        rect_width = 250,
        rect_height = 70;

    let sim = new Sim("#ior", h, w);

    let ior = 1.00;

    let rect = sim.add_rect((w-rect_width)/2,(h-rect_height)/2,rect_width,rect_height,{
        style: "solid glass",
        refractive: true,
        ior: ior
    });

    let beam = new Beam(41,17,145,115,10,20);
    sim.add_beam(beam);

    

    let slider = new Slider({
        x: 150,
        y: 300,
        length: 120,
        orientation: "horizontal",
        style: "slider",
        handle_style: "slider-handle handle",
        value: 1.5,
        callback: function(value){
            ior = value.toFixed(2);
            sim.update_shape_opts(rect, {ior: ior})
            return "IOR: " + ior;
        },
        text_dx: -73,
        text_dy: 3.5,
        min: 1,
        max: 4
    })

    sim.add_ui(slider);
})();