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

function merge(o, defaults) {
    for (let k of Object.keys(defaults)) {
        if (typeof o[k] === "undefined") {
            o[k] = defaults[k]
        }
    }
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