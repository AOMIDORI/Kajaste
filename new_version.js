var five = require('johnny-five');
var Leap = require('leapjs');
var LeapFrame = require('./leapFrame');

var controller = new Leap.Controller({ enableGestures: true });
var board = new five.Board();

var frame;
var i = 0;


var ledoff = true;
var prev_color = "#000000";
var color = '';
var brightness = 99;
var hand_x, hand_z;


//Function to convert hex format to a rgb color
function rgb2hex(r,g,b) {
  return "#" +
  ("0" + parseInt(r,10).toString(16)).slice(-2) +
  ("0" + parseInt(g,10).toString(16)).slice(-2) +
  ("0" + parseInt(b,10).toString(16)).slice(-2);
}



//This function converts the x, y and z position of the hand to a color value
function getrgb(x, y, z) {
    var r = ((x+150)/300)*255;
    var b = ((z+150)/300)*255;
    var g = ((y-20)/580)*255;

    if ([r, g, b].every(x => (x<=255 && x>=0))) {
        return rgb2hex(r,g,b);
    } else {
        return prev_color;
    }

}

board.on('ready', function() {
    var led = new five.Led.RGB([ 9, 10, 11 ]);
    var relay = new five.Relay(2);

    controller.on('frame', function(data) {
        i++;
        // track only 40frame/s
        if (i % 3 === 0) {
            frame = new LeapFrame(data);
            if (frame.valid) {
                // console.log(frame.data.hands);
                // basis.move(frame.palmPosition.x);
            }
            i = 0;
        }
    });


    controller.on('hand', function(hand) {
        // console.log(hand.grabStrength);
        if (hand.grabStrength > 0.7) {
            led.off();
            // ledoff = true;
        } else {
            led.on();
            // ledoff = false;
            // console.log(hand.palmPosition);
            // console.log(hand.palmPosition);
            hand_x = hand.palmPosition[0];
            hand_y = hand.palmPosition[1];
            hand_z = hand.palmPosition[2];
            color = getrgb(hand_x, hand_y, hand_z);
            prev_color = color;
            console.log(color);

            led.color(color);
        }

    });
    controller.connect();
});
