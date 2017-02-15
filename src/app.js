import Canvas from 'class/Canvas';
import Puppis from 'worker-loader?inline!./worker/puppis.js';

import text from 'lib/text';
import config from 'conf';


const constellation = function ({
	size = config.defaults.size,
	canvas = config.defaults.canvas,
	starCount = config.defaults.starCount,
	lineCount = config.defaults.lineCount,
	fuzziness = config.defaults.fuzziness,
	padding = config.defaults.padding,
	scale = config.defaults.scale,
	style = {},
	speed = {},
	onDraw = {}
} = {}) {


	if(padding[0] === 0 && padding[1] === 0) padding = [fuzziness,fuzziness]
	style = Object.assign({}, config.defaults.style, style);
	speed = Object.assign({}, config.defaults.speed, speed);


	const puppis = new Puppis();
	text.send(
		puppis,
		'sendParameters',
		{
			speed: speed,
			starCount: starCount,
			lineCount: lineCount,
			padding: padding,
			size: size,
			style: style,
			fuzziness: fuzziness
		}
	);


	const onDOMReady = (resolve,reject) => {

		let isJiggling = true;
		let pointerPosition = [0,0];

		if(!canvas) {
			canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
		}

		canvas.setAttribute('width',size[0]*scale);
		canvas.setAttribute('height',size[1]*scale);
		canvas.style.width = `${size[0]}px`;
		canvas.style.height = `${size[1]}px`;
		canvas.getContext('2d').scale(scale,scale);

		canvas.addEventListener('mousemove',(ev)=>{
			var x = ev.pageX - canvas.getBoundingClientRect().left + document.documentElement.scrollLeft;
			var y = ev.pageY - canvas.getBoundingClientRect().top + document.documentElement.scrollTop;
			isJiggling = false;
			pointerPosition = [x,y];
		});
		canvas.addEventListener('mouseout',(ev)=>{
			isJiggling = true;
		});

		const canvasDrawer = new Canvas(canvas,{
			style: style,
			onDraw: onDraw
		});

		const repaint = () => {
			text.send(
				puppis,
				'requestUpdate',
				{
					pointerPosition: pointerPosition,
					isJiggling: isJiggling
				}
			)
		}

		puppis.addEventListener('message', (msg)=>{
			text.is(
				msg,'updateComplete',
				(payload) => {
					requestAnimationFrame(()=>{
						canvasDrawer.draw({
							stars: payload.stars,
							lines: payload.lines
						});
						repaint();
					})
				}
			)
		});

		repaint();

		resolve({
			$constellation: canvas
		});

	};


	return new Promise((resolve,reject)=>{

		if (/comp|inter|loaded/.test(document.readyState)){
			onDOMReady(resolve,reject);
		} else {
			window.document.addEventListener('DOMContentLoaded',()=>onDOMReady(resolve,reject));
		}

	});

};

module.exports = constellation;
