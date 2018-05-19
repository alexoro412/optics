// NB: Positive Y is down in this world

// Also, I know this file is called "geometry.js"
// But it has non-geometry things as well

function make_sim(id, h, w) {
    return d3.select(id)
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })
}

function isOdd(x) {
    return x % 2 == 1;
}

function sign(x) {
    if (x < 0) {
        return -1;
    } else {
        return 1;
    }
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function closest(x, y) {
    return function (a, b) {
        return distance(x, y, a.x, a.y) - distance(x, y, b.x, b.y);
    }
}

function close_enough(a, b, tolerance = 0.01) {
    return Math.abs(a - b) < tolerance;
}

const max_bounce = 10;

function raycast(ray, geometry, bounce = max_bounce, ior = 0, strength = 1) {
    // if(strength == 1){
    //     console.log(ray.x1, ray.y1);
    // }
    if (bounce == 0 || strength < 0.01) return [];

    if (ior == 0) {
        ior = get_ior(geometry, ray.x1, ray.y1);
    }

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
        if (distance(ray.x1, ray.y1, point.x, point.y) < 0.001) return false;

        return ray.inRayDirection(point.x, point.y);
    })).sort(closest(ray.x1, ray.y1));

    let lines = [];
    // if (bounce == max_bounce) {
    //     lines.push({
    //         x: ray.x1,
    //         y: ray.y1
    //     })
    // }

    // 

    if (intersections.length > 0) {
        lines.push({
            x1: ray.x1,
            y1: ray.y1,
            x2: intersections[0].x,
            y2: intersections[0].y,
            strength: strength
        });
        if (intersections[0].opts.reflective) {
            // reflective
            let phi = reflect(ray.angle(), intersections[0].n)

            let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0, false);
            reflected_ray.polar(10, phi);

            if (intersections[0].opts.transmission != 0) {
                let transmitted_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);
                transmitted_ray.polar(10, ray.angle());
                lines = lines.concat(raycast(transmitted_ray, geometry, bounce - 1, ior, strength * intersections[0].opts.transmission));
            }

            return lines
                // .concat([{x:reflected_ray.x1, y: reflected_ray.y1}, {x:reflected_ray.x2, y: reflected_ray.y2}])
                .concat(raycast(reflected_ray, geometry, bounce - 1, ior, strength * intersections[0].opts.reflectance))
        } else if (intersections[0].opts.refractive) {
            let phi;
            let partial_strength;
            let refraction;
            let next_ior;
            if (ior == intersections[0].opts.ior) {
                // Probably return to vacuum
                // TODO check for interfaces between two non-vacuum materials
                refraction = refract(ray.angle(), intersections[0].n, ior, 1);
                phi = refraction[0];
                partial_strength = refraction[1];
                next_ior = 1;
            } else {
                refraction = refract(ray.angle(), intersections[0].n, ior, intersections[0].opts.ior);
                phi = refraction[0];
                partial_strength = refraction[1];
                next_ior = intersections[0].opts.ior;
            }
            let refracted_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);

            if (isNaN(phi)) {
                // TOTAL INTERAL REFLECTION !!!!!
                phi = reflect(ray.angle(), intersections[0].n)
                next_ior = ior;

                refracted_ray.polar(10, phi);

                return lines.concat(raycast(refracted_ray, geometry, bounce - 1, next_ior, strength));

            } else {
                // Refraction, and partial reflection
                refracted_ray.polar(10, phi);
                let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);
                reflected_ray.polar(10, reflect(ray.angle(), intersections[0].n));

                // TODO
                // Need to properly calculate percentage partial refraction


                // Why are these here, you may ask?
                // Because if I just take these expressions, and put them in the function 
                // IT BREAKS
                let r_strength = partial_strength * strength;
                let t_strength = strength * (1 - partial_strength);

                return lines
                    .concat(raycast(refracted_ray, geometry, bounce - 1, next_ior, t_strength))
                    .concat(raycast(reflected_ray, geometry, bounce - 1, ior, r_strength));
            }

        } else {
            return lines;
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

function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
}

function refract(alpha, theta, n1, n2) {
    // This bit of cleverness inspired by https://math.stackexchange.com/questions/701656/check-angle-between-two-lines-greater-than-90?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

    let d = dot(Math.cos(alpha), Math.sin(alpha), Math.cos(theta), Math.sin(theta))

    if (d > 0) {
        // Woops, need to flip the normal vector 
        theta = theta + Math.PI
        //  theta = Math.atan2(Math.sin(theta + Math.PI), Math.cos(theta + Math.PI))
    }
    let gamma = Math.PI - (alpha - theta);
    let beta = Math.asin(n1 / n2 * Math.sin(gamma));
    let phi = Math.PI + theta - beta;

    if (isNaN(phi)) {
        return [phi, 1]
    }

    let partial_strength = (1 / 2) * (
        Math.pow((n1 * Math.cos(gamma) - n2 * Math.cos(beta)) / (n1 * Math.cos(gamma) + n2 * Math.cos(beta)), 2) +
        Math.pow((n1 * Math.cos(beta) - n2 * Math.cos(gamma)) / (n1 * Math.cos(beta) + n2 * Math.cos(gamma)), 2))
    if (partial_strength > 1) {
        console.log("OH... So this shouldn't happen")
        console.log(partial_strength);
        console.log("gamma", gamma, Math.cos(gamma), Math.sin(gamma))
        console.log("beta", beta, Math.cos(beta))

        console.log(n1, n2, Math.cos(gamma), Math.cos(beta));

        console.log((n1 * Math.cos(gamma) - n2 * Math.cos(beta)) / (n1 * Math.cos(gamma) + n2 * Math.cos(beta)));

    }
    // 


    return [phi, partial_strength];



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
        return (this.x2 > this.x1 && x > this.x1) || // if point is to the right
            (this.x2 < this.x1 && x < this.x1) || // if point is to the left
            (close_enough(this.x2, this.x1, 0.01) && // if ray vertical
                (
                    (this.y2 > this.y1 && y > this.y1) || // if point is below
                    (this.y2 < this.y1 && y < this.y1) // if point is above
                ))
    }

    f(x, type) {
        if ((type == "line") || // set type to line to use full line, not just segment
            (Math.min(this.x1, this.x2) - 0.01 < x && x < Math.max(this.x1, this.x2) + 0.01)) {
            if (isFinite(this.slope())) {
                return this.slope() * (x - this.x1) + this.y1;
            } else {
                return undefined;
            }
        }
    }

    angle(x) {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }

    normalAngle(x) {
        return Math.atan2(this.x1 - this.x2, this.y2 - this.y1);
    }

    intersect(other) {
        if (other instanceof Bezier) {
            // https://www.particleincell.com/2013/cubic-line-intersection/
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
                o.opts = other.opts;
                return o;
            });

            return answers;
        } else if (other instanceof Circle || other instanceof Arc) {
            // http://mathworld.wolfram.com/Circle-LineIntersection.html

            let dx = this.x2 - this.x1,
                dy = this.y2 - this.y1,
                dr = Math.sqrt(dx * dx + dy * dy),
                D = (this.x1 - other.cx) * (this.y2 - other.cy) -
                (this.x2 - other.cx) * (this.y1 - other.cy),
                delta = (other.r * other.r * dr * dr) - D ** 2;

            if (delta <= 0) {
                // Return nothing if doesn't intersect, or is tangent
                return [];
            } else {

                // Calculate points
                let x1 = (D * dy + sign(dy) * dx * Math.sqrt(delta)) / (dr ** 2) + other.cx,
                    y1 = (-D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy,
                    x2 = (D * dy - sign(dy) * dx * Math.sqrt(delta)) / (dr ** 2) + other.cx,
                    y2 = (-D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy;

                // Calculate normal angles
                let n1 = Math.atan2(y1 - other.cy, x1 - other.cx),
                    n2 = Math.atan2(y2 - other.cy, x2 - other.cx);

                let points = [];

                let p1 = {
                    x: x1,
                    y: y1,
                    n: n1,
                    opts: other.opts
                }

                let p2 = {
                    x: x2,
                    y: y2,
                    n: n2,
                    opts: other.opts
                }

                if (other instanceof Circle) {
                    points.push(p1);
                    points.push(p2);
                } else if (other instanceof Arc) {
                    if (other.inAngles(n1)) {
                        points.push(p1)
                    }

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
                        return [{
                            x: x,
                            y: y,
                            n: other.normalAngle(),
                            opts: other.opts
                        }]
                    } else {
                        // ray non vertical
                        // surface vertical 
                        let x = other.x1;
                        let y = this.f(x, "line");
                        if (Math.min(other.y1, other.y2) < y && y < Math.max(other.y1, other.y2)) {
                            return [{
                                x: x,
                                y: y,
                                n: other.normalAngle(),
                                opts: other.opts
                            }]
                        } else {
                            return [];
                        }

                    }
                } else {
                    if (isFinite(other.slope())) {
                        let x = this.x1;
                        let y = other.f(x);
                        if (y == undefined) {
                            return [];
                        } else {
                            return [{
                                x: x,
                                y: y,
                                n: other.normalAngle(),
                                opts: other.opts
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

    constructor(x1, y1, x2, y2, x3, y3) {
        // I don't understand this
        // I got it from:
        // https://stackoverflow.com/questions/43825414/draw-an-svg-arc-using-d3-knowing-3-points-on-the-arc?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

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
            return angle < this.minAngle() + 0.001 || this.maxAngle() - 0.001 < angle;
        } else {
            return this.minAngle() - 0.001 < angle && angle < this.maxAngle() + 0.001;
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
        throw "Can't draw circles in paths. Use space.add_circle()"
    }

    intersect(other) {
        return null;
    }
}

class Ray {

    // path is a list of lines
    constructor(path) {
        this.path = path;
        // this.path = "M " + path[0].x + " " + path[0].y + " L ";
        // this.path = "";
        // for (let i = 0; i < path.length; i++) {
        //     this.path += `M ${path[i].x1} ${path[i].y1} L ${path[i].x2} ${path[i].y2}`
        //     // this.path += (path[i].x + " " + path[i].y + " ");
        //     // if (i == path.length - 1) {
        //     //     this.path += ("M " + path[0].x + " " + path[0].y + " z")
        //     // } else {
        //     //     this.path += ("L ")
        //     // }
        // }
    }

    draw() {
        return this.path;
    }
}

function set_if_undefined(v, d) {
    return (v === undefined) ? d : v;
}

function set_default_opts(opts) {
    opts.reflective = set_if_undefined(opts.reflective, false);
    opts.style = set_if_undefined(opts.style, "");
    opts.ior = set_if_undefined(opts.ior, 0);
    opts.refractive = set_if_undefined(opts.refractive, false);
    if (opts.refractive) {
        opts.reflectance = set_if_undefined(opts.reflectance, 0.1);
        opts.transmission = set_if_undefined(opts.transmission, 0.9);
    } else {
        opts.reflectance = set_if_undefined(opts.reflectance, 1);
        opts.transmission = set_if_undefined(opts.transmission, 0);
    }
    return opts;
}

// fair warning
// does not work with clipped/overlapped objects
function get_ior(geometry, x, y) {
    intersections = [];

    // Cast a ray from a point off screen :D
    let ray = new Line(-100, -100, x, y);

    for (let g of geometry) {
        intersections = intersections.concat(ray.intersect(g));
    }

    if (intersections.length == 0) {
        console.log("THIS SHOULDN'T HAPPEN EITHER")
    }

    intersections = intersections.filter(function (intersection) {
        if (distance(intersection.x, intersection.y, x, y) < 0.01) return false;
        return intersection.opts.refractive && intersection.x <= x && intersection.y <= y;
    }).map(function (intersection) {
        return intersection.opts.ior;
    });

    if (intersections.length == 0) {
        return 1;
    }

    let iors = {};
    for (let n of intersections) {
        if (iors[n] === undefined) {
            iors[n] = 1
        } else {
            iors[n] += 1
        }
    }

    let ior = 1;

    for (let n of Object.keys(iors)) {
        if (isOdd(iors[n])) {
            ior = +n
        }
    }

    return ior;
}

class Space {
    constructor() {
        this.paths = []
        this.geometry = []
        this.circles = []
        this.installed = false;
        this.w = 400;
        this.h = 350;
        this.listeners = [];
    }

    setBounds(w, h) {
        this.w = w;
        this.h = h;
    }

    add_borders() {
        this.add_thins([
            new Line(-this.w, -this.h, 2 * this.w, -this.h),
            new Line(2 * this.w, -this.h, 2 * this.w, 2 * this.h),
            new Line(2 * this.w, 2 * this.h, -this.w, 2 * this.h),
            new Line(-this.w, 2 * this.h, -this.w, -this.h)
        ], {
            reflective: false,
            style: ""
        })
    }

    add_thin(shape, opts) {
        opts = set_default_opts(opts);
        if (opts.refractive) {
            throw "Can't have refractive thins"
        }
        shape.opts = opts;
        this.geometry.push(shape);
        this.paths.push({
            path: shape.draw(true),
            class: opts.style
        })
    }

    add_thins(shapes, opts) {
        opts = set_default_opts(opts);
        if (opts.refractive) {
            throw "Can't have refractive thins"
        }
        this.paths.push({
            path: "",
            class: opts.style
        })
        let last = this.paths.length - 1
        for (let i = 0; i < shapes.length; i++) {
            shapes[i].opts = opts;
            this.geometry.push(shapes[i]);
            this.paths[last].path += shapes[i].draw(true)
            // this.paths[last].path += " Z "
        }
    }

    add_solid(shapes, opts) {
        opts = set_default_opts(opts);
        this.paths.push({
            path: "",
            class: opts.style
        })

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].opts = opts;
            this.geometry.push(shapes[i]);
            this.paths[this.paths.length - 1].path += shapes[i].draw(i == 0)
        }
        this.paths[this.paths.length - 1].path += " Z "
    }

    add_circle(circle, opts) {
        circle.opts = set_default_opts(opts);
        circle.style = opts.style;
        this.geometry.push(circle);
        this.circles.push(circle);
    }

    add_rect(x, y, w, h, opts) {
        this.add_solid([
            new Line(x, y, x + w, y),
            new Line(x + w, y, x + w, y + h),
            new Line(x + w, y + h, x, y + h),
            new Line(x, y + h, x, y)
        ], opts)
    }

    get_geometry() {
        return this.geometry;
    }

    draw() {
        return this.paths;
    }

    install(svg) {
        if (!this.installed) {
            this.svg_object = svg.append("g");
            this.installed = true;
        }


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

        this.rays = [];

        for (let i = 0; i < this.num_rays; i++) {
            // console.log("NOW RAYCASTING");
            this.rays = this.rays.concat(raycast(new Line(
                this.data[0].x + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.data[0].y - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle),
                this.data[1].x + (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.sin(this.angle),
                this.data[1].y - (i - (this.num_rays / 2) + 0.5) * this.ray_gap * Math.cos(this.angle)
            ), this.space.get_geometry()));
        }

    }

    drawRays() {
        // this.svg_group.selectAll("path").data(this.rays)
        //     .attrs({
        //         d: function (d) {
        //             return d.draw()
        //         }
        //     })
        let lines = this.beam_group.selectAll("line").data(this.rays);

        lines.exit().remove();

        // lines.attr("x1", function(d){return d.x1;});
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
                return Math.floor(1000 * d.strength) / 1000;
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
                return Math.floor(1000 * d.strength) / 1000;
            }
        })

        // lines.exit().remove();
    }

    updateHandles() {
        if (this.orientation == "down") {
            this.data[1].x = this.data[0].x;
            this.data[1].y = this.data[0].y + 10;
        }
    }

    install(svg, space) {
        this.space = space;
        this.beam_group = svg.append("g");
        this.handle_group = svg.append("g");


        this.updateRays();

        // this.svg_group.selectAll("path").data(this.rays)
        //     .enter().append("path")
        //     .attrs({
        //         d: "",
        //         class: "ray"
        //     });


        this.drawRays();

        let self = this;

        if (this.orientation == "free") {
            this.handle_group.selectAll("circle")
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
            this.handle_group.selectAll("ellipse")
                .data([this.data[0]]).enter().append("ellipse")
                .attrs({
                    cx: this.data[0].x,
                    cy: this.data[0].y,
                    ry: this.radius,
                    rx: this.beam_width / 2,
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

// This function solves cubics
// That's right
// It uses the cubic formula
// You jealous?
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

            if (Im != 0) { // May need to change this part to use close_enough
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