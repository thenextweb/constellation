# constellation-canvas
Draws cute animated canvas constellations.

[See it in action here!](https://walaura.github.io/constellation/)

<p align="center">
  <img src="http://i.imgur.com/gLCMGoi.png">
</p>




## Usage (webpack+babel)
Grab the code from here or npm

    npm install constellation-canvas --save

    #or#

    git checkout git@github.com:walaura/constellation.git
    npm install

Then just import it and feed it some parameters. There's a full list below.

    import Constellation from 'constellation-canvas';

    const ellation = new Constellation({
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
Grab the [latest release](https://github.com/walaura/constellation/releases) and drop it in as a script tag. `window.constellation` will appear




## Parameters
All of them are optional but you might want to change some

| Name | Type | Description |
| --- | --- | --- |
| **size** | `array [x,y]` | Pixel size for the canvas |
| **padding** | `array [x,y]` | Space between the canvas edges and the stars, it can be negative to make a full background  |
| **canvas** | `DOM element` | The canvas element to draw in. Will be created if it doesn't exist |
| **starCount** | `number` | Total number of stars to draw |
| **lineCount** | `number`  | Total number of lines drawn between stars |
| <br><br>🏃‍💨 |  |  |
| **speed** | `object` | Speed options |
| **speed.active** | `number` | Speed when the mouse is moving the stars |
| **speed.passive** | `number` | Speed when the stars are jiggling by themselves |
| <br><br>👩‍🎨 |  |  |
| **style** | `object` | Style options |
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
            afterStar: (ctx,style,star) => {
                ctx.fillStyle = 'rgba(0,0,0,0)';
                ctx.beginPath();
                    ctx.arc(
                        node.pos[0], node.pos[1], style.starSize,0, 2 * Math.PI
                    );
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.shadowColor = '#999';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 15;
                    ctx.fill();
                ctx.closePath();
                ctx.fillStyle = style.starColor;
            }
        }
    });

You can see how these plug in at `src/class/Canvas.js` for yourself to better understand what's happening but here's a quick reference.

| Callback | Description |
| --- | --- |
| **star**(ctx,style,star) | overrides star drawing. `star` contains the coordinates for the star to be drawn |
| **afterStar**(ctx,style,star) | takes place after the default star drawing. `star` contains the coordinates for the star that was drawn |
| **line**(ctx,style,line) | overrides line drawing. `line` contains the coordinates for the line to be drawn |
| **afterLine**(ctx,style,line) | takes place after the default line drawing. `line` contains the coordinates for the line that was drawn |
| **afterFrame**(ctx,style,objects) | takes place after drawing a full frame. `objects` contains all coordinates for stars & lines |

For `afterStar` & `afterLine` you have to reset all fillStyles and whatnot or otherwise they'll carry over into the built-in drawing code. Good news is that for performance reasons you'll probably want to avoid `afterStar` & `afterLine` anyway and instead provide a full drawing solution or plug into `afterFrame`.


## Advanced
There are some extra advanced properties too! `fuzziness` for controlling how reactive to the mouse stars are and `scale`, for drawing the canvas at a different resolution (it's @2x by default). Check out the code (i mean it's like 5? files total) to see how they work.

ALSO!! should you ever need it, `Constellation` will return a promise containing `$constellation`, the canvas DOM object after everything there has been done.

    const constellation = Constellation({
        /*blah*/
    });

    constellation.then(function(data){
        console.log(data.$constellation);
    })
