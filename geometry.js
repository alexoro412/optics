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

function raycast(x1, y1, m, geometry) {
    let ray = new Line(x1, y1, x1 + 1, y1 + m);

    intersections = [];

    for (let g of geometry) {
        intersections = intersections.concat(ray.intersect(g));
    }

    intersections.sort(closest(x1, y1));

    return intersections[0];
}

function reflect(m1, mn) {
    // m1 is the slope of the incident ray 
    // mn is the slope of the normal ray

    if (isFinite(m1)) {
        // non-vertical incident ray
        if (isFinite(mn)) {
            // non-vertical normal ray
            return (2 * mn - m1 + m1 * mn ** 2) / (2 * m1 * mn - mn ** 2 + 1);
        } else {
            // vertical normal ray
            return -m1;
        }
    }else{
        // vertical incident ray
        if(isFinite(mn)){
            // non vertical normal ray
            return (-1 + mn**2) / (2 * mn);
        }else{
            // vertical normal ray
            return Infinity;
        }
    }

}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
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
                    y1 = (D * dx + Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy,
                    x2 = (D * dy - sign(dy) * dx * Math.sqrt(delta)) / (dr ** 2) + other.cx,
                    y2 = (D * dx - Math.abs(dy) * Math.sqrt(delta)) / (dr ** 2) + other.cy;

                // Calculate normals
                let n1 = (y1 - other.cy) / (x1 - other.cx),
                    n2 = (y2 - other.cy) / (x1 - other.cx);

                return [{
                    x: x1,
                    y: y2,
                    n: n1
                }, {
                    x: x2,
                    y: y2,
                    n: n2
                }]
            }

        } else if (other instanceof Line) {

        }
    }
}

class Circle {
    constructor(cx, cy, r) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
    }

    intersect(other) {
        if (other instanceof Line) {
            return other.intersect(this);
        }
    }
}