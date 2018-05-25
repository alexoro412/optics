(function(){
    let w = 400,
        h = 400;

    y_shift = 40;

    let coords = {
        h: h / 2 - y_shift
    }

    let sim = new Sim("#refraction_flat", h, w);

    let angles = sim.svg.append("path").attr("class", "arc");

    let angle_radius = 50;

    let thetai_text = sim.svg.append("text")
        .attrs({
            x: w/2 - angle_radius/2,
            y: coords.h - angle_radius - 10,
            "font-size": 17,
            "font-family": "Courier",
            "text-anchor": "middle"
        }).text("θ")
    thetai_text.append("tspan")
        .attrs({
            "baseline-shift": "sub",
            "font-size": 10
        }).text("i");

    let thetar_text = sim.svg.append("text")
        .attrs({
            x: w/2 + angle_radius/2,
            y: coords.h + angle_radius + 10,
            "font-size": 17,
            "font-family": "Courier",
            "text-anchor": "middle"
        }).text("θ")

    thetar_text.append("tspan")
        .attrs({
            "baseline-shift": "sub",
            "font-size": 10
        }).text("r");

    let equation = sim.svg.append("text")
        .attrs({
            x: w/2,
            y: h/2 + 60,
            "font-size": 20,
            "font-family": "Courier",
            "text-anchor": "middle"
        })

    equation.append("tspan").text("n")
    equation.append("tspan").attrs({
        "baseline-shift": "sub",
        "font-size": 10
    }).text("1")
    equation.append("tspan").text("sin(θ")
    equation.append("tspan").attrs({
        "baseline-shift": "sub",
        "font-size": 10
    }).text("i");
    equation.append("tspan").text(") = n")
    equation.append("tspan").attrs({
        "baseline-shift": "sub",
        "font-size": 10
    }).text("2")
    equation.append("tspan").text("sin(θ")
    equation.append("tspan").attrs({
        "baseline-shift": "sub",
        "font-size": 10
    }).text("r")
    equation.append("tspan").text(")");

    let no_solution = sim.svg.append("text")
        .attrs({
            x: w/2,
            y: h/2 + 90,
            "font-family": "Courier",
            "text-anchor": "middle",
            "visibility": "hidden"
        }).text("No Solution")

    let angle_text = sim.svg.append("text")
        .attrs({
            x: w/2,
            y: h/2 + 90,
            "font-size": 20,
            "font-family": "Courier",
            "text-anchor": "middle"
        })
        // .text("n")
    let ior1_text = angle_text.append("tspan")

    

    angle_text.append("tspan")
        .text("sin(")
    let theta1_text = angle_text.append("tspan")
    angle_text.append("tspan").text("°) = ")
    
    let ior2_text = angle_text.append("tspan")
    angle_text.append("tspan").text("sin(")
    let theta2_text = angle_text.append("tspan")
    angle_text.append("tspan").text("°)")

    let rect1 = sim.add_rect(0,0,w,h/2 - y_shift, {
        refractive: true,
        ior: 1.33,
        style: "hollow glass"
    });

    let rect2 = sim.add_rect(0,h/2 - y_shift,w,h/2 + y_shift, {
        refractive: true,
        ior: 1.5,
        style: "solid water"
    });

    let beam = new Beam({
        x1: 41, y1: 60, x2: w/2, y2: h/2 - y_shift,
        num_rays: 1,
        width: 20,
        strength: 1,
        second_handle: false,
        max_bounce: 2,
        ui: {
            max_y: h/2 - y_shift - 10,
            min_y: 1,
            max_x: w - 1,
            min_x: 1,
            callback: function(x,y){
                updateAngles();
            } 
        }
    })

    let slider1 = new Slider({
        x: w/2 - 65,
        y: 30,
        length: 130,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 1.33,
        num_decimals: 2,
        callback: function(value){
            sim.update_shape_opts(rect1, {
                ior: value
            })
            updateAngles();
            ior1_text.text(value.toFixed(2))
            return `IOR: ${value.toFixed(2)}`
        },
        text_dx: -80,
        text_dy: 3.5,
        min: 1,
        max: 4
    })


    let slider2 = new Slider({
        x: w / 2 - 65,
        y: h-30,
        length: 130,
        angle: 0,
        style: "slider",
        handle_style: "slider-handle handle",
        value: 1.5,
        num_decimals: 2,
        callback: function (value) {
            sim.update_shape_opts(rect2, {
                ior: value
            })
            updateAngles();
            ior2_text.text(value.toFixed(2));
            return `IOR: ${value.toFixed(2)}`
        },
        text_dx: -80,
        text_dy: 3.5,
        min: 1,
        max: 4
    })


    sim.add_light(beam);
    sim.add_ui(slider1);
    sim.add_ui(slider2);


    function updateAngles(){
        let rays = beam.rays[0];
        let thetai = Math.atan2(rays[0].y2 - rays[0].y1, rays[0].x2 - rays[0].x1);
        let costi = (Math.cos(thetai));
        let sinti = (Math.sin(thetai));

        let thetar = Math.atan2(rays[1].y2 - rays[1].y1, rays[1].x2 - rays[1].x1);
        
        
        let costr = Math.cos(thetar);
        let sintr = Math.sin(thetar);

        theta1_text.text(Math.abs(90 - thetai * 180 / Math.PI).toFixed(1));
        theta2_text.text(Math.abs(90 - thetar * 180 / Math.PI).toFixed(1));

        if(rays[0].x1 < w/2) {
            thetai_text.attr("x", w / 2 - angle_radius / 2)
            thetar_text.attr("x", w/2 + angle_radius/2)
        }else{
            thetai_text.attr("x", w / 2 + angle_radius / 2)
            thetar_text.attr("x", w/2 - angle_radius/2)
        }

        if(thetar < 0){
            angle_text.attr("visibility", "hidden");
            thetar_text.attr("y", coords.h - angle_radius - 10);
            no_solution.attr("visibility","");
        }else {
            angle_text.attr("visibility", "");
            thetar_text.attr("y", coords.h + angle_radius + 10);
            no_solution.attr("visibility", "hidden");
        }

        angles.attr("d", `M ${w/2} ${coords.h}
        L ${w/2 - costi * angle_radius} ${coords.h - angle_radius * sinti}
        A ${angle_radius} ${angle_radius} 0 0 ${rays[0].x1 > w/2 ? 0 : 1} ${w/2} ${coords.h - angle_radius}
        L ${w/2} ${coords.h}
        L ${w/2 + costr * angle_radius} ${coords.h + sintr * angle_radius}
        A ${angle_radius} ${angle_radius} 0 0 ${rays[0].x1 > w/2 != thetar < 0 ? 0 : 1} ${w/2} ${coords.h + angle_radius * (thetar < 0 ? -1 : 1)}
        L ${w/2} ${coords.h}`);
    }
    
    updateAngles();
})();