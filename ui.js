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

    set(value){

        this.value = +precisionRound(value, this.num_decimals);
        this.slider_value = map(value, this.min, this.max, 0, this.length);
        this.circle.attrs({
            cx: this.x + this.slider_value * Math.cos(this.angle),
            cy: this.y + this.slider_value * Math.sin(this.angle)
        })
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

        this.circle = group.append("circle").attrs({
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
    constructor(opts) {
        merge(opts, default_point)
        Object.assign(this, opts)
    }

    install(group, id) {
        let self = this;

        this.svg_object = group.append("circle").attrs({
            cx: this.x,
            cy: this.y,
            r: this.radius,
            class: this.style
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", function (d) {
                self.x = +precisionRound(clamp(d3.event.x, self.min_x, self.max_x), self.num_decimals)
                self.y = +precisionRound(clamp(d3.event.y, self.min_y, self.max_y), self.num_decimals)
                d3.select(this)
                    .attrs({
                        cx: self.x,
                        cy: self.y
                    })
                self.callback(self.x, self.y)
            }).on("end", dragended))
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.svg_object.attrs({
            cx: this.x,
            cy: this.y
        })
    }
}

default_beam = {
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100,
    num_rays: 10,
    width: 20,
    strength: 0.5
}

class Beam {
    constructor(opts = {}) {
        merge(opts, default_beam);
        Object.assign(this, opts);

        this.ray_gap = this.width / this.num_rays;
        this.rays = [];

        if (this.ui != undefined) {
            this.handle1 = new Point(opts.ui);
            this.handle1.x = this.x1;
            this.handle1.y = this.y1;



            if (typeof this.angle != "number") {
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
            } else {
                this.x2 = this.x1 + 10 * Math.cos(this.angle);
                this.y2 = this.y1 + 10 * Math.sin(this.angle);

                this.handle1.callback = (function (x, y) {
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

    updateRays() {
        this.angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);

        this.rays = [];

        for (let i = 0; i < this.num_rays; i++) {
            this.rays.push(raycast(new Line(
                this.x1 + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.y1 - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle),
                this.x2 + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.y2 - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle)
            ), this.space.get_geometry(), max_bounce, 0, this.strength));
        }

    }

    drawRays() {
        let ray_groups = this.beam_group
            .selectAll("g")
            .data(this.rays);

        ray_groups.exit().remove();

        ray_groups.enter().append("g")
            .attr("class", "single-ray")

        let lines = ray_groups.selectAll("line")
            .data(function (d) {
                return d;
            });

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

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");

        this.updateRays();

        this.drawRays();
        this.drawRays();

    }
}

let default_lamp = {
    color: "",
    strength: 0.5,
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

        if (opts.ui != undefined) {
            this.handle = new Point(opts.ui);
            this.handle.x = this.x;
            this.handle.y = this.y;
            this.handles = [this.handle]
            let self = this;
            this.handle.callback = (function (x, y) {
                this.move(x, y);
            }).bind(this)
        }
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.updateRays();
        this.drawRays();
    }

    updateRays() {
        this.rays = [];
        for (let i = 0; i < this.num_rays; i++) {
            this.rays.push(raycast(new Line(this.x, this.y,
                    this.x + 10 * Math.cos(i * this.ray_gap), this.y + 10 * Math.sin(i * this.ray_gap)),
                this.space.get_geometry(), max_bounce, 0, this.strength))
        }
    }

    drawRays() {
        let ray_groups = this.beam_group
            .selectAll("g")
            .data(this.rays);

        ray_groups.exit().remove();

        ray_groups.enter().append("g")
            .attr("class", "single-ray")

        let lines = ray_groups.selectAll("line")
            .data(function (d) {
                return d;
            });

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

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");

        this.updateRays();
        this.drawRays();
        this.drawRays();
    }
}

default_conelamp = {
    x: 100,
    y: 100,
    strength: 0.5,
    angle: 0,
    num_rays: 20,
    width: Math.PI / 4,
    radius: 10,
    fixed: false,
    handle_gap: 30,
    max_bounce: 10
}

class ConeLamp {
    constructor(opts = {}) {
        merge(opts, default_conelamp);
        Object.assign(this, opts);

        this.ray_gap = this.width / this.num_rays;
        if (this.ui != undefined) {
            this.handle1 = new Point(opts.ui);
            this.handle1.x = this.x;
            this.handle1.y = this.y;

            if (this.fixed) {
                this.handle1.callback = (function (x, y) {
                    this.move(x, y)
                }).bind(this);

                this.handles = [this.handle1]
            } else {
                this.handle2 = new Point(opts.ui);
                this.handle2.x = this.x + this.handle_gap * Math.cos(this.angle);
                this.handle2.y = this.y + this.handle_gap * Math.sin(this.angle);

                this.handle1.callback = (function (x, y) {
                    this.handle2.x = x + this.handle_gap * Math.cos(this.angle);
                    this.handle2.y = y + this.handle_gap * Math.sin(this.angle);
                    this.handle2.move(x + this.handle_gap * Math.cos(this.angle), y + this.handle_gap * Math.sin(this.angle))
                    this.move(x, y);
                }).bind(this);

                this.handle2.callback = (function (x, y) {
                    this.angle = Math.atan2(y - this.y, x - this.x)
                    this.handle2.move(this.x + this.handle_gap * Math.cos(this.angle), this.y + this.handle_gap * Math.sin(this.angle));
                    this.move(this.x, this.y);
                }).bind(this)

                this.handles = [this.handle1, this.handle2]
            }
        }
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.updateRays();
        this.drawRays();
    }

    updateRays() {
        this.rays = [];
        for (let i = 0; i < this.num_rays; i++) {
            this.rays.push(raycast(new Line(this.x, this.y,
                    this.x + 10 * Math.cos(this.angle + (i - this.num_rays / 2 + 0.5) * this.ray_gap),
                    this.y + 10 * Math.sin(this.angle + (i - this.num_rays / 2 + 0.5) * this.ray_gap)),
                this.space.get_geometry(), this.max_bounce, 0, this.strength))
        }
    }

    drawRays() {
        let ray_groups = this.beam_group
            .selectAll("g")
            .data(this.rays);

        ray_groups.exit().remove();

        ray_groups.enter().append("g")
            .attr("class", "single-ray")

        let lines = ray_groups.selectAll("line")
            .data(function (d) {
                return d;
            });

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

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");

        this.updateRays();
        this.drawRays();
        this.drawRays();
    }
}