var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame, colors, color_index, bright_index, ledon;


board.on('ready', function() {
    // Define the pins we are using
    led = new five.Led.RGB([ 9, 10, 11 ]);
    ledon = false;

    // Index for adjusting led's brightness
    bright_index = 0;

    // Index for adjusting led's colors
    color_index = 0;

    // Define some colors for now
    colors = ["FF0000", "FF7F00", "FFFF00", "00FF00", "0000FF", "4B0082", "8F00FF"];

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        if (frame.gestures.length > 0) {
            frame.gestures.forEach(function(gesture) {
                switch (gesture.type) {
                    case "circle":
                        console.log("circle");
                        // var circleprogress = gesture.progress;
                        // var complete = Math.floor(circleprogress);
                        // var radius = gesture.radius;
                        // console.log(circleprogress, complete, radius);
                        if (bright_index === 100) {
                            bright_index = 0;
                        }
                        bright_index += 0.3;
                        led.intensity(bright_index);
                        break;
                    case "screenTap":
                        console.log("Tapping");
                        if (ledon === true) {
                            led.off();
                        }
                        else {
                            led.on();
                        }

                        break;
                    case "swipe":
                        console.log("Swiping");
                        if (color_index === colors.length) {
                            color_index = 0;
                        }
                        led.color(colors[color_index]);
                        color_index++;
                        break;
                }
            });
        }
    });
});