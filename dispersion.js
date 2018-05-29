(function(){
    let w = 400, h = 350;

    let sim = new Sim("#dispersion", h, w);
    
    sim.darken();

    let prism = {
        x1: 200, y1: 70,
        x2: 280, y2: 210,
        x3: 120, y3: 210
    }
    
    let prism_shape = sim.add_solid([
        new Line(prism.x1, prism.y1, prism.x2, prism.y2),
        new Line(prism.x2, prism.y2, prism.x3, prism.y3),
        new Line(prism.x3, prism.y3, prism.x1, prism.y1)
    ],{
        style: "solid glass",
        refractive: true,
        ior: {
            red: 1.7,
            green: 1.5,
            blue: 1.4
        }
    })

    let iors = {
        red: 1.7,
        green: 1.5, 
        blue: 1.4
    }

    function update_iors(){
        sim.update_shape_opts(prism_shape, {
            ior: iors
        })
    }

    let beam = new Beam({
        x1: 46, y1: 188,
        x2: 125, y2: 156,
        ui: {},
        num_rays: 10,
        color: ["red", "green", "blue"]
    })

    sim.add_light(beam);

    let green_slider = new Slider({
        x: 150,
        y: 330,
        length: 100,
        angle: 0,
        style: "green-slider slider",
        handle_style: "green-handle handle",
        value: 1.5,
        num_decimals: 2,
        callback: function (value) {
            iors.green = value;
            update_iors();
            return `IOR: ${value}`
        },
        text_dx: 0,
        text_dy: -25,
        min: 1,
        max: 4
    });

    sim.add_ui(green_slider);

    let red_slider = new Slider({
        x: 270,
        y: 330,
        length: 100,
        angle: 0,
        style: "red-slider slider",
        handle_style: "red-handle handle",
        value: 1.7,
        num_decimals: 2,
        callback: function (value) {
            iors.red = value;
            update_iors();
            return `IOR: ${value}`
        },
        text_dx: 0,
        text_dy: -25,
        min: 1,
        max: 4
    });

    sim.add_ui(red_slider);

    let blue_slider = new Slider({
        x: 30,
        y: 330,
        length: 100,
        angle: 0,
        style: "blue-slider slider",
        handle_style: "blue-handle handle",
        value: 1.3,
        num_decimals: 2,
        callback: function (value) {
            iors.blue = value;
            update_iors();
            return `IOR: ${value}`
        },
        text_dx: 0,
        text_dy: -25,
        min: 1,
        max: 4
    });

    sim.add_ui(blue_slider);
})();