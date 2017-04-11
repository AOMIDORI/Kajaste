var webSocket = require('ws'),
    ws = new webSocket('ws://localhost:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame, colors, color_index, bright_index, ledon;

board.on('ready', function() {
    // Define the pins we are using
    led = new five.Led.RGB([ 9, 10, 11 ]);
    ledon = false;

    // Index for adjusting led's brightness
    bright_index = 99;

    // Index for adjusting led's colors
    color_index = 0;

    // Define some colors for now
    colors = ["FF0000", "FF7F00", "FFFF00", "00FF00", "0000FF", "4B0082", "8F00FF"];

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        if (frame.gestures.length > 0) {

            frame.gestures.forEach(function(gesture) {
                console.log(gesture);
                switch (gesture.type) {
                    case "circle":

                        // console.log(gesture);
                        // var clockwise = false;
                        // var pointableID = gesture.pointableIds[0];
                        // var direction = frame.pointable(pointableID).direction;
                        // var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                        // if (dotProduct  >  0) clockwise = true;
                        if (gesture.radius > 50) {
                            // console.log(gesture);
                            if (gesture.normal[0] < 0) {
                                bright_index += 0.5;
                            }
                            else {
                                bright_index -= 0.5;
                            }
                            led.intensity(bright_index);
                        }
                        break;
                    case "screenTap":
                        // console.log("Tapping");
                        if (ledon === true) {
                            led.off();
                            ledon = false;
                        }
                        else {
                            led.on();
                            ledon = true;
                        }

                        break;
                    case "swipe":
                        // console.log("Swiping");
                        // console.log(gesture);
                        if (gesture.state === "stop") {
                            if (color_index === colors.length) {
                                color_index = 0;
                            }
                            led.color(colors[color_index]);
                            color_index++;
                        }
                        break;
                }
            });
        }
    });
});