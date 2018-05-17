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

    // let dome = new Circle(w / 2, coords.h, dome_radius, true);
    // dome.setAngles(0, -Math.PI);

    let space = new Space();

    let dome_left = new Circle();
    dome_left.reflective = true;
    dome_left.arc(w / 2 - dome_radius, coords.h, w / 2, coords.h - dome_radius, dome_radius, 0, 1);
    // dome_left.arc(w / 2 + dome_radius, coords.h, w / 2, coords.h - dome_radius, dome_radius, 0, 0);

    let dome_right = new Circle();
    dome_right.reflective = true;
    dome_right.arc(w / 2, coords.h - dome_radius, w / 2 + dome_radius, coords.h, dome_radius, 0, 0);

    space.add_solid([
        new Line(0, coords.h, w / 2 - dome_radius, coords.h, true),
        dome_left,
        dome_right,
        new Line(w / 2 + dome_radius, coords.h, w, coords.h, true),
        new Line(w, coords.h, w, h, true),
        new Line(w, h, 0, h, true),
        new Line(0, h, 0, coords.h, true)
    ], true, "mirror")

    // space.add_solid([
    //     new Line(100,100,100,200),
    //     new Line(100,200,200,200),
    //     new Line(200,200,200,100),
    //     new Line(200,100,100,100)
    // ], true, "mirror");

    space.add_thins([
        new Line(0, 0, 0, coords.h, false),
        new Line(0, 0, w, 0, false),
        new Line(w, 0, w, coords.h, false),
    ], false, "arc")

    svg.append("g").attr("id", "space")
        .selectAll("path").data(space.draw()).enter().append("path")
        .attrs({
            class: function (d) {
                return d.class;
            },
            d: function (d) {
                return d.path;
            }
        })

    console.log(space.draw())

    let incident_ray = new Line(handles[0].x, handles[0].y, handles[1].x, handles[1].y, false)

    let incident_rays = [];
    let reflected_rays = [];

    for (let i = 0; i < 5; i++) {
        incident_rays.push(new Line());
        reflected_rays.push(new Line());
    }

    let rays = svg.append("g").attr("id", "rays")
        .selectAll("path").data(reflected_rays)
        .enter().append("path")
        .attrs({
            d: "",
            class: "ray"
        })

    console.log(reflected_rays, incident_rays);


    function updateRay() {
        let angle = Math.atan2(handles[1].y - handles[0].y, handles[1].x - handles[0].x);

        for (let i = 0; i < 5; i++) {
            incident_rays[i].moveTo(handles[0].x + (i-2) * 5 * Math.sin(angle), handles[0].y - (i-2) * 5 * Math.cos(angle), handles[1].x + (i-2) * 5 * Math.sin(angle), handles[1].y - (i-2) * 5 * Math.cos(angle));

            reflected_rays[i] = new Ray(raycast(incident_rays[i], space.get_geometry()))
        }

        rays.data(reflected_rays)
            .attrs({
                d: function (d) {
                    return d.draw()
                }
            })

    }

    updateRay();

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

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

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