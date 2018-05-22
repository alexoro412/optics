(function () {
    let w = 400,
        h = 350;

    let sim = new Sim("#bezier", h, w);

    let handles = [{
            x: 22,
            y: 153
        },
        {
            x: 144,
            y: 32
        },
        {
            x: 218,
            y: 237
        },
        {
            x: 375,
            y: 92
        }
    ];

    let bezier = sim.add_thin(
        new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
            handles[2].x, handles[2].y,
            handles[3].x, handles[3].y), {
            reflective: true,
            style: "mirror bezier-heat thick",
            reflectance: 0.5
        })

    let lines = sim.add_thins([
        new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y),
        new Line(handles[2].x, handles[2].y, handles[3].x, handles[3].y)
    ], {
        transparent: true,
        style: "bezier-line"
    })

    sim.add_thins([
        new Line(0, h - 80, w, h - 80),
        new Line(w / 2, h - 80, w / 2, h)
    ], {
        style: "mirror thick"
    })

    function update_bezier(x, y) {
        sim.update_shape_geometry(bezier, new Bezier(handles[0].x, handles[0].y, handles[1].x, handles[1].y,
            handles[2].x, handles[2].y,
            handles[3].x, handles[3].y));
        sim.update_shape_geometry(lines, [
            new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y),
            new Line(handles[2].x, handles[2].y, handles[3].x, handles[3].y)
        ])
    }

    for (let i = 0; i < 4; i++) {
        handles[i] = new Point({
            x: handles[i].x,
            y: handles[i].y,
            max_x: w,
            max_y: h,
            num_decimals: 2,
            callback: update_bezier,
            radius: 7,
            style: "slider-handle handle"
        })
        sim.add_ui(handles[i])
    }

    percent_reflectance = 50;
    percent_transmission = 10;

    function update_opts(){
        console.log(percent_reflectance/100, percent_transmission)
        sim.update_shape_opts(bezier, {
            reflectance: percent_reflectance / 100,
            transmission: percent_transmission / 100
        });
        document.querySelector(".bezier-heat").style.stroke = 
            `rgb(${map(100 - (percent_reflectance + percent_transmission), 0, 100, 128, 255)},128,128)`;
        p_ref.text(`${percent_reflectance}%`);
        p_tra.text(`${percent_transmission}%`);
        p_abs.text(`${100 - (percent_reflectance + percent_transmission)}%`);
    }

    let r_slider = new Slider({
        x: 220,
        y: 330,
        length: 150,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: percent_reflectance,
        num_decimals: 0,
        callback: function(value){
            if(value + percent_transmission > 100){
                percent_reflectance = value;
                percent_transmission = 100 - value;
                t_slider.set(percent_transmission);
            }else{
                percent_reflectance = value;
            }
            update_opts();
        },
        min: 0,
        max: 100
    })

    let t_slider = new Slider({
        x: 20,
        y: 330,
        length: 150,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: percent_transmission,
        num_decimals: 0,
        callback: function (value) {
            if (value + percent_reflectance > 100) {
                percent_transmission = value;
                percent_reflectance = 100 - value;
                r_slider.set(percent_reflectance);
            } else {
                percent_transmission = value;
            }
            update_opts();
        },
        min: 0,
        max: 100
    })

    let p_ref = d3.select("#percent-reflectance");
    let p_abs = d3.select("#percent-absorbance");
    let p_tra = d3.select("#percent-transmission");

    let titles = [
        {x: 295, y: 300, text: "Reflectance"},
        {x: 100, y: 300, text: "Transmission"}
    ]
    
    sim.svg.append("g").selectAll("text")
        .data(titles).enter().append("text").attrs({
        x: function(d){return d.x;},
        y: function(d){return d.y;},
        "font-size": 16,
        "text-anchor": "middle",
        "background-color": "lightgray"
    }).text(function(d){return d.text;});

    sim.add_ui(r_slider);
    sim.add_ui(t_slider);

    let beam = new Beam({
        x1: 22,
        y1: 215,
        x2: 106,
        y2: 176,
        num_rays: 10,
        width: 20,
        ui: {
            max_x: w,
            max_y: h,
            num_decimals: 2
        }
    })

    // let beam = new Beam(22, 215, 106, 176, 10, 20);
    sim.add_light(beam);
    // sim.add_light(lamp);
    // sim.add_ui(lamp_handle);
})();