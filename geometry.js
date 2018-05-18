function sign(x) {
    if (x < 0) {
        return -1;
    } else {
        return 1;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function closest(x, y) {
    return function (a, b) {
        return distance(x, y, a.x, a.y) - distance(x, y, b.x, b.y);
    }
}

const max_bounce = 10;

function close_enough(a, b, tolerance = 0.1) {
    return Math.abs(a - b) < tolerance;
}

function raycast(ray, geometry, bounce = max_bounce) {
    if (bounce == 0) return [];

    intersections = [];

    for (let g of geometry) {
        intersections = intersections.concat(ray.intersect(g));
    }

    let theta = ray.angle();

    if (intersections.length == 0) {
        console.log("HOW DOES THIS HAPPEN? THIS SHOULD NEVER EVER EVER HAPPEN");
    }

    intersections = (intersections.filter(function (point) {
        // FIXME
        // This prevents floating point errors
        if (distance(ray.x1, ray.y1, point.x, point.y) < 0.1) return false;

        return ray.inRayDirection(point.x, point.y);

    })).sort(closest(ray.x1, ray.y1));

    let points = [];
    if (bounce == max_bounce) {
        points.push({
            x: ray.x1,
            y: ray.y1
        })
    }

    if (intersections.length > 0) {
        points.push(intersections[0]);
        if (intersections[0].r) {


            let phi = reflect(ray.angle(), intersections[0].n)

            let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0, false);
            reflected_ray.polar(10, phi);


            return points
                // .concat([{x:reflected_ray.x1, y: reflected_ray.y1}, {x:reflected_ray.x2, y: reflected_ray.y2}])
                .concat(raycast(reflected_ray, geometry, bounce - 1))
        } else {
            return points;
        }
    } else {
        return [];
    }
}

function reflect(alpha, theta) {
    // theta is angle on normal
    // alpha is angle on incident
    return 2 * theta - alpha + Math.PI;
}

class Line {
    constructor(x1, y1, x2, y2, reflective) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.reflective = reflective;
    }

    draw(move = true) {
        if (move) {
            return "M " + this.x1 + " " + this.y1 + " L " + this.x2 + " " + this.y2 + " ";
        } else {
            return "L " + this.x2 + " " + this.y2 + " ";
        }

    }

    moveTo(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }

    polar(r, angle) {
        this.x2 = this.x1 + r * Math.cos(angle);
        this.y2 = this.y1 + r * Math.sin(angle);
    }

    slope() {
        return (this.y1 - this.y2) / (this.x1 - this.x2);
    }

    inRayDirection(x, y) {
        return (this.x2 > this.x1 && x > this.x1) ||
            (this.x2 < this.x1 && x < this.x1) ||
            (close_enough(this.x2, this.x1, 0.01) &&
                (
                    (this.y2 > this.y1 && y > this.y1) ||
                    (this.y2 < this.y1 && y < this.y1)
                ))
    }

    f(x, type) {

        if ((type == "line") ||
            (Math.min(this.x1, this.x2) < x && x < Math.max(this.x1, this.x2))) {
            if (isFinite(this.slope())) {
                return this.slope() * (x - this.x1) + this.y1;
            } else {
                return -401;
            }
        }
    }

    angle(x) {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }

    normalAngle(x) {
        return -Math.atan2(this.x2 - this.x1, this.y2 - this.y1);
    }

    intersect(other) {
        if (other instanceof Bezier) {
            let Ax = -this.slope(),
                Ay = 1,
                C = this.y1 - this.slope() * this.x1;



            if (!isFinite(Ax)) {
                Ax = -1;
                Ay = 0;
                C = -this.x1
            }

            let a = Ax * other.xCoeffs[0] + Ay * other.yCoeffs[0];
            let b = Ax * other.xCoeffs[1] + Ay * other.yCoeffs[1];
            let c = Ax * other.xCoeffs[2] + Ay * other.yCoeffs[2];
            let d = Ax * other.xCoeffs[3] + Ay * other.yCoeffs[3] - C;

            let roots = cubicRoots(a, b, c, d);

            roots = roots.filter(function (x) {
                return 0 <= x && x <= 1;
            })

            let answers = roots.map(function (e) {
                let o = other.f(e);
                o.n = other.normal(e);
                o.r = other.reflective;
                return o;
            });

            return answers;
        } else if (other instanceof Circle || other instanceof Arc) {
            // http://mathworld.wolfram.com/Circle-LineIntersection.html

            let dx = this.x2 - this.x1,
                dy = this.y2 - this.y1,
                dr = Math.sqrt(dx ** 2 + dy ** 2),
                D = (this.x1 - other.cx) * (this.y2 - other.cy) -
                (this.x2 - other.cx) * (this.y1 - other.cy),
                delta = (other.r * dr) ** 2 - D ** 2;

            if (delta <= 0) {
                // Return nothing if doesn't intersect, or is tangent
                return [];
            } else {

                // Calculate points
                let x1 = (D * dy + sign(dy) * dx * Math.sqrt(delta)) / (dr ** 2) + other.cx,
                    y1 = (-D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy,
                    x2 = (D * dy - sign(dy) * dx * Math.sqrt(delta)) / (dr ** 2) + other.cx,
                    y2 = (-D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy;

                // Calculate normals
                // let n1 = (y1 - other.cy) / (x1 - other.cx),
                //     n2 = (y2 - other.cy) / (x1 - other.cx);

                // Calculate normal angles
                let n1 = Math.atan2(y1 - other.cy, x1 - other.cx),
                    n2 = Math.atan2(y2 - other.cy, x2 - other.cx);

                let points = [];

                let p1 = {
                    x: x1,
                    y: y1,
                    n: n1,
                    r: other.reflective
                }

                let p2 = {
                    x: x2,
                    y: y2,
                    n: n2,
                    r: other.reflective
                }

                if (other instanceof Circle) {
                    points.push(p1);
                    points.push(p2);
                } else if (other instanceof Arc) {
                    // if (other.theta1 < n1 && n1 < other.theta2) {
                    if (other.inAngles(n1)) {
                        points.push(p1)
                    }

                    // if (other.theta1 < n2 && n2 < other.theta2) {
                    if (other.inAngles(n2)) {
                        points.push(p2)
                    }
                }

                return points;
            }

        } else if (other instanceof Line) {
            // THIS FUNCTION WILL SPECIFICALLY INTERSECT A LINE (this) WITH A LINE SEGMENT (other)

            if (this.slope() == other.slope()) {
                return [];
            } else {
                if (isFinite(this.slope())) {
                    if (isFinite(other.slope())) {
                        let x = (other.slope() * other.x1 - this.slope() * this.x1 + this.y1 - other.y1) / (other.slope() - this.slope());
                        let y = other.f(x);
                        if (y == undefined) return [];
                        // let n = -1 / other.slope();
                        return [{
                            x: x,
                            y: y,
                            n: other.normalAngle(),
                            r: other.reflective
                        }]
                    } else {
                        // ray non vertical
                        // surface vertical 
                        // let n = 0;
                        let x = other.x1;
                        let y = this.f(x, "line");
                        if (Math.min(other.y1, other.y2) < y && y < Math.max(other.y1, other.y2)) {
                            return [{
                                x: x,
                                y: y,
                                n: other.normalAngle(),
                                r: other.reflective
                            }]
                        } else {
                            return [];
                        }

                    }
                } else {
                    if (isFinite(other.slope())) {
                        // let n = -1 / other.slope();
                        let x = this.x1;
                        let y = other.f(x);
                        if (y == undefined) {
                            return [];
                        } else {
                            return [{
                                x: x,
                                y: y,
                                n: other.normalAngle(),
                                r: other.reflective
                            }]
                        }

                    } else {
                        return [];
                    }
                }

            }
        }
    }
}

class Arc {

    // I don't understand this
    // I got it from:
    // https://stackoverflow.com/questions/43825414/draw-an-svg-arc-using-d3-knowing-3-points-on-the-arc?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa


    constructor(x1, y1, x2, y2, x3, y3) {
        // a : (x1,y1) start
        // b : (x2,y2) end 
        // c : (x3,y3) via

        let A = distance(x2, y2, x3, y3),
            B = distance(x3, y3, x1, y1),
            C = distance(x1, y1, x2, y2);

        let angle = Math.acos((A * A + B * B - C * C) / (2 * A * B))

        let K = .5 * A * B * Math.sin(angle);
        this.r = A * B * C / 4 / K

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;

        let q = distance(x1, y1, x2, y2),
            xm = (x1 + x2) / 2,
            ym = (y1 + y2) / 2;

        let r = this.r;

        let deltax = Math.sqrt(r ** 2 - (q / 2) ** 2) * (y1 - y2) / q,
            deltay = Math.sqrt(r ** 2 - (q / 2) ** 2) * (x2 - x1) / q;

        this.laf = +(Math.PI / 2 > angle);
        this.saf = +((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1) < 0);

        if (this.saf) {
            this.cx = xm + deltax;
            this.cy = ym + deltay;
        } else {
            this.cx = xm - deltax;
            this.cy = ym - deltay;
        }

        this.angle_flag = true;

        this.angle1 = Math.atan2(y2 - this.cy, x2 - this.cx);
        this.angle2 = Math.atan2(y1 - this.cy, x1 - this.cx);

        this.angle3 = Math.atan2(y3 - this.cy, x3 - this.cx);

        if (!this.inAngles(this.angle3)) {
            this.angle_flag = false;
        }

    }

    draw(move) {
        if (move) {
            return `M ${this.x1} ${this.y1} A ${this.r} ${this.r} 0 ${this.laf} ${this.saf} ${this.x2} ${this.y2}`
        } else {
            return `A ${this.r} ${this.r} 0 ${this.laf} ${this.saf} ${this.x2} ${this.y2}`
        }

    }

    maxAngle() {
        return Math.max(this.angle1, this.angle2)
    }

    minAngle() {
        return Math.min(this.angle1, this.angle2)
    }

    inAngles(angle) {
        if (this.angle_flag) {
            return angle < this.minAngle() || this.maxAngle() < angle;
        } else {
            return this.minAngle() < angle && angle < this.maxAngle();
        }
    }
}

class Circle {

    constructor(cx, cy, r, reflective) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.reflective = reflective;
    }

    draw(move) {
        throw "Can not draw circles in paths"
    }

    intersect(other) {
        return null;
    }
}

class Ray {

    // path is a list of points where the ray turns
    constructor(path) {
        this.path = "M " + path[0].x + " " + path[0].y + " L ";

        for (let i = 1; i < path.length; i++) {
            this.path += (path[i].x + " " + path[i].y + " ");
            if (i == path.length - 1) {
                this.path += ("M " + path[0].x + " " + path[0].y + " z")
            } else {
                this.path += ("L ")
            }
        }
    }

    draw() {
        return this.path;
    }
}

class Space {
    constructor() {
        this.paths = []
        this.geometry = []
        this.circles = []
    }

    add_thin(shape, reflective, style) {
        shape.reflective = reflective;
        this.geometry.push(shape);
        this.paths.push({
            path: shape.draw(true),
            class: "hollow " + style
        })
    }

    add_thins(shapes, reflective, style) {
        this.paths.push({
            path: "",
            class: "hollow " + style
        })
        let last = this.paths.length - 1
        for (let i = 0; i < shapes.length; i++) {
            shapes[i].reflective = reflective
            this.geometry.push(shapes[i]);
            this.paths[last].path += shapes[i].draw(true)
            // this.paths[last].path += " Z "
        }
    }

    add_solid(shapes, reflective, style) {
        this.paths.push({
            path: "",
            class: "solid " + style
        })

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].reflective = reflective;
            this.geometry.push(shapes[i]);
            this.paths[this.paths.length - 1].path += shapes[i].draw(i == 0)
        }
        this.paths[this.paths.length - 1].path += " Z "
    }

    add_circle(circle, reflective = false, style = "") {
        circle.reflective = reflective;
        circle.style = style;
        this.geometry.push(circle);
        this.circles.push(circle);
    }

    get_geometry() {
        return this.geometry;
    }

    draw() {
        return this.paths;
    }

    install(svg) {
        this.svg_object = svg.append("g");

        this.svg_object.selectAll("path").data(this.draw())
            .enter().append("path")
            .attrs({
                class: function (d) {
                    return d.class
                },
                d: function (d) {
                    return d.path;
                }
            });

        this.svg_object.selectAll("circle").data(this.circles)
            .enter().append("circle")
            .attrs({
                cx: function (d) {
                    return d.cx;
                },
                cy: function (d) {
                    return d.cy;
                },
                r: function (d) {
                    return d.r;
                },
                class: function (d) {
                    return d.style;
                }

            })
    }
}

class Beam {
    constructor(x1, y1, x2, y2, num_rays, beam_width, orientation = "free") {
        this.ray_gap = beam_width / num_rays;
        this.num_rays = num_rays;
        this.beam_width = beam_width;
        this.rays = [];
        this.radius = 10;

        this.orientation = orientation;
        if (orientation == "free") {
            this.data = [{
                x: x1,
                y: y1
            }, {
                x: x2,
                y: y2
            }]
        } else if (orientation == "down") {
            this.data = [{
                    x: x1,
                    y: y1
                },
                {
                    x: x1,
                    y: y1 + 10
                }
            ]
        }

        this.h = 350;
        this.w = 400;
    }

    setBounds(w, h) {
        this.w = w;
        this.h = h;
    }

    updateRays() {
        this.angle = Math.atan2(this.data[1].y - this.data[0].y, this.data[1].x - this.data[0].x);

        for (let i = 0; i < this.num_rays; i++) {
            this.rays[i] = new Ray(raycast(new Line(
                this.data[0].x + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.data[0].y - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle),
                this.data[1].x + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.data[1].y - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle)
            ), this.space.get_geometry()));
        }

    }

    drawRays() {
        this.svg_group.selectAll("path").data(this.rays)
            .attrs({
                d: function (d) {
                    return d.draw()
                }
            })
    }

    updateHandles() {
        if (this.orientation == "down") {
            this.data[1].x = this.data[0].x;
            this.data[1].y = this.data[0].y + 10;
        }
    }

    install(svg, space) {
        this.space = space;
        this.svg_group = svg.append("g");

        this.updateRays();

        this.svg_group.selectAll("path").data(this.rays)
            .enter().append("path")
            .attrs({
                d: "",
                class: "ray"
            });

        this.drawRays();

        let self = this;

        if (this.orientation == "free") {
            this.svg_group.selectAll("circle")
                .data(this.data)
                .enter().append("circle")
                .attrs({
                    cx: function (d) {
                        return d.x;
                    },
                    cy: function (d) {
                        return d.y;
                    },
                    r: this.radius,
                    class: "handle"
                }).call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", function (d) {
                        (dragged.bind(this))(d, self.w, self.h);
                        self.updateRays();
                        self.drawRays();
                    })
                    .on("end", dragended))
        } else if (this.orientation == "down") {
            this.svg_group.selectAll("ellipse")
                .data([this.data[0]]).enter().append("ellipse")
                .attrs({
                    cx: this.data[0].x,
                    cy: this.data[0].y,
                    ry: this.radius,
                    rx: this.beam_width/2,
                    class: "handle"
                }).call(d3.drag().on("start", dragstarted)
                    .on("drag", function (d) {
                        (dragged.bind(this))(d, self.w, self.h);
                        self.updateHandles();
                        self.updateRays();
                        self.drawRays();
                    })
                    .on("end", dragended))
        }


    }
}

function dragstarted(d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(d, w, h) {
    d3.select(this)
        .attr("cx", d.x = clamp(d3.event.x, 0, w))
        .attr("cy", d.y = clamp(d3.event.y, 0, h));

    // updateRays();
}

function dragended(d) {
    d3.select(this).classed("active", false);
}

class Bezier {
    constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.x3 = x3;
        this.y3 = y3;

        this.x4 = x4;
        this.y4 = y4;

        this.xCoeffs = [
            (-this.x1 + 3 * this.x2 - 3 * this.x3 + this.x4),
            (3 * this.x1 - 6 * this.x2 + 3 * this.x3),
            (-3 * this.x1 + 3 * this.x2),
            this.x1
        ]

        this.yCoeffs = [
            (-this.y1 + 3 * this.y2 - 3 * this.y3 + this.y4),
            (3 * this.y1 - 6 * this.y2 + 3 * this.y3),
            (-3 * this.y1 + 3 * this.y2),
            this.y1
        ]
    }

    f(t) {
        return {
            x: this.xCoeffs[0] * t * t * t + this.xCoeffs[1] * t * t + this.xCoeffs[2] * t + this.xCoeffs[3],
            y: this.yCoeffs[0] * t * t * t + this.yCoeffs[1] * t * t + this.yCoeffs[2] * t + this.yCoeffs[3]
        }
    }

    draw() {
        return `M ${this.x1} ${this.y1} C ${this.x2} ${this.y2} ${this.x3} ${this.y3} ${this.x4} ${this.y4}`
    }

    normal(t) {
        let dydt = this.yCoeffs[0] * 3 * t * t + this.yCoeffs[1] * 2 * t + this.yCoeffs[2],
            dxdt = this.xCoeffs[0] * 3 * t * t + this.xCoeffs[1] * 2 * t + this.xCoeffs[2];

        return Math.atan2(-dxdt, dydt);
    }

}

function cubicRoots(a, b, c, d) {
    if (close_enough(a, 0)) {

        // Woops, now it's quadratic :)

        let D = c * c - 4 * b * d;
        if (D < 0) {
            // No real solutions
            return [];
        } else if (D == 0) {
            // One solution
            return [
                (-c + Math.sqrt(D)) / (2 * b)
            ]
        } else {
            //Two solutions
            return [
                (-c + Math.sqrt(D)) / (2 * b),
                (-c - Math.sqrt(D)) / (2 * b)
            ]
        }
    } else {

        // from https://www.particleincell.com/2013/cubic-line-intersection/
        let A = b / a;
        let B = c / a;
        let C = d / a;

        let Q, R, D, S, T, Im;

        Q = (3 * B - A * A) / 9;
        R = (9 * A * B - 27 * C - 2 * Math.pow(A, 3)) / 54;
        D = Math.pow(Q, 3) + Math.pow(R, 2); // discriminant

        let answers = [];

        if (D >= 0) {

            S = sign(R + Math.sqrt(D)) * Math.pow(Math.abs(R + Math.sqrt(D)), (1 / 3));
            T = sign(R - Math.sqrt(D)) * Math.pow(Math.abs(R - Math.sqrt(D)), (1 / 3));

            answers[0] = -A / 3 + (S + T); // real
            answers[1] = -A / 3 - (S + T) / 2;
            answers[2] = -A / 3 - (S + T) / 2;
            Im = Math.abs(Math.sqrt(3) * (S - T) / 2);

            if (Im != 0) {
                answers = [answers[0]]
            }
        } else {
            let th = Math.acos(R / Math.sqrt(-Math.pow(Q, 3)));

            answers[0] = 2 * Math.sqrt(-Q) * Math.cos(th / 3) - A / 3;
            answers[1] = 2 * Math.sqrt(-Q) * Math.cos((th + 2 * Math.PI) / 3) - A / 3;
            answers[2] = 2 * Math.sqrt(-Q) * Math.cos((th + 4 * Math.PI) / 3) - A / 3;
            Im = 0.0;
        }

        return answers;
    }
}