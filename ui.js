// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

let default_slider = {
    x: 100,
    y: 100,
    length: 100,
    angle: 0,
    handle_style: "handle",
    style: "",
    callback: null,
    radius: 10,
    text_dx: 0,
    text_dy: 0,
    text_value: "",
    min: 0,
    max: 100,
    value: 0,
    num_decimals: 10
}

class Slider {
    constructor(opts) {
        merge(opts, default_slider);
        Object.assign(this, opts);

        this.slider_value = map(this.value, this.min, this.max, 0, this.length)
    }

    install(group, id) {
        group.append("line").attrs({
            x1: this.x,
            y1: this.y,
            x2: this.x + this.length * Math.cos(this.angle),
            y2: this.y + this.length * Math.sin(this.angle),
            class: this.style
        })

        let self = this;

        this.text = group.append("text").attrs({
            x: this.x + this.text_dx,
            y: this.y + this.text_dy
        }).text(this.callback(this.value))

        group.append("circle").attrs({
            cx: this.x + this.slider_value * Math.cos(this.angle),
            cy: this.y + this.slider_value * Math.sin(this.angle),
            r: this.radius,
            class: this.handle_style
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", function (d) {
                // That's right, dot product
                let a_x = d3.event.x - self.x,
                    a_y = d3.event.y - self.y,
                    e_x = Math.cos(self.angle),
                    e_y = Math.sin(self.angle),
                    dot = a_x * e_x + a_y * e_y;

                self.slider_value = clamp(dot, 0, self.length);

                d3.select(this)
                    .attrs({
                        cx: self.x + self.slider_value * Math.cos(self.angle),
                        cy: self.y + self.slider_value * Math.sin(self.angle)
                    })

                self.value = precisionRound(map(self.slider_value, 0, self.length, self.min, self.max), self.num_decimals);

                self.text_value = self.callback(self.value);

                self.text.text(self.text_value);
            })
            .on("end", dragended))
    }
}

let default_point = {
    x: 0,
    y: 0,
    radius: 10,
    style: "handle",
    min_x: 0,
    min_y: 0,
    max_x: 400,
    max_y: 350,
    callback: null,
    num_decimals: 2
}

class Point {
    constructor(opts){
        merge(opts, default_point)
        Object.assign(this, opts)
    }

    install(group, id){
        let self = this;

        group.append("circle").attrs({
            cx: this.x,
            cy: this.y,
            r: this.radius,
            class: this.style
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", function(d){
                self.x = +precisionRound(clamp(d3.event.x, self.min_x, self.max_x),self.num_decimals)
                self.y = +precisionRound(clamp(d3.event.y, self.min_y, self.max_y),self.num_decimals)
                d3.select(this)
                    .attrs({
                        cx: self.x,
                        cy: self.y
                    })
                self.callback(self.x, self.y)
            }).on("end", dragended))
    }
}

default_beam = {
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100,
    num_rays: 10,
    width: 20,
    strength: 0.4
}

class Beam {
    constructor(opts = {}) {
        merge(opts, default_beam);
        Object.assign(this, opts);

        this.ray_gap = this.width / this.num_rays;
        // this.num_rays = num_rays;
        // this.beam_width = beam_width;
        this.rays = [];
        // this.radius = 10;
        // this.strength = 0.4;

        if (this.angle === undefined) {
            // this.data = [{
            //     x: x1,
            //     y: y1
            // }, {
            //     x: x2,
            //     y: y2
            // }]
        } else if (typeof this.angle == "number") {
            this.x2 = this.x1 + 10 * Math.cos(this.angle);
            this.y2 = this.y1 + 10 * Math.sin(this.angle);
            // this.data = [{
            //         x: x1,
            //         y: y1
            //     },
            //     {
            //         x: x1 + 10 * Math.cos(this.angle),
            //         y: y1 + 10 * Math.sin(this.angle)
            //     }
            // ]
        }

        if(this.ui != undefined){
            this.handle1 = new Point(opts.ui);
            this.handle1.x = this.x1;
            this.handle1.y = this.y1;

            

            if(typeof this.angle != "number"){
                this.handle2 = new Point(opts.ui);
                this.handle2.x = this.x2;
                this.handle2.y = this.y2;

                this.handle1.callback = (function (x, y) {
                    this.x1 = x;
                    this.y1 = y;
                    this.updateRays();
                    this.drawRays();
                }).bind(this);

                this.handle2.callback = (function (x, y) {
                    this.x2 = x;
                    this.y2 = y;
                    this.updateRays();
                    this.drawRays();
                }).bind(this);

                this.handles = [this.handle1, this.handle2]
            } else{
                this.handle1.callback = (function(x,y){
                    this.x1 = x;
                    this.y1 = y;
                    this.x2 = x + 10 * Math.cos(this.angle);
                    this.y2 = y + 10 * Math.sin(this.angle);
                    this.updateRays();
                    this.drawRays();
                }).bind(this);

                this.handles = [this.handle1]
            }

        }
    }

    // setBounds(w, h) {
    //     this.w = w;
    //     this.h = h;
    // }

    raise_handles() {
        // this.handle_group.raise();
    }

    updateRays() {
        this.angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);

        this.rays = [];

        for (let i = 0; i < this.num_rays; i++) {
            this.rays = this.rays.concat(raycast(new Line(
                this.x1 + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.y1 - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle),
                this.x2 + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.y2 - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle)
            ), this.space.get_geometry(), max_bounce, 0, this.strength));
        }

    }

    drawRays() {
        let lines = this.beam_group.selectAll("line").data(this.rays);

        lines.exit().remove();

        lines.attrs({
            x1: function (d) {
                return d.x1;
            },
            y1: function (d) {
                return d.y1;
            },
            x2: function (d) {
                return d.x2;
            },
            y2: function (d) {
                return d.y2;
            },
            class: "ray",
            "stroke-opacity": function (d) {
                return +precisionRound(d.strength, 3);
            }
        })

        lines.enter().append("line").attrs({
            x1: function (d) {
                return d.x1;
            },
            y1: function (d) {
                return d.y1;
            },
            x2: function (d) {
                return d.x2;
            },
            y2: function (d) {
                return d.y2;
            },
            class: "ray",
            "stroke-opacity": function (d) {
                return +precisionRound(d.strength, 3);
            }
        })
    }

    // updateHandles() {
    //     if (typeof this.orientation == "number") {
    //         this.data[1].x = this.data[0].x + 10 * Math.cos(this.orientation);
    //         this.data[1].y = this.data[0].y + 10 * Math.sin(this.orientation);
    //         this.handle_group.select("ellipse")
    //             .attr("transform", `rotate(${(this.orientation - Math.PI/2) * 180 / Math.PI} ${this.data[0].x} ${this.data[0].y})`);
    //     }
    // }

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");
        // this.handle_group = svg.append("g");


        this.updateRays();

        this.drawRays();


        // if (this.orientation == "free") {
        //     this.handle_group.selectAll("circle")
        //         .data(this.data)
        //         .enter().append("circle")
        //         .attrs({
        //             cx: function (d) {
        //                 return d.x;
        //             },
        //             cy: function (d) {
        //                 return d.y;
        //             },
        //             r: this.radius,
        //             class: "handle"
        //         }).call(d3.drag()
        //             .on("start", dragstarted)
        //             .on("drag", function (d) {
        //                 (dragged.bind(this))(d, self.w, self.h);
        //                 self.updateRays();
        //                 self.drawRays();
        //             })
        //             .on("end", dragended))
        // } else if (typeof this.orientation == "number") {
        //     this.handle_group.selectAll("ellipse")
        //         .data([this.data[0]]).enter().append("ellipse")
        //         .attrs({
        //             cx: this.data[0].x,
        //             cy: this.data[0].y,
        //             ry: this.radius,
        //             rx: this.beam_width / 2,
        //             class: "handle",
        //             transform: `rotate(${(this.orientation - Math.PI/2) * 180 / Math.PI} ${this.data[0].x} ${this.data[0].y})`
        //         }).call(d3.drag().on("start", dragstarted)
        //             .on("drag", function (d) {
        //                 (dragged.bind(this))(d, self.w, self.h);
        //                 self.updateHandles();
        //                 self.updateRays();
        //                 self.drawRays();
        //             })
        //             .on("end", dragended))
        // }

    }
}

let default_lamp = {
    color: "",
    strength: 0.8,
    x: 100,
    y: 100,
    num_rays: 20,
    radius: 10
}

class PointLamp {
    constructor(opts = {}) {
        merge(opts, default_lamp);
        Object.assign(this, opts);
        this.ray_gap = 2 * Math.PI / this.num_rays;

        if(opts.ui != undefined){
            this.handle = new Point(opts.ui);
            this.handle.x = this.x;
            this.handle.y = this.y;
            this.handles = [this.handle]
            let self = this;
            this.handle.callback = (function(x,y){
                this.move(x,y);
            }).bind(this)
        }
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.updateRays();
        this.drawRays();
    }

    raise_handles() {

    }

    updateRays() {
        this.rays = [];
        for (let i = 0; i < this.num_rays; i++) {
            this.rays = this.rays.concat(raycast(new Line(this.x, this.y,
                    this.x + 10 * Math.cos(i * this.ray_gap), this.y + 10 * Math.sin(i * this.ray_gap)),
                this.space.get_geometry(), max_bounce, 0, this.strength))
        }
    }

    drawRays() {
        let lines = this.beam_group.selectAll("line").data(this.rays);

        lines.exit().remove();

        lines.attrs({
            x1: function (d) {
                return d.x1;
            },
            y1: function (d) {
                return d.y1;
            },
            x2: function (d) {
                return d.x2;
            },
            y2: function (d) {
                return d.y2;
            },
            // class: "ray",
            // style: `stroke:${this.color}`,
            "stroke-opacity": function (d) {
                return +precisionRound(d.strength, 3);
            }
        })

        lines.enter().append("line").attrs({
            x1: function (d) {
                return d.x1;
            },
            y1: function (d) {
                return d.y1;
            },
            x2: function (d) {
                return d.x2;
            },
            y2: function (d) {
                return d.y2;
            },
            class: "ray",
            style: `stroke:${this.color}`,
            "stroke-opacity": function (d) {
                return +precisionRound(d.strength, 3);
            }
        })
    }

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");

        this.updateRays();
        this.drawRays();
    }
}