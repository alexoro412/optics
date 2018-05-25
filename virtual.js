(function(){
    let w = 400, h = 350;

    let sim = new Sim("#virtual_images", h, w);

    sim.add_rect(0,h/2,w,h/2,{
        reflective: true,
        style: "solid mirror"
    });

    sim.add_rect(0 + 1, h / 2 + 1, w - 2, h / 2 - 2, {
        style: "hollow"
    })

    let real_lamp = new ConeLamp({
        angle: Math.PI/4,
        x: 60, y:100,
        ui: {
            max_y: h/2 - 40
        },
        ray_style: "virtual ray",
        callback: function(num,x,y){
            if(num == 1){
                virtual_lamp.handle1.move(x, h - y);
                virtual_lamp.move(x, h - y);
                virtual_lamp.handle2.move(x + virtual_lamp.handle_gap * Math.cos(virtual_lamp.angle), (h-y) + virtual_lamp.handle_gap * Math.sin(virtual_lamp.angle));
            }else {
                virtual_lamp.handle2.move(x,h-y);
                virtual_lamp.angle = Math.atan2((h-y) - virtual_lamp.y, x - virtual_lamp.x)
                virtual_lamp.move(virtual_lamp.x, virtual_lamp.y);  
            }
        }
    })

    let virtual_lamp = new ConeLamp({
        angle: -Math.PI/4,
        x: 60, y: h - 100,
        ray_style: "virtual blue ray",
        ui: {
            min_y: h/2 + 40
        },
        callback: function (num, x, y) {
            if (num == 1) {
                real_lamp.handle1.move(x, h - y);
                real_lamp.move(x, h - y);
                real_lamp.handle2.move(x + real_lamp.handle_gap * Math.cos(real_lamp.angle), (h - y) + real_lamp.handle_gap * Math.sin(real_lamp.angle));
            } else {
                real_lamp.handle2.move(x, h - y);
                real_lamp.angle = Math.atan2((h - y) - real_lamp.y, x - real_lamp.x)
                real_lamp.move(real_lamp.x, real_lamp.y);
            }
        }
    })

    sim.add_light(virtual_lamp);

    sim.add_light(real_lamp)
})();