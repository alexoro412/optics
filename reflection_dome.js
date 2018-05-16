(function () {
    let w = 400,
        h = 350,
        angle_radius = 15,
        handle_radius = 10,
        dome_radius = 120;

    let handle = {
        x: 277,
        y: 40
    }

    let coords = {
        h: 4 * h / 5
    }

    let surface = function (x) {
        if (Math.abs(x - w / 2) > dome_radius) {
            return coords.h;
        } else {
            return coords.h - Math.sqrt(dome_radius ** 2 - (x - w / 2) ** 2);
        }
    }

    let reflection = function (x) {
        // FIXME 
        // Update to use slope based formula

        // return 0;
        if (Math.abs(x - w / 2) > dome_radius) {
            return Infinity;
        }
        if (x < w / 2) {
            return Math.tan(3 * Math.PI / 2 - 2 * Math.atan2(Math.sqrt(dome_radius ** 2 - (x - w / 2) ** 2), (x - w / 2)))
        } else {
            return -Math.tan(2 * Math.atan2(Math.sqrt(dome_radius ** 2 - (x - w / 2) ** 2), (x - w / 2)) - Math.PI / 2)
        }

    }

    // for(let i = 0; i < 30; i ++){
    //     console.log(i, reflection(i*10));
    // }

    let svg = d3.select("#reflection_dome")
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })

    let mirror = svg.append("path")
        .attr("d", "M " + 0 + " " + coords.h +
            " L " + ((w / 2) - dome_radius) + " " + coords.h +
            " A " + dome_radius + " " + dome_radius + " 0 0 1 " + ((w / 2) + dome_radius) + " " + coords.h +
            " L " + w + " " + coords.h)
        .attr("class", "solid mirror");

    svg.append("rect")
        .attr("x", 0)
        .attr("y", coords.h)
        .attr("width", w)
        .attr("height", h)
        .attr("class", "solid");

    svg.selectAll("circle")
        .data([handle])
        .enter().append("circle")
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        })
        .attr("r", handle_radius)
        .attr("class", "handle")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    let incident = svg.append("line")
        .attrs({
            id: "incident",
            x1: handle.x,
            y1: handle.y,
            x2: handle.x,
            y2: surface(handle.x),
            class: ""
        })

    let reflected = svg.append("path")
        .attrs({
            id: "reflected",
            d: "",
            // x1: handle.x,
            // y1: surface(handle.x),
            // x2: w,
            // y2: surface(handle.x) + reflection(handle.x) * (w / 2 - Math.abs(handle.x - w / 2)) * (handle.x < (w / 2) ? -1 : 1),
            class: "ray"
        })

    let path = [];

    // let helpers = svg.append("g").attr("id", "helpers").selectAll("circle")
    //     .data(path);

    // function updateHelpers() {

    //     svg.select("#helpers").selectAll("circle").data(path)
    //         .exit().remove();

    //     helpers.data(path).enter().append("circle")
    //         .attr("class", "handle")
    //         .attr("r", handle_radius)
    //         .merge(helpers)
    //         .attr("cx", function (d) {
    //             return d.x;
    //         }).attr("cy", function (d) {
    //             return d.y;
    //         });
    
    // }



    let angles = svg.append("path").attr("class", "arc")

    let theta = 0;

    function updateAngles() {

        theta = (Math.atan2(Math.sqrt(dome_radius ** 2 - (handle.x - w / 2) ** 2), (handle.x - w / 2)));

        if (!isFinite(theta)) {
            angles.attr("d", "");
            return;
        };

        angles.attr("d", "M " + (handle.x) + " " + (surface(handle.x)) +
            " L " + (w / 2 + (dome_radius + angle_radius) * Math.cos(theta)) + " " + (coords.h - (dome_radius + angle_radius) * Math.sin(theta)));
    }

    updateAngles();

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    space = [
        // Dome
        new Circle(w / 2, coords.h, dome_radius, true),
        // Flat area
        new Line(0, coords.h, w, coords.h, true),
        // Walls
        new Line(0, 0, 0, coords.h, false),
        new Line(0, 0, w, 0, false),
        new Line(w, 0, w, coords.h, false)
    ]

    console.log(space);

    function dragged(d) {
        d3.select(this)
            .attr("cx", d.x = clamp(d3.event.x, 0, w));

        updateAngles();

        incident
            .attrs({
                x1: handle.x,
                x2: handle.x,
                y2: surface(handle.x)
            })
console.log("NOW CASTING")
        path = raycast(handle.x, handle.y, handle.x, handle.y + 10, space, -1);

        // console.log(p);
        // console.log(path);
        // console.log(path[0]);

        

        path_string = "M " + handle.x + " " + handle.y + " L ";
        for(let i = 0; i < path.length; i++){
            path_string += (path[i].x + " " + path[i].y + " ");
            if(i == path.length - 1){
                path_string += ("M " + handle.x + " " + handle.y + " z")
            }else{
                path_string += ("L ")
            }
        }
        console.log(path_string);

        reflected.attr("d", path_string);

        // updateHelpers();

        // reflected.attr("d", "M " + p[0].x, p[0].y 
        // + " L " )

        // let m = reflect(-Infinity, p.n);

        // reflected.attrs({
        //     x1: p.x,
        //     y1: p.y
        // });

        // if(isFinite(m)){
        //     reflected.attrs({
        //         x2: handle.x < (w / 2) ? 0 : w,
        //         y2: p.y + m * (w / 2 - Math.abs(handle.x - w / 2)) * (handle.x < (w / 2) ? 1 : -1)
        //     })
        // }else{
        //     reflected.attrs({
        //         x2: p.x, 
        //         y2: 0
        //     })
        // }

        // reflected.attrs({
        //     x1: handle.x,
        //     y1: surface(handle.x)
        // })



        // if (reflection(handle.x) == Infinity) {
        //     reflected.attrs({
        //         x2: handle.x,
        //         y2: 0
        //     })
        // } else {
        //     let y2 = surface(handle.x) + reflection(handle.x) * (w / 2 - Math.abs(handle.x - w / 2)) * (handle.x < (w / 2) ? -1 : 1);

        //     if (y2 > coords.h) {
        //         reflected.attrs({
        //             y2: coords.h,
        //             x2: handle.x + (coords.h - surface(handle.x)) / reflection(handle.x)
        //         })
        //     } else {
        //         reflected
        //             .attrs({
        //                 x2: handle.x < (w / 2) ? 0 : w,
        //                 y2: y2
        //             })
        //     }


        // }



    }

    function dragended(d) {
        d3.select(this).classed("active", false);
        // console.log(theta * 180 / Math.PI)
    }
})();