const Puppis = require("worker-loader?inline!./puppis.js");

const constellation = function ({
	size = [400,400],
	element = undefined,
	canvas = undefined,
	nodesTotal = 30,
	shipsTotal = 70,
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

	const puppis = new Puppis();

	if(padding[0] === 0 && padding[1] === 0) {
		padding = [fuzziness,fuzziness]
	}

	const styleDefaults = {
		starSize: 4,
		starPadding: 5,
		starColor: '#000',
		lineColor: 'rgba(0,0,0,.5)',
		lineSize: 2
	};

	style = Object.assign({}, styleDefaults, style);

	let jiggles = true;
	let lastMouse = [0,0];

	puppis.postMessage({
		body: 'sendParameters',
		payload: {
			speed: speed,
			nodesTotal: nodesTotal,
			shipsTotal: shipsTotal,
			padding: padding,
			size: size,
			style: style,
			fuzziness: fuzziness
		}
	});

	const drawCanvas = (canvas,objects) => {

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, size[0],size[1]);

		/*lines*/
		objects.lines.map((line)=>{
			if(onDraw.line) {
				onDraw.line(ctx,style,line);
			}
			else {
				ctx.beginPath();
					ctx.lineWidth = style.lineSize;
					ctx.strokeStyle = style.lineColor;
					ctx.moveTo(line.pos[0],line.pos[1]);
					ctx.lineTo(line.pos[2],line.pos[3]);
					ctx.globalCompositeOperation = 'source-over';
					ctx.stroke();
				ctx.closePath();
			}
			if(onDraw.afterLine) onDraw.afterLine(ctx,style,line);
		});

		/*stars*/
		if(style.starPadding > 0) {
			ctx.globalCompositeOperation = 'destination-out';
			objects.nodes.map((node)=>{
				ctx.beginPath();
					ctx.fillStyle = '#f0f';
					ctx.arc(
						node.pos[0], node.pos[1],
						(style.starSize + style.starPadding),
						0, 2 * Math.PI);
					ctx.fill();
				ctx.closePath();
			});
		}

		objects.nodes.map((node)=>{
			if(onDraw.star) {
				onDraw.star(ctx,style,node);
			}
			else {
				ctx.beginPath();
					ctx.arc(
						node.pos[0], node.pos[1], style.starSize,0, 2 * Math.PI
					);
					ctx.fillStyle = style.starColor;
					ctx.globalCompositeOperation = 'source-over';
					ctx.fill();
				ctx.closePath();
			}
			if(onDraw.afterStar) onDraw.afterStar(ctx,style,node);
		});
		ctx.closePath();

		if(onDraw.afterFrame) onDraw.afterFrame(ctx,style);

	}

	return new Promise((resolve,reject)=>{
		let start = () => {

			if(canvas) {
				canvas.setAttribute('width',size[0]*scale);
				canvas.setAttribute('height',size[1]*scale);
				canvas.style.width = `${size[0]}px`;
				canvas.style.height = `${size[1]}px`;
				canvas.getContext('2d').scale(scale,scale);
			} else {
				throw 'Please specify a target canvas';
			}

			canvas.addEventListener('mousemove',(ev)=>{
				var x = ev.pageX - canvas.getBoundingClientRect().left + document.documentElement.scrollLeft;
				var y = ev.pageY - canvas.getBoundingClientRect().top + document.documentElement.scrollTop;
				jiggles = false;
				lastMouse = [x,y];
			});
			canvas.addEventListener('mouseout',(ev)=>{
				jiggles = true;
			});

			puppis.addEventListener('message', (msg)=>{
				if(msg.data.body === 'updateComplete') {
					requestAnimationFrame(()=>{
						drawCanvas(canvas,{
							nodes: msg.data.payload.nodes,
							lines: msg.data.payload.lines
						});
					})
				}
			});

			const repaint = () => {
				puppis.postMessage({
					body: 'requestUpdate',
					payload: {
						lastMouse: lastMouse,
						jiggles: jiggles
					}
				});
				requestAnimationFrame(repaint)
			}
			repaint();

			resolve({
				$constellation: canvas
			});

		};
		if (/comp|inter|loaded/.test(document.readyState)){
			start();
		} else {
			window.document.addEventListener("DOMContentLoaded",start);
		}
	});

};

module.exports = constellation;
