# constellation-canvas
Draws cute animated canvas constellations.

[See it in action here!](https://lawwrr.github.io/constellation/)

<p align="center">
  <img src="http://i.imgur.com/gLCMGoi.png">
</p>


## Usage (webpack+babel)
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


## Usage (browser)
Grab the [latest release](https://github.com/lawwrr/constellation/releases) and drop it in as a script tag. `window.constellation` will appear


## Parameters
All of them are optional but you might want to change some

| Name | Type | Description |
| --- | --- | --- |
| **size** | `(array[x,y])` | Pixel size for the canvas |
| **padding** | `(array[x,y])` | Space between the canvas edges and the stars, it can be negative to make a full background  |
| **canvas** | `(DOM element)` | The canvas element to draw in. Will be created if it doesn't exist |
| **starCount** | `number` | Total number of stars to draw |
| **lineCount** | `number`  | Total number of lines drawn between stars |
| **speed** (object) | `object` | Speed options |
| **speed.active** |  | Speed when the mouse is moving the stars |
| **speed.passive** |  | Speed when the stars are jiggling by themselves |
| **style** | `(object)` | Style options |
| **style.starSize** | `number` | Size of the stars |
| **style.starColor** | `string` | Color of the stars  |
| **style.starPadding** | `number` | Space between stars and lines |
| **style.lineColor** | `string` | Color of the lines |
| **style.lineSize** | `number` | Size (line weight) of the lines |


## Drawing things yourself
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

You can see how these plug together at `src/class/Canvas.js` but here's a quick chart

| Callback | Description |
| --- | --- |
| **star**(ctx,style,star) | overrides star drawing. `star` contains the coordinates for the star to be drawn |
| **afterStar**(ctx,style,star) | takes place after the default star drawing. `star` contains the coordinates for the star that was drawn |
| **line**(ctx,style,line) | overrides line drawing. `line` contains the coordinates for the line to be drawn |
| **afterLine**(ctx,style,line) | takes place after the default line drawing. `line` contains the coordinates for the line that was drawn |
| **afterFrame**(ctx,style,objects) | takes place after drawing a full frame. `objects` contains all coordinates for stars & lines |


### Advanced

Available callbacks are `star`,`afterStar`,`line`,`afterLine`,`afterFrame`.

`star` & `line` will completely override the default drawing stage while `afterStar`,`afterLine` & `afterFrame` take place after their drawing is complete

There are some extra advanced properties too! `fuzziness` for controlling how reactive to the mouse stars are and `scale`, for drawing the canvas at a different resolution (it's @2x by default). Check out the code (i mean it's like 2? files total) to see how they work.

ALSO!! should you ever need it, `Constellation` will return a promise containing `$constellation`, the canvas DOM object after everything there has been done.

    let constellation = Constellation({
        /*blah*/
    });

    constellationInstance.then(function(data){
        console.log(data.$constellation);
    })
