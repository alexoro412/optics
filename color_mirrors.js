(function(){
    let w = 400, h = 350;

    let sim = new Sim("#color_mirrors",h,w);

    sim.darken();

    let walls = sim.add_thins([
        new Line(130,30,130,270),
        new Line(270,30,270,270)
    ],{
        style: "mirror thick",
        reflective: true,
        reflectance: {
            red: 0.8,
            green: 1.0,
            blue: 0.8
        }
    })

    let beam = new Beam({
        x1: 158, y1: 60,
        x2: 229, y2: 76,
        ui: {},
        color: ["red", "green", "blue"],
        strength: 0.8
    })

    sim.add_light(beam);

    reflectances = {
        red: 0.8,
        green: 1.0,
        blue: 0.8
    }

    function update_reflectances(){
        sim.update_shape_opts(walls, {
            reflectance: reflectances
        })
    }

    let green_slider = new Slider({
        x: 150,
        y: 330,
        length: 100,
        angle: 0,
        style: "green-slider slider",
        handle_style: "green-handle handle",
        value: 0.9,
        num_decimals: 2,
        callback: function (value) {
            reflectances.green = value;
            update_reflectances();
            return `${(value*100).toFixed(0)}%`
        },
        text_dx: 35,
        text_dy: -20,
        min: 0,
        max: 1
    });

    sim.add_ui(green_slider);

    let red_slider = new Slider({
        x: 270,
        y: 330,
        length: 100,
        angle: 0,
        style: "red-slider slider",
        handle_style: "red-handle handle",
        value: 0.8,
        num_decimals: 2,
        callback: function (value) {
            reflectances.red = value;
            update_reflectances();
            return `${(value*100).toFixed(0)}%`
        },
        text_dx: 35,
        text_dy: -20,
        min: 0,
        max: 1
    });

    sim.add_ui(red_slider);

    let blue_slider = new Slider({
        x: 30,
        y: 330,
        length: 100,
        angle: 0,
        style: "blue-slider slider",
        handle_style: "blue-handle handle",
        value: 0.8,
        num_decimals: 2,
        callback: function (value) {
            reflectances.blue = value;
            update_reflectances();
            return `${(value*100).toFixed(0)}%`
        },
        text_dx: 35,
        text_dy: -20,
        min: 0,
        max: 1
    });

    sim.add_ui(blue_slider);
})();