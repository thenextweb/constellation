# constellation
Draws cute moving canvas constellations. [See it in action here!](https://lawwrr.github.io/constellation/)

<p align="center">
  <img src="http://i.imgur.com/gLCMGoi.png">
</p>

## Usage (es6/webpack)
Grab the code from here or npm

    npm install constellation-canvas --save

    #or#

    git checkout git@github.com:lawwrr/constellation.git
    npm install

Then just import it and feed it some parameters. It will create a random svg if it can't find any.

    const Constellation = require('constellation-canvas');
         /*↖️ hehe it's a double const*/

    let constellation = Constellation({
      size:[500,800],
      canvas: document.querySelector('canvas'),
      starCount: 30,
      lineCount: 60,
      style: {
        starSize: 4,
        starPadding: 5
        lineSize: 2
      }

    });


### Parameters

All of them except `canvas` are optional

| Name | Description |
| --- | --- |
| **size** (array[x,y]) | Size of the canvas |
| **padding** (array[x,y]) | space between the canvas edges and the stars, can be negative  |
| **canvas** (DOM element) | Canvas element to draw in |
| **starCount** | Total number of nodes |
| **lineCount** | Total number of relationships between nodes |
| **speed** (object) | Object with speed options for the stars. |
| **speed.active** | Speed when the mouse is moving the stars. |
| **speed.passive** | Speed when the stars are jiggling. |
| **style** (object) | Object with style options |
| **style.starSize** | Size of the stars |
| **style.starColor** | Color of the stars |
| **style.starPadding** | Space between stars and lines |
| **style.lineColor** | Color of the lines |
| **style.lineSize** | Size of the lines |


### Advanced

For further customization you can also pass an `onDraw` parameter with a number of callbacks. These will allow you to take over the drawing process of the canvas.

    let constellation = Constellation({
        size:[500,800],
        canvas: document.querySelector('canvas'),
        onDraw: {
          afterStar: (ctx,node,style) => {
            ctx.beginPath();
            ctx.arc(
              node.pos[0], node.pos[1], style.starSize,0, 2 * Math.PI
            );
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.shadowColor = '#999';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 15;
            ctx.closePath();
            ctx.fill();
          }
        }
    });

Available callbacks are `star`,`afterStar`,`line`,`afterLine`,`afterFrame`.

`star` & `line` will completely override the default drawing stage while `afterStar`,`afterLine` & `afterFrame` take place after their drawing is complete

There are some extra advanced properties too


## Usage (legacy)
Consider migrating your codebase

Otherwise, grab the [latest release](https://github.com/lawwrr/constellation/releases) and drop it in as a script tag. `window.constellation` will appear.
