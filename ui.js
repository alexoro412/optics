let default_slider = {
    x: 100,
    y: 100,
    length: 100,
    orientation: "horizontal",
    handle_style: "handle",
    style: "",
    callback: null,
    radius: 10,
    text_dx: 0,
    text_dy: 0,
    min: 0,
    max: 100,
    value: 0
}

function merge(o, defaults){
    for(let k of Object.keys(defaults)){
        if(typeof o[k] === "undefined"){
            o[k] = defaults[k]
        }
    }
}

class Slider {
    constructor(opts){
        merge(opts, default_slider);
        Object.assign(this, opts);
        
        this.horizontal = this.orientation === "horizontal"
        this.slider_value = map(this.value, this.min, this.max, 0, this.length)
    }

    install(group, id){
        group.append("line").attrs({
            x1: this.x,
            y1: this.y,
            x2: this.horizontal ? this.x + this.length : this.x,
            y2: this.horizontal ? this.y : this.y + this.length,
            class: this.style
        })

        let self = this;

        this.text = group.append("text").attrs({
            x: this.x + this.text_dx,
            y: this.y + this.text_dy
        }).text(this.callback(this.value))

        group.append("circle").attrs({
            cx: this.x + (this.horizontal ? this.slider_value : 0),
            cy: this.y + (this.horizontal ? 0 : this.slider_value),
            r: this.radius,
            class: this.handle_style
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", function(d){
                if(self.horizontal){
                    self.slider_value = clamp(d3.event.x, self.x, self.x + self.length) - self.x

                    d3.select(this)
                        .attr("cx", self.slider_value + self.x)

                    
                }else{
                    self.slider_value = clamp(d3.event.y, self.y, self.y + self.length) - self.y

                    d3.select(this)
                        .attr("cy", self.slider_value + self.y)
                }
                self.value = map(self.slider_value, 0, self.length, self.min, self.max)

                self.text_value = self.callback(self.value);

                self.text.text(self.text_value);
            })
            .on("end", dragended))
    }
}