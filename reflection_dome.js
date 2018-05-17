(function () {
    let w = 400,
        h = 350,
        angle_radius = 15,
        handle_radius = 10,
        dome_radius = 120;

    let handles = [{
            x: 277,
            y: 40
        },
        {
            x: 272,
            y: 70
        }
    ]

    let coords = {
        h: 4 * h / 5
    }

    let svg = d3.select("#reflection_dome")
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })

    // let mirror = svg.append("path")
    //     .attr("d", "M " + 0 + " " + coords.h +
    //         " L " + ((w / 2) - dome_radius) + " " + coords.h +
    //         " A " + dome_radius + " " + dome_radius + " 0 0 1 " + ((w / 2) + dome_radius) + " " + coords.h +
    //         " L " + w + " " + coords.h)
    //     .attr("class", "solid mirror");

    // svg.append("rect")
    //     .attr("x", 0)
    //     .attr("y", coords.h)
    //     .attr("width", w)
    //     .attr("height", h)
    //     .attr("class", "solid");

    // svg.append("rect")
    //     .attrs({
    //         x: 0,
    //         y: 0,
    //         width: w,
    //         height: 10,
    //         class: "solid"
    //     });

    // svg.append("line")
    //     .attrs({
    //         x1: 0,
    //         y1: 10,
    //         x2: w,
    //         y2: 10,
    //         class: "mirror"
    //     });

    svg.selectAll("circle")
        .data(handles)
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

    let reflected = svg.append("path")
        .attrs({
            id: "reflected",
            d: "",
            class: "ray"
        })

    let path = [];

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }
    // let dome = new Circle(w / 2, coords.h, dome_radius, true);
    // dome.setAngles(0, -Math.PI);

    let dome_left = new Circle();
    dome_left.reflective = true;
     dome_left.arc(w / 2 - dome_radius, coords.h, w / 2, coords.h - dome_radius, dome_radius, 0, 0);
    // dome_left.arc(w / 2 + dome_radius, coords.h, w / 2, coords.h - dome_radius, dome_radius, 0, 0);

    let dome_right = new Circle();
    dome_right.reflective = true;
    dome_right.arc(w / 2, coords.h - dome_radius, w / 2 + dome_radius, coords.h, dome_radius, 0, 1);

    let dome = new Circle();
    dome.reflective = true;
    dome.arc(w / 2 - dome_radius, coords.h, w / 2 + dome_radius, coords.h, dome_radius, 0, 0);

    console.log("left", dome_left);
    console.log("right", dome_right);

    space = [
        // Dome
        
        // dome,
        // Flat area
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        dome_left,
        dome_right,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true),
        // new Line(0, 10, w, 10, true),
        // Walls
        new Line(0, 0, 0, coords.h, false),
        new Line(0, 0, w, 0, false),
        new Line(w, 0, w, coords.h, false),
        // new Line(0, h, w, h, false)
    ]

    let incident_ray = new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y, false)

    function updateRay() {
        incident_ray.moveTo(handles[0].x, handles[0].y, handles[1].x, handles[1].y);

        path = raycast(incident_ray, space);

        path_string = "M " + handles[0].x + " " + handles[0].y + " L ";

        for (let i = 0; i < path.length; i++) {
            path_string += (path[i].x + " " + path[i].y + " ");
            if (i == path.length - 1) {
                path_string += ("M " + handles[0].x + " " + handles[0].y + " z")
            } else {
                path_string += ("L ")
            }
        }

        reflected.attr("d", path_string);
    }

    console.log(dome_left.draw());
    updateRay();


    mirror_string = "";
    for(let i = 0; i < space.length; i++){
        if(space[i].reflective)
        mirror_string += space[i].draw()
    }

    mirror_string += " z";

    let arc_test = svg.append("path")
        .attrs({
            class: "hollow mirror",
            d: mirror_string
        })

    function dragged(d) {
        d3.select(this)
            .attr("cx", d.x = clamp(d3.event.x, 0, w))
            .attr("cy", d.y = clamp(d3.event.y, 0, h));

        updateRay();
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
    }
})();