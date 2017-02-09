import Canvas from 'class/Canvas';
import text from 'lib/text';

const Puppis = require("worker-loader?inline!./worker/puppis.js");

const styleDefaults = {
	starSize: 4,
	starPadding: 5,
	starColor: '#000',
	lineColor: 'rgba(0,0,0,.5)',
	lineSize: 2
};

const constellation = function ({
	size = [400,400],
	element = undefined,
	canvas = undefined,
	starCount = 30,
	lineCount = 70,
	fuzziness = 100,
	padding = [0,0],
	scale = 2,
	style = {},
	speed = {
		active: .125,
		passive: .075
	},
	onDraw = {}
} = {}) {


	/*add to defaults*/
	if(!canvas) throw 'Please specify a target canvas';
	if(padding[0] === 0 && padding[1] === 0) padding = [fuzziness,fuzziness]
	style = Object.assign({}, styleDefaults, style);


	/*set up parameters*/
	let jiggles = true;
	let lastMouse = [0,0];


	/*send all the important bits to worker*/
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

	return new Promise((resolve,reject)=>{

		let start = () => {

			canvas.setAttribute('width',size[0]*scale);
			canvas.setAttribute('height',size[1]*scale);
			canvas.style.width = `${size[0]}px`;
			canvas.style.height = `${size[1]}px`;
			canvas.getContext('2d').scale(scale,scale);

			canvas.addEventListener('mousemove',(ev)=>{
				var x = ev.pageX - canvas.getBoundingClientRect().left + document.documentElement.scrollLeft;
				var y = ev.pageY - canvas.getBoundingClientRect().top + document.documentElement.scrollTop;
				jiggles = false;
				lastMouse = [x,y];
			});
			canvas.addEventListener('mouseout',(ev)=>{
				jiggles = true;
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
						lastMouse: lastMouse,
						jiggles: jiggles
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

		if (/comp|inter|loaded/.test(document.readyState)){
			start();
		} else {
			window.document.addEventListener('DOMContentLoaded',start);
		}

	});

};

module.exports = constellation;
