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

function raycast(ray, geometry, bounce = 10) {
    if (bounce == 0) return [];

    intersections = [];

    for (let g of geometry) {
        intersections = intersections.concat(ray.intersect(g));
    }

    let theta = ray.angle();

    if(intersections.length == 0) {
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


    if (intersections.length > 0) {
        if (intersections[0].r) {
            let p = intersections[0];

            let phi = reflect(ray.angle(), p.n)
            let reflected_ray = new Line(p.x, p.y, 0, 0, false);
            reflected_ray.polar(1, phi);

            return ([p])
                // .concat([{x:reflected_ray.x1, y: reflected_ray.y1}, {x:reflected_ray.x2, y: reflected_ray.y2}])
                .concat(raycast(reflected_ray, geometry, bounce - 1))
        } else {
            return [intersections[0]];
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

    moveTo(x1,y1,x2,y2){
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

                if(other.theta1 < n1 && n1 < other.theta2){
                    points.push({
                        x: x1,
                        y: y1,
                        n: n1,
                        r: other.reflective
                    })
                }

                if(other.theta1 < n2 && n2 < other.theta2){
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
                        if(Math.min(other.y1, other.y2) < y && y < Math.max(other.y1, other.y2)){
                            return [{
                                x: x,
                                y: y,
                                n: other.normalAngle(),
                                r: other.reflective
                            }]
                        }else{
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
                    }else{
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
        this.theta1 = - Math.PI;
        this.theta2 = Math.PI
    }

    setAngles(theta1, theta2){
        this.theta1 = Math.min(theta1, theta2);
        this.theta2 = Math.max(theta1, theta2);
    }

    intersect(other) {
        // if (other instanceof Line) {
        //     return other.intersect(this);
        // }
        return null;
    }
}