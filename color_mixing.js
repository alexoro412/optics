(function(){
    let w = 400, h= 350;

    let sim = new Sim("#color_mixing", h, w);

    sim.darken();

    let c_group = sim.svg.append("g")
        .attr("class", "ray-group")

    c_group.append("circle")
        .attrs({
            cx: 150,
            cy: 100,
            r: 90,
            class: "color-circle red-circle"
        })

    c_group.append("circle")
        .attrs({
            cx: 400-150,
            cy: 100,
            r: 90,
            class: "color-circle blue-circle"
        })

    c_group.append("circle")
        .attrs({
            cx: 200,
            cy: 200,
            r: 90,
            class: "color-circle green-circle"
        })

    let green_slider = new Slider({
        x: 150,
        y: 330,
        length: 100,
        angle: 0,
        style: "green-slider slider",
        handle_style: "green-handle handle",
        value: 0.8,
        num_decimals: 2,
        callback: function (value) {
            d3.select(".green-circle")
                .style("fill-opacity", value)
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
            d3.select(".red-circle")
                .style("fill-opacity", value);
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
            d3.select(".blue-circle")
                .style("fill-opacity", value)
            return `${(value*100).toFixed(0)}%`
        },
        text_dx: 35,
        text_dy: -20,
        min: 0,
        max: 1
    });

    sim.add_ui(blue_slider);
})();