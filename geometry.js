// NB: Positive Y is down in this world

// Also, I know this file is called "geometry.js"
// But it has non-geometry things as well

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

function map(num, min1, max1, min2, max2) {
    return (num - min1) / (max1 - min1) * (max2 - min2) + min2
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

function merge(o, defaults) {
    for (let k of Object.keys(defaults)) {
        if (typeof o[k] === "undefined") {
            o[k] = defaults[k]
        }
    }
}

const max_bounce = 10;

function raycast(ray, geometry, bounce = max_bounce, ior = 0, strength = 1, color = "red", min_strength = 0.05) {
    if (bounce == 0 || strength < min_strength) return [];

    if (ior == 0) {
        // console.log("getting ior")
        ior = get_ior(geometry, ray.x1, ray.y1, color);
        // console.log("ior:", ior);
    }

    intersections = [];

    // console.log(geometry);

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
        if (distance(ray.x1, ray.y1, point.x, point.y) <= 0.05) return false;

        return ray.inRayDirection(point.x, point.y) && !point.opts.transparent;
    })).sort(closest(ray.x1, ray.y1));

    let lines = [];

    if (intersections.length > 0) {

        lines.push({
            x1: ray.x1,
            y1: ray.y1,
            x2: intersections[0].x,
            y2: intersections[0].y,
            strength: strength,
            color: color
        });
        // console.log(intersections);
        if (intersections.length > 1 && !(intersections[0].opts.refractive && intersections[1].opts.refractive) && close_enough(0, distance(intersections[0].x, intersections[0].y, intersections[1].x, intersections[1].y), 0.1)) {
            // CORNER DETECTED
            return lines;
        } else if (intersections[0].opts.reflective) {
            // reflective
            let phi = reflect(ray.angle(), intersections[0].n)

            let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0, false);
            reflected_ray.polar(10, phi);

            let i_reflectance;
            if(typeof intersections[0].opts.reflectance === "object"){
                i_reflectance = intersections[0].opts.reflectance[color];
            } else{
                i_reflectance = intersections[0].opts.reflectance;
            }

            let r_strength = strength * i_reflectance;

            if(typeof intersections[0].opts.transmission === "object"){
                let transmitted_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);
                transmitted_ray.polar(10, ray.angle());
                let t_strength = strength * intersections[0].opts.transmission[color];
                lines = lines.concat(raycast(transmitted_ray, geometry, bounce - 1, ior, t_strength, color));
            }else if (intersections[0].opts.transmission != 0) {
                let transmitted_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);
                transmitted_ray.polar(10, ray.angle());
                let t_strength = strength * intersections[0].opts.transmission;
                lines = lines.concat(raycast(transmitted_ray, geometry, bounce - 1, ior, t_strength, color));
            }

            return lines
                .concat(raycast(reflected_ray, geometry, bounce - 1, ior, r_strength, color))
        } else if (intersections[0].opts.refractive) {
            let phi;
            let partial_strength;
            let refraction;
            let next_ior;
            let i_ior;
            if(typeof intersections[0].opts.ior === "object"){
                i_ior = intersections[0].opts.ior[color];
            }else{
                i_ior = intersections[0].opts.ior;
            }

            if (ior == i_ior) {
                if (intersections.length > 1 && close_enough(0, distance(intersections[0].x, intersections[0].y, intersections[1].x, intersections[1].y))) {
                    // Interface between two materials, leaving refractive
                    if (intersections[1].opts.reflective) {
                        // TODO, does this part work?
                        // reflective surface on refractive one
                        phi = reflect(ray.angle(), intersections[1].n)
                        let reflected_ray = new Line(intersections[1].x, intersections[1].y, 0, 0, false);
                        reflected_ray.polar(10, phi);

                        let r_strength = strength * intersections[1].opts.reflectance;

                        if (intersections[1].opts.transmission != 0) {
                            let transmitted_ray = new Line(intersections[1].x, intersections[1].y, 0, 0);
                            transmitted_ray.polar(10, ray.angle());
                            let t_strength = strength * intersections[1].opts.transmission;
                            lines = lines.concat(raycast(transmitted_ray, geometry, bounce - 1, ior, t_strength, color));
                        }

                        return lines
                            .concat(raycast(reflected_ray, geometry, bounce - 1, ior, r_strength))

                    } else {
                        // two refractive materials
                        // console.log("red", ior, intersections[0].opts.ior, intersections[1].opts.ior)
                        let i2_ior;
                        if(typeof intersections[1].opts.ior === "object"){
                            i2_ior = intersections[1].opts.ior[color]
                        }else{
                            i2_ior = intersections[1].opts.ior;
                        }
                        if (i_ior == ior) {
                            refraction = refract(ray.angle(), intersections[1].n, ior, i2_ior);
                        } else {
                            // woops, flipped
                            refraction = refract(ray.angle(), intersections[1].n, ior, i_ior);
                        }

                        phi = refraction[0];
                        partial_strength = refraction[1];
                        next_ior = i2_ior;
                    }
                } else {
                    // return to vacuum
                    refraction = refract(ray.angle(), intersections[0].n, ior, 1);
                    phi = refraction[0];
                    partial_strength = refraction[1];
                    next_ior = 1;
                }

            } else {
                refraction = refract(ray.angle(), intersections[0].n, ior, i_ior);
                phi = refraction[0];
                partial_strength = refraction[1];
                next_ior = i_ior;
            }

            let refracted_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);

            if (isNaN(phi)) {
                // TOTAL INTERAL REFLECTION !!!!!
                phi = reflect(ray.angle(), intersections[0].n)
                next_ior = ior;

                refracted_ray.polar(10, phi);

                return lines.concat(raycast(refracted_ray, geometry, bounce - 1, next_ior, strength, color));

            } else {
                // Refraction, and partial reflection
                refracted_ray.polar(10, phi);
                let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0);
                reflected_ray.polar(10, reflect(ray.angle(), intersections[0].n));


                // Why are these here, you may ask?
                // Because if I just take these expressions, and put them in the function 
                // IT BREAKS
                let r_strength = partial_strength * strength;
                let t_strength = strength * (1 - partial_strength);

                return lines
                    .concat(raycast(refracted_ray, geometry, bounce - 1, next_ior, t_strength, color))
                    .concat(raycast(reflected_ray, geometry, bounce - 1, ior, r_strength, color));
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
    // This bit of cleverness brought to you by https://math.stackexchange.com/questions/701656/check-angle-between-two-lines-greater-than-90?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

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
        Math.pow((n1 * Math.cos(beta) - n2 * Math.cos(gamma)) / (n1 * Math.cos(beta) + n2 * Math.cos(gamma)), 2));


    if (partial_strength > 1) {
        console.log("OH... So this shouldn't happen")
        console.log(partial_strength);
        console.log("gamma", gamma, Math.cos(gamma), Math.sin(gamma))
        console.log("beta", beta, Math.cos(beta))

        console.log(n1, n2, Math.cos(gamma), Math.cos(beta));

        console.log((n1 * Math.cos(gamma) - n2 * Math.cos(beta)) / (n1 * Math.cos(gamma) + n2 * Math.cos(beta)));

    }

    return [phi, partial_strength];
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
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
        // Dot product saves the day yet again
        let x1 = x - this.x1,
            y1 = y - this.y1,
            x2 = this.x2 - this.x1,
            y2 = this.y2 - this.y1,
            dot = x1 * x2 + y1 * y2,
            M1 = Math.sqrt(x1 * x1 + y1 * y1),
            M2 = Math.sqrt(x2 * x2 + y2 * y2),
            cos = dot / (M1 * M2);
        return close_enough(cos, 1, 0.1);
        // return close_enough(Math.atan2(y - this.y1, x - this.x1), Math.atan2(this.y1 - this.y1))
        // return (this.x2 > this.x1 && x > this.x1) || // if point is to the right
        //     (this.x2 < this.x1 && x < this.x1) || // if point is to the left
        //     (close_enough(this.x2, this.x1, 0.0000000001) && // if ray vertical
        //         (
        //             (this.y2 > this.y1 && y > this.y1) || // if point is below
        //             (this.y2 < this.y1 && y < this.y1) // if point is above
        //         ))
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
                // console.log('problem?')
            }

            let a = Ax * other.xCoeffs[0] + Ay * other.yCoeffs[0];
            let b = Ax * other.xCoeffs[1] + Ay * other.yCoeffs[1];
            let c = Ax * other.xCoeffs[2] + Ay * other.yCoeffs[2];
            let d = Ax * other.xCoeffs[3] + Ay * other.yCoeffs[3] - C;


            // console.log("cubic ", a ,b ,c, d);
            let roots = cubicRoots(a, b, c, d);
            // console.log(roots);
            roots = roots.filter(function (x) {
                return -0.0001 <= x && x <= 1.0001;
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

        let cos_value = (A * A + B * B - C * C) / (2 * A * B);
        if(close_enough(cos_value, -1, 0.001)){
            cos_value = -1;
        }else if(close_enough(cos_value, 1, 0.001)){
            cos_value = 1;
        }

        let angle = Math.acos(cos_value);

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

        if (this.saf != this.laf) {
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

    constructor(cx, cy, r) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
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
    opts.transparent = set_if_undefined(opts.transparent, false);
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
// probably won't with clipped/overlapped objects
function get_ior(geometry, x, y, color) {
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
        if(typeof intersection.opts.ior === "object"){
            return intersection.opts.ior[color];
        }else{
            return intersection.opts.ior;
        }
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


// FROM https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

class Space {
    constructor() {
        this.paths = []
        this.geometry = {}
        this.geometry_list = [];
        this.circles = []
        this.installed = false;
        this.w = 400;
        this.h = 350;
    }

    setBounds(w, h) {
        this.w = w;
        this.h = h;
    }

    update_geometry() {
        this.geometry_list = []
        for (let k of Object.keys(this.geometry)) {
            if (this.geometry[k].isGroup) {
                for (let k2 in this.geometry[k].shapes) {
                    this.geometry_list.push(this.geometry[k].shapes[k2])
                }
            } else {
                this.geometry_list.push(this.geometry[k].shape)
            }
        }
    }

    update_paths() {
        this.paths = []
        for (let k of Object.keys(this.geometry)) {
            this.paths.push({
                path: "",
                class: this.geometry[k].opts.style
            })
            let path_index = this.paths.length - 1
            if (this.geometry[k].isGroup) {
                if (this.geometry[k].isSolid) {
                    // solid group
                    for (let i in this.geometry[k].shapes) {
                        this.paths[path_index].path += this.geometry[k].shapes[i].draw(i == 0)
                    }
                    this.paths[path_index].path += " Z"
                } else {
                    //group of thins
                    for (let i in this.geometry[k].shapes) {
                        this.paths[path_index].path += this.geometry[k].shapes[i].draw(true);
                    }
                }
            } else {
                // not a group
                if (this.geometry[k].type == "thin") {
                    this.paths[path_index].class += " hollow"
                    this.paths[path_index].path += this.geometry[k].shape.draw(true)
                }

            }
        }
    }

    add_borders() {
        this.add_thins([
            new Line(-this.w, -this.h, 2 * this.w, -this.h),
            new Line(2 * this.w, -this.h, 2 * this.w, 2 * this.h),
            new Line(2 * this.w, 2 * this.h, -this.w, 2 * this.h),
            new Line(-this.w, 2 * this.h, -this.w, -this.h)
        ], {
            reflective: false,
            style: "border"
        })
        this.add_thins([
            new Line(0, 0, this.w, 0),
            new Line(this.w, 0, this.w, this.h),
            new Line(this.w, this.h, 0, this.h),
            new Line(0, this.h, 0, 0)
        ], {
            transparent: true,
            style: "border"
        })
    }

    add_thin(shape, opts, shape_id) {
        if (typeof shape_id === "undefined") {
            // Adding new
            shape_id = guidGenerator();
        } else {
            // Updating
            opts = Object.assign(this.geometry[shape_id].opts, opts);
            // console.log(this.geometry[shape_id])
            if (typeof shape === "undefined") {
                shape = this.geometry[shape_id].shape
            }
        }
        opts = set_default_opts(opts);
        if (opts.refractive) {
            throw "Can't have refractive thins"
        }
        shape.opts = opts;
        this.geometry[shape_id] = {
            shape: shape,
            id: shape_id,
            opts: opts,
            isGroup: false,
            isSolid: false,
            type: "thin"
        }
        this.update_geometry();
        this.update_paths();
        return shape_id;
    }

    add_thins(shapes, opts, shape_id) {
        if (typeof shape_id === "undefined") {
            // Adding new
            shape_id = guidGenerator();
        } else {
            // Updating
            opts = Object.assign(this.geometry[shape_id].opts, opts);
            if (typeof shapes === "undefined") {
                shapes = this.geometry[shape_id].shapes
            }
        }
        opts = set_default_opts(opts);
        if (opts.refractive) {
            throw "Can't have refractive thins"
        }
        this.paths.push({
            path: "",
            class: opts.style
        })
        let last = this.paths.length - 1

        this.geometry[shape_id] = {
            isGroup: true,
            isSolid: false,
            shapes: [],
            opts: opts,
            id: shape_id,
            type: "thins"
        };

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].opts = opts;
            this.geometry[shape_id].shapes.push(shapes[i]);
        }
        this.update_geometry();
        this.update_paths();
        return shape_id;
    }

    add_solid(shapes, opts, shape_id) {
        if (typeof shape_id === "undefined") {
            // Adding new
            shape_id = guidGenerator();
        } else {
            // Updating
            opts = Object.assign(this.geometry[shape_id].opts, opts);
            if (typeof shapes === "undefined") {
                shapes = this.geometry[shape_id].shapes
            }
        }

        opts = set_default_opts(opts);

        this.geometry[shape_id] = {
            isGroup: true,
            shapes: [],
            opts: opts,
            id: shape_id,
            isSolid: true,
            type: "solid"
        };

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].opts = opts;
            this.geometry[shape_id].shapes.push(shapes[i]);
        }
        this.update_geometry();
        this.update_paths();
        return shape_id;
    }

    add_circle(circle, opts, shape_id) {
        if (typeof shape_id === "undefined") {
            // Adding new
            shape_id = guidGenerator();
        } else {
            // Updating
            opts = Object.assign(this.geometry[shape_id].opts, opts);
            if (typeof circle === "undefined") {
                circle = this.geometry[shape_id].shape
            }
        }
        circle.opts = set_default_opts(opts);
        circle.style = opts.style;
        this.geometry[shape_id] = {
            shape: circle,
            id: shape_id,
            opts: opts,
            isGroup: false,
            type: "circle"
        }
        this.update_geometry();
        this.circles[shape_id] = circle;
        return shape_id;
    }

    add_rect(x, y, w, h, opts) {
        return this.add_solid([
            new Line(x, y, x + w, y),
            new Line(x + w, y, x + w, y + h),
            new Line(x + w, y + h, x, y + h),
            new Line(x, y + h, x, y)
        ], opts)
    }

    get_geometry() {
        return this.geometry_list;
    }

    draw() {
        return this.paths;
    }

    install(svg) {
        if (!this.installed) {
            this.svg_object = svg.append("g");
            this.installed = true;
        }


        let paths = this.svg_object.selectAll("path")
            .data(this.draw(), function (d) {
                return d;
            });


        paths.exit().remove();

        paths.attrs({
            class: function (d) {
                return d.class
            },
            d: function (d) {
                return d.path;
            }
        })

        paths.enter().append("path")
            .attrs({
                class: function (d) {
                    return d.class
                },
                d: function (d) {
                    return d.path;
                }
            });



        let self = this;

        let circles = this.svg_object.selectAll("circle")
            .data(Object.keys(this.circles), function (d) {
                return d;
            });

        circles.exit().remove();

        circles.attrs({
            cx: function (d) {
                return self.circles[d].cx;
            },
            cy: function (d) {
                return self.circles[d].cy;
            },
            r: function (d) {
                return self.circles[d].r;
            },
            class: function (d) {
                return self.circles[d].style;
            },
            id: function (d) {
                return d;
            }
        })


        circles.enter().append("circle")
            .attrs({
                cx: function (d) {
                    return self.circles[d].cx;
                },
                cy: function (d) {
                    return self.circles[d].cy;
                },
                r: function (d) {
                    return self.circles[d].r;
                },
                class: function (d) {
                    return self.circles[d].style;
                },
                id: function (d) {
                    return d;
                }
            })
    }
}

function dragstarted(d) {
    d3.select(this).raise()
    // .classed("active", true);
}

function dragged(d, w, h) {
    d3.select(this)
        .attr("cx", d.x = clamp(d3.event.x, 0, w))
        .attr("cy", d.y = clamp(d3.event.y, 0, h));
}

function dragended(d) {
    d3.select(this)
    // .classed("active", false);
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

    draw(move) {
        if (move) {
            return `M ${this.x1} ${this.y1} C ${this.x2} ${this.y2} ${this.x3} ${this.y3} ${this.x4} ${this.y4}`
        } else {
            return `C ${this.x2} ${this.y2} ${this.x3} ${this.y3} ${this.x4} ${this.y4}`
        }
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
    // console.log("cubic", a,b,c,d);
    if (close_enough(a, 0, 0.01)) {
        if (close_enough(b, 0, 0.01)) {
            // Woops, it's a line!
            return [-d / c]
        }
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

function make_sim(id, h, w) {
    return d3.select(id)
        .append("svg")
        .attrs({
            class: "sim",
            height: h,
            width: w
        })
}

class Parabola {
    constructor(h, k, a, w) {
        this.x = [];
        this.y = [];
        this.a = a;
        this.h = h;
        this.k = k;
        this.w = w;

        this.recalc();
    }

    recalc() {
        this.x[0] = this.h - this.w;
        this.y[0] = this.f(this.x[0]);

        this.x[3] = this.h + this.w;
        this.y[3] = this.f(this.x[3]);

        this.x[1] = (4 / 3) * (((2 * this.h - this.w) / 2) - (this.h - this.w)) + (this.h - this.w);
        this.y[1] = this.g(this.x[1]);
        // console.log("g(x1)", this.x[1], this.g(this.x[1]));

        this.x[2] = 2 * this.h - this.x[1];
        this.y[2] = this.y[1];
    }

    f(x) {
        return this.a * (x - this.h) * (x - this.h) + this.k;
    }

    g(x) {
        return 2 * this.a * (this.x[0] - this.h) * (x - this.x[0]) + this.y[0]
    }

    shape() {
        // console.log(this.x, this.y);
        return new Bezier(
            this.x[0], this.y[0],
            this.x[1], this.y[1],
            this.x[2], this.y[2],
            this.x[3], this.y[3]
        )
    }
}

class Ellipse {
    constructor(x, y, w, h) {
        // from https://stackoverflow.com/questions/14169234/the-relation-of-the-bezier-curve-and-ellipse?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
        let kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w, // x-end
            ye = y + h, // y-end
            xm = x + w / 2, // x-middle
            ym = y + h / 2; // y-middle

        this.shapes = [
            new Bezier(x, ym, x, ym - oy, xm - ox, y, xm, y),
            new Bezier(xm, y, xm + ox, y, xe, ym - oy, xe, ym),
            new Bezier(xe, ym, xe, ym + oy, xm + ox, ye, xm, ye),
            new Bezier(xm, ye, xm - ox, ye, x, ym + oy, x, ym)
        ]
    }
}

class Sim {
    constructor(div_id, h = 350, w = 400) {
        this.lights = {};

        this.svg = d3.select(div_id)
            .append("svg")
            .attrs({
                class: "sim",
                // height: h,
                viewBox: `0 0 ${w} ${h}`,
                // width: w,

            })

        this.ui_elems = {}

        this.ui_group = this.svg.append("g");

        this.ray_group = this.svg.append("g");
        this.ray_group.attr("class", "ray-group");

        this.space = new Space();
        this.space.setBounds(w, h);

        this.dark = false;

        this.add_borders();

        this.space.install(this.svg);
    }

    darken(){
        if(this.dark){
            this.svg.attr("class", "sim")
        }else{
            this.svg.attr("class", "sim dark")
        }
        this.dark = !this.dark;
    }

    update_lights() {
        for (let k of Object.keys(this.lights)) {
            this.lights[k].updateRays();
            this.lights[k].drawRays();
        }
    }

    update_svg() {
        this.space.install(this.svg);
    }

    update() {
        this.update_svg();
        this.update_lights();
        this.ray_group.raise();
        this.ui_group.raise();
    }

    add_ui(ui) {
        let ui_id = guidGenerator();
        let elem_group = this.ui_group.append("g").attr("id", ui_id)
        this.ui_elems[ui_id] = {
            type: ui.type,
            id: ui_id,
            svg_group: elem_group,
            elem: ui // TODO may be unecessary 
        };

        ui.install(elem_group);
        this.ui_group.raise();
        return ui_id;
    }

    add_borders() {
        this.border_id = this.space.add_borders();
        this.update();
    }

    add_solid(solid, opts, shape_id) {
        let id = this.space.add_solid(solid, opts, shape_id);
        this.update();
        return id;
    }

    add_thin(shape, opts, shape_id) {
        let id = this.space.add_thin(shape, opts, shape_id);
        this.update();
        return id;
    }

    add_thins(shapes, opts, shape_id) {
        let id = this.space.add_thins(shapes, opts, shape_id);
        this.update();
        return id;
    }

    add_light(light) {
        let light_id = guidGenerator();
        this.lights[light_id] = light;
        light.install(this.ray_group, this.space);
        if (light.ui != undefined) {
            for (let h of light.handles) {
                this.add_ui(h);
            }
        }
        // for (let b of Object.keys(this.lights)) {
        //     this.lights[b].raise_handles();
        // }
    }

    add_circle(circle, opts, shape_id) {
        let id = this.space.add_circle(circle, opts, shape_id);
        this.update();
        return id;
    }

    add_rect(x, y, w, h, opts) {
        let id = this.space.add_rect(x, y, w, h, opts);
        this.update();
        return id;
    }

    update_shape_opts(shape_id, opts) {
        // this.space.
        switch (this.space.geometry[shape_id].type) {
            case "solid":
                this.add_solid(undefined, opts, shape_id)
                break;
            case "circle":
                this.add_circle(undefined, opts, shape_id)
                break;
            case "thin":
                this.add_thin(undefined, opts, shape_id)
                break;
            case "thins":
                this.add_thins(undefined, opts, shape_id)
                break;
            default:
                break;
        }
        this.update();
    }

    update_shape_geometry(shape_id, geometry) {
        switch (this.space.geometry[shape_id].type) {
            case "solid":
                this.add_solid(geometry, {}, shape_id)
                break;
            case "circle":
                this.add_circle(geometry, {}, shape_id)
                break;
            case "thin":
                this.add_thin(geometry, {}, shape_id)
                break;
            case "thins":
                this.add_thins(geometry, {}, shape_id)
                break;
            default:
                break;
        }
        this.update();
    }
}