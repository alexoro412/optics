(function(){
    let w = 400,
        h = 350;

    let sim = new Sim("#oneway", h, w);

    let glass_width = 40;

    sim.add_rect(w/2 - glass_width/2, 0, glass_width,  h - 55, {
        refractive: true,
        ior: 1.5,
        style: "solid glass"
    });

    let metal = sim.add_thins([
        new Line(w/2,0,w/2,h-55)
    ], {
        reflective: true,
        reflectance: 0,
        transmission: 1,
        style: "mirror"
    })

    sim.add_thins([
        new Line(0,h-55,w,h-55)
    ], {
        style: "mirror"
    })

    let red_lamp = new ConeLamp({
        x: 70, y: 20, strength: 1,
        num_rays: 20,
        angle: Math.PI/3,
        ray_style: "ray",
        ui: {}
    })

    let red_slider = new Slider({
        x: 20, y: h - 20, 
        length: 90,
        value: 1.0,
        num_decimals: 2,
        style: "slider",
        handle_style: "slider-handle handle",
        min: 0,
        max: 1,
        text_dy: -17,
        text_dx: 10,
        callback(value){
            red_lamp.strength = value;
            red_lamp.updateRays();
            red_lamp.drawRays();
            return `Red: ${(value*100).toFixed(0)}%`
        }
    })

    let blue_lamp = new ConeLamp({
        x: 338,
        y: 20,
        strength: 0.07,
        angle: 2 * Math.PI / 3,
        num_rays: 20,
        color: ["blue"],
        ui: {}
    })

    let blue_slider = new Slider({
        x: 280,
        y: h - 20,
        length: 90,
        value: 0.07,
        num_decimals: 2,
        style: "slider",
        handle_style: "slider-handle handle",
        min: 0,
        max: 1,
        text_dy: -17,
        text_dx: 10,
        callback(value) {
            blue_lamp.strength = value;
            blue_lamp.updateRays();
            blue_lamp.drawRays();
            return `Blue: ${(value*100).toFixed(0)}%`
        }
    })

    let metal_slider = new Slider({
        x: 160,
        y: h - 20,
        length: 80, 
        value: 0,
        num_decimals: 2,
        style: "slider",
        handle_style: "slider-handle handle",
        min: 0,
        max: 1, 
        text_dy: -17,
        text_dx: -20,
        callback(value){
            sim.update_shape_opts(metal, {
                reflectance: value,
                transmission: 1 - value
            })
            return `Reflectance: ${(value * 100).toFixed(0)}%`
        }
    })

    sim.add_light(red_lamp);
    sim.add_ui(red_slider);
    sim.add_light(blue_lamp);
    sim.add_ui(blue_slider);
    sim.add_ui(metal_slider);
})();
