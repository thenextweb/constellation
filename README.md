# constellation
draws cute moving svg constellations. 
#this is kinda broken still nothing works i'm uploading it so i don't fall asleep

<p align="center">
  <img src="http://i.imgur.com/SUXqAiF.png">
</p>

## Usage (es6/webpack)
Grab the code from here or npm

    npm install constellation-svg --save

    #or#

    git checkout git@github.com:lawwrr/constellation.git
    npm install

Then just import it and feed it some parameters. It will create a random svg if it can't find any.

    const Constellation = require('constellation-svg');
         /*↖️ hehe it's a double const */

    let constellation = Constellation({
      /*size of the canvas*/
      size:[500,800],
      /*svg element to draw the constellation in, if omitted a new one will be made*/
      element: document.querySelector('svg'),
      /*size of the stars*/
      nodeSize: 2,
      /*space between stars and their lines*/
      nodePadding: 0,
      /*total number of stars*/
      nodesTotal: 30,
      /*total number of lines*/
      shipsTotal: 60,
      /*how reactive to the mouse cursor stars are*/
      fuzzyness: 50,
    });
  
`Constellation` will return a promise, on completion it will let you access `$constellation` with the Snap element, `filter`, to create new snap filters and `repaint()` that will theme your constellation however you want

    constellation.then((constellationThings)=>{
      const filter = constellationThings.$constellation.filter(constellationThings.filter.shadow(0, 2, 5, '#000', .1));
      constellationThings.repaint({
        line: {
          stroke: '#333',
          strokeWidth: 2,
          opacity: .75
        },
        star: {
          fill: '#333',
        },
        lineGroup: {},
        starGroup: {
          filter: filter
        }
      });
    })


## Usage (legacy)
Consider migrating your codebase

Otherwise, grab the [latest release](https://github.com/thenextweb/indexdotco-js/releases) and drop it in as a scrpt tag. `window.constellation` will appear BUT you also need to grab a copy of [snapsvg](https://github.com/adobe-webplatform/Snap.svg/) and load it before
