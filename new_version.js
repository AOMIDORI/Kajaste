var five = require('johnny-five');
var Leap = require('leapjs');
var LeapFrame = require('./leapFrame');

var controller = new Leap.Controller({ enableGestures: true });
var board = new five.Board();

var frame;
var i = 0;
var j = 0;

var ledoff = true;

// Define some variables for controlling colors
var prev_color = "#000000";
var fixedColor = false;
var rainbow = ["#FF1744", "#FF4081", "#E040FB", "#651FFF", "#2196F3", "#40C4FF", "#00B8D4", "#00BFA5", "#00E676", "#EEFF41", "#FFEB3B", "#FFC400", "#FF9100", "#FF3D00", "#FF3D00"];
var goRainbow = false;
var index = 0;
var color = '';
var bright_index = 99;

var hand_x, hand_y, hand_z;
var grab = false;


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

function changeColorsInRainbow(led) {
    if (index >= rainbow.length) {
      index = 0;
    }
    led.color(rainbow[index]);
    j++;
    if(j>=40) {
        index++;
        j=0;
    }
}

// Controlling brightness
function changeBrightness(y) {
    return (y/600)*100;
}

board.on('ready', function() {
    var led = new five.Led.RGB([ 9, 10, 11 ]);
    var relay = new five.Relay(2);

    controller.on('frame', function(data) {
        i++;
        // track only 40frame/s
        if (i % 3 === 0) {
            frame = new LeapFrame(data);
            i = 0;
        }
        if (goRainbow === true) {
            changeColorsInRainbow(led);
        }
    });


    controller.on('hand', function(hand) {
        // console.log(hand.grabStrength);
        hand_x = hand.palmPosition[0];
        hand_y = hand.palmPosition[1];
        hand_z = hand.palmPosition[2];

        var timeHandVisible = hand.timeVisible;

        if (ledoff && timeHandVisible > 1.3 && hand_y >= 50) {
            led.on();
            ledoff = false;
        }

        if (!ledoff) {
            if (hand.type === 'right') {
                goRainbow = false;
                if (hand.indexFinger.extended && !hand.thumb.extended && !hand.middleFinger.extended && !hand.ringFinger.extended && !hand.pinky.extended) {
                    bright_index = changeBrightness(hand_y);
                    led.intensity(bright_index);
                } else if (hand.indexFinger.extended && hand.thumb.extended && hand.middleFinger.extended && hand.ringFinger.extended && hand.pinky.extended) {
                    if (!fixedColor) {
                        color = getrgb(hand_x, hand_y, hand_z);
                        prev_color = color;
                        led.color(color);
                    }
                    if (hand.grabStrength > 0.8) {
                        fixedColor = true;
                    } else {
                        fixedColor = false;
                    }
                }
                // else if (hand.indexFinger.extended && !hand.thumb.extended && hand.middleFinger.extended && !hand.ringFinger.extended && !hand.pinky.extended) {
                //     console.log(index);
                //     if (index >= rainbow.length) {
                //       index = 0;
                //     }
                //     led.color(rainbow[index]);
                //     //index++;
                //     j++;
                //     if(j>=10) {
                //         index++;
                //         j=0;
                //     }
                // }
                // else if (hand.indexFinger.extended && hand.thumb.extended && hand.middleFinger.extended && !hand.ringFinger.extended && !hand.pinky.extended) {
                //     led.blink(500);
                // }
                if (hand_y < 50) {
                    led.off();
                    ledoff = true;
                }
            } else if (hand.type == 'left') {
                goRainbow = true;
            }
        }
    });

    controller.connect();
});
