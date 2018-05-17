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


        if (-Math.PI / 2 < theta && theta < Math.PI / 2) {
            // Pointing to the right

            // NB:
            // Positive y is down in this world
            // First quadrant is 0 to -90
            // Fourth quadrant is 0 to 90

            if (theta < 0) {
                // Up and to the right
                return point.x > ray.x1 && point.y < ray.y1;
            } else {
                // Down and to the right
                return point.x > ray.x1 && point.y >= ray.y1;
            }
        } else if (theta < -Math.PI / 2 || theta > Math.PI / 2) {
            // To the left
            if (theta < 0) {
                // Up and left
                return point.x < ray.x1 && point.y < ray.y1;
            } else {
                // Down and left
                return point.x < ray.x1 && point.y >= ray.y1;
            }
        } else if (theta == -Math.PI / 2) {
            return point.x == ray.x1 && point.y < ray.y1;
        } else if (theta == Math.PI / 2) {
            return point.x == ray.x1 && point.y > ray.y1;
        }
    })).sort(closest(ray.x1, ray.y1));

    let points = [];
    if(bounce == max_bounce){
        points.push({x: ray.x1, y: ray.y1})
    }

    if (intersections.length > 0) {
        points.push(intersections[0]);
        if (intersections[0].r) {
            

            let phi = reflect(ray.angle(), intersections[0].n)
            let reflected_ray = new Line(intersections[0].x, intersections[0].y, 0, 0, false);
            reflected_ray.polar(1, phi);

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

    f(x, domain = true) {
        if ((domain == false) || (Math.min(this.x1, this.x2) < x && x < Math.max(this.x1, this.x2))) {
            return this.slope() * (x - this.x1) + this.y1;
        } else {
            return undefined;
        }

    }

    angle(x) {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }

    normalAngle(x) {
        return -Math.atan2(this.x2 - this.x1, this.y2 - this.y1);
    }

    intersect(other) {
        if (other instanceof Circle) {
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

                // if (other.theta1 < n1 && n1 < other.theta2) {
                if (other.inAngles(n1)) {
                    points.push({
                        x: x1,
                        y: y1,
                        n: n1,
                        r: other.reflective
                    })
                }

                // if (other.theta1 < n2 && n2 < other.theta2) {
                if (other.inAngles(n2)) {
                    points.push({
                        x: x2,
                        y: y2,
                        n: n2,
                        r: other.reflective
                    })
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
                        let y = this.f(x, false);
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

            }
        }
    }
}

class Circle {

    constructor(cx, cy, r, reflective) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.reflective = reflective;
        this.theta1 = -Math.PI;
        this.theta2 = Math.PI;
        this.large_arc = false;
    }

    setAngles(theta1, theta2, large_arc) {
        this.theta1 = theta1;
        this.theta2 = theta2;
        this.large_arc = large_arc;
    }

    minAngle() {
        return Math.min(this.theta1, this.theta2);
    }

    maxAngle() {
        return Math.max(this.theta1, this.theta2)
    }

    inAngles(angle) {
        // I DO NOT KNOW WHY THIS WORKS
        // DO NOT ASK ME ABOUT THIS
        // IT IS LATE AND I AM TIRED
        // IT WORKS
        if ((this.large_arc && (Math.abs(this.theta2 - this.theta1) < Math.PI)) ||
            (!this.large_arc && (Math.abs(this.theta2 - this.theta1) > Math.PI))) {
            return angle < this.minAngle() || this.maxAngle() < angle;
        } else {
            return this.minAngle() < angle && angle < this.maxAngle();
        }
    }


    draw(move) {
        // if(this.large_arc){

        if (move) {
            return "M " + (this.cx + Math.cos(this.theta2) * this.r) + " " + (this.cy + Math.sin(this.theta2) * this.r) +
                " A " + this.r + " " + this.r + " 0 " + (this.large_arc ? 1 : 0) + " " + (this.flip ? 0 : 1) +
                " " + (this.cx + this.r * Math.cos(this.theta1)) + " " + (this.cy + this.r * Math.sin(this.theta1)) + " ";
        } else {
            return "A " + this.r + " " + this.r + " 0 " + (this.large_arc ? 1 : 0) + " " + (this.flip ? 0 : 1) +
                " " + (this.cx + this.r * Math.cos(this.theta1)) + " " + (this.cy + this.r * Math.sin(this.theta1)) + " ";
        }


        // }else{
        //     return "M " + (this.cx - Math.cos(this.theta1) * this.r) + " " + (this.cy - Math.sin(this.theta1) * this.r) +
        //         " A " + this.r + " " + this.r + " 0 " + (this.large_arc ? 1 : 0) + " " + (this.large_arc ? 0 : 1) +
        //         " " + (this.cx - this.r * Math.cos(this.theta2)) + " " + (this.cy - this.r * Math.sin(this.theta2));
        // }

    }

    arc(x1, y1, x2, y2, r, large_arc, flip) {

        // flip = 1 => clockwise

        this.r = r;
        let q = distance(x1, y1, x2, y2),
            xm = (x1 + x2) / 2,
            ym = (y1 + y2) / 2;

        console.log(q, xm, ym);

        let deltax = Math.sqrt(r ** 2 - (q / 2) ** 2) * (y1 - y2) / q,
            deltay = Math.sqrt(r ** 2 - (q / 2) ** 2) * (x2 - x1) / q;

        console.log(r ** 2 - (q / 2) ** 2);

        this.flip = flip;
        this.large_arc = large_arc;

        if (flip == large_arc) {
            this.cx = xm + deltax;
            this.cy = ym + deltay;
        } else {
            this.cx = xm - deltax;
            this.cy = ym - deltay;
        }

        // if(flip == large_arc){
        this.setAngles(Math.atan2(y2 - this.cy, x2 - this.cx),
            Math.atan2(y1 - this.cy, x1 - this.cx),
            large_arc);
        // }else{
        //      this.setAngles(Math.atan2(this.cy - y2, this.cx - x2),
        //          Math.atan2(this.cy - y1, this.cx - x1),
        //          large_arc);
        // }



    }

    intersect(other) {
        // if (other instanceof Line) {
        //     return other.intersect(this);
        // }
        return null;
    }
}

class Ray {

    // path is a list of points where the ray turns
    constructor(path){
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

    draw(){
        return this.path;
    }
}

class Space{
    // TODO
    // This class should support adding both solid and flat mirrors
    // It should also support solid and flat absorbers
    // It should expose a geometry list for use in raycasting
    // It should also expose a draw function
    constructor(){
        this.paths = []
        this.geometry = []
    }

    add_thin(shape, reflective, style) {
        shape.reflective = reflective;
        this.geometry.push(shape);
        this.paths.push({
            path: shape.draw(true),
            class: "hollow " + style
        })
    }

    add_thins(shapes, reflective, style){
        this.paths.push({
            path: "",
            class: "hollow " + style
        })
        let last = this.paths.length - 1
        for(let i = 0; i < shapes.length; i++){
            shapes[i].reflective = reflective
            this.geometry.push(shapes[i]);
            this.paths[last].path += shapes[i].draw(true)
            this.paths[last].path += " Z "
        }
    }

    add_solid(shapes, reflective, style){
        this.paths.push({
            path: "",
            class: "solid " + style
        })

        for(let i = 0; i < shapes.length; i++){
            shapes[i].reflective = reflective;
            this.geometry.push(shapes[i]);
            this.paths[this.paths.length - 1].path += shapes[i].draw(i == 0)
        }
        this.paths[this.paths.length - 1].path += " Z "
    }

    get_geometry(){
        return this.geometry;
    }

    draw(){
        return this.paths;
    }
}