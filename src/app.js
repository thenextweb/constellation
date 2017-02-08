const constellation = function ({
	size = [400,400],
	element = undefined,
	canvas = undefined,
	nodesTotal = 30,
	shipsTotal = 70,
	fuzzyness = 100,
	padding = [0,0],
	scale = 2,
	style = {},
	speed = {
		active: .125,
		passive: .075
	},
	onDraw = {}
} = {}) {

	if(padding[0] === 0 && padding[1] === 0) {
		padding = [fuzzyness,fuzzyness]
	}

	const styleDefaults = {
		starSize: 4,
		starPadding: 5,
		starColor: '#000',
		lineColor: 'rgba(0,0,0,.5)',
		lineSize: 2
	};

	style = Object.assign({}, styleDefaults, style);

	let chunks = [];
	let connectedNodes = [];
	let renderSize = size;
	let shipOrderedList = {
		start: {},
		end: {}
	};
	let nodeOrderedList = {};

	let nodeRenderList = [];
	let shipRenderList = [];

	let jiggles = true;
	let lastMouse = [0,0];

	const drawCanvas = (canvas,objects) => {

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, renderSize[0],renderSize[1]);

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

	const random = (arr) => {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	const makeNode = (tries=500) => {
		let makeDimension = (coord) => {
			let localrenderSize = (coord==='x')?renderSize[0]:renderSize[1];
			let localPadding = (coord==='x')?padding[0]:padding[1];
			return Math.ceil(
				Math.random()*(localrenderSize - localPadding*2) + localPadding
			);
		}
		let node = [makeDimension('x'),makeDimension('y')];
		let chunk = JSON.stringify([
			Math.ceil(node[0]/renderSize[0]*(renderSize[0]/style.starSize/10)),
			Math.ceil(node[1]/renderSize[1]*(renderSize[1]/style.starSize/10))
		]);
		if(tries > 0 && chunks.indexOf(chunk) >= 0) {
			return makeNode(tries-1);
		}
		else {
			chunks.push(chunk);
			return node;
		}
	}

	const makeShip = (faves,force=false) => {
		let start,end;

		start = random(nodes);
		end = start.closest[random([0,1,2,3,4,5,6,7,8])];

		if(!force && connectedNodes.indexOf(start) > 0) {
			return makeShip(faves);
		}
		if(!force && connectedNodes.indexOf(end) > 0) {
			return makeShip(faves);
		}

		connectedNodes.push(JSON.stringify(start.pos));
		connectedNodes.push(JSON.stringify(end.pos));

		return start.pos.concat(end.pos);
	};

	const makeCoordinateList = (...coords) => {
		return {
			pos: [...coords],
			original: [...coords]
		};
	}

	let nodes = (() => {
		let nodes = [];
		for(let i = 0;i < nodesTotal;i++) {
			nodes.push({
				pos: makeNode()
			});
		}
		nodes.map((node)=>{
			let distances = [];
			nodes.map((subnode)=>{
				let localDistance =
					Math.sqrt(
						Math.pow(node.pos[0]-subnode.pos[0],2)
						+
						Math.pow(node.pos[1]-subnode.pos[1],2)
					);
				if(localDistance < 0) localDistance = localDistance*-1;
				if(localDistance !== 0)  {
					distances.push({
						distance: localDistance,
						node: {
							pos: [
								subnode.pos[0],subnode.pos[1]
							]
						}
					});
				}
			})
			distances.sort((a,b)=>{
				return a.distance - b.distance
			});
			let closest = [];
			distances.map((distance)=>{
				closest.push(distance.node);
			})
			node.closest = closest;
		});
		return nodes;
	})()

	let ships = (() => {
		let ships = [];
		let faves = [0,1,2];
		for(let i = 0;i < shipsTotal;i++) {
			ships.push(makeShip(faves));
		}
		return ships;
	})();

	return new Promise((resolve,reject)=>{
		let start = () => {

			if(canvas) {
				canvas.setAttribute('width',renderSize[0]*scale);
				canvas.setAttribute('height',renderSize[1]*scale);
				canvas.style.width = `${renderSize[0]}px`;
				canvas.style.height = `${renderSize[1]}px`;
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

			nodes.map((originalNode)=>{

				let node = makeCoordinateList(...originalNode.pos);
				let posAsString = JSON.stringify([node.pos[0],node.pos[1]]);

				nodeRenderList.push(node);

				node._previousTransform = [0,0];
				node._jiggle = [Math.random()*20 - 10,Math.random()*20 - 10];
				setInterval(()=>{
					node._jiggle = [Math.random()*20 - 10,Math.random()*20 - 10];
				},5000);

				const calculate = (callback) =>{

					let x = lastMouse[0];
					let y = lastMouse[1];
					let localSpeed = speed.active;

					if(jiggles) {
						localSpeed = speed.passive;
						x = node.original[0] + node._jiggle[0],
						y = node.original[1] + node._jiggle[1]
					}

					if(
						(x > node.original[0] - fuzzyness*1.1 && x < node.original[0] + fuzzyness*1.1)
						&&
						(y > node.original[1] - fuzzyness*1.1 && y < node.original[1] + fuzzyness*1.1)
					)
					{
						let fromCenter = [
							node.original[0]-x,
							node.original[1]-y
						];

						let displacement = [];

						if(fromCenter[0] > 0) {
							displacement[0] = node._previousTransform[0] + localSpeed - (node._previousTransform[0]/fuzzyness)*localSpeed
						}
						else {
							displacement[0] = node._previousTransform[0] - localSpeed + (node._previousTransform[0]*-1/fuzzyness)*localSpeed
						}
						if(fromCenter[1] > 0) {
							displacement[1]= node._previousTransform[1] + localSpeed - (node._previousTransform[1]/fuzzyness)*localSpeed
						}
						else {
							displacement[1] = node._previousTransform[1] - localSpeed + (node._previousTransform[1]*-1/fuzzyness)*localSpeed
						}

						node._previousTransform = displacement;

						node.pos[0] = node.original[0] + node._previousTransform[0];
						node.pos[1] = node.original[1] + node._previousTransform[1];

						if(shipOrderedList.end[posAsString]) {
							for (var i = 0, len = shipOrderedList.end[posAsString].length; i < len; i++) {
								let line = shipOrderedList.end[posAsString][i];
								line.pos[2] = line.original[2]+node._previousTransform[0];
								line.pos[3] = line.original[3]+node._previousTransform[1];
							}
						}
						if(shipOrderedList.start[posAsString]) {
							for (var i = 0, len = shipOrderedList.start[posAsString].length; i < len; i++) {
								let line = shipOrderedList.start[posAsString][i];
								line.pos[0] = line.original[0]+node._previousTransform[0];
								line.pos[1] = line.original[1]+node._previousTransform[1];
							}
						}
					}

					requestAnimationFrame(calculate)
				};
				calculate()
				nodeOrderedList[posAsString] = node;
			})

			ships.map((ship)=>{
				let startPos = JSON.stringify([ship[0],ship[1]]);
				let endPos = JSON.stringify([ship[2],ship[3]]);
				let line = new makeCoordinateList(...ship);
				if(!shipOrderedList.start[startPos]) shipOrderedList.start[startPos] = [];
				if(!shipOrderedList.end[endPos]) shipOrderedList.end[endPos] = [];
				shipOrderedList.start[startPos].push(line);
				shipOrderedList.end[endPos].push(line);
				shipRenderList.push(line);
			});

			const repaint = () => {
				drawCanvas(canvas,{
					nodes: nodeRenderList,
					lines: shipRenderList
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

module.exports = () => {
	return constellation;
};
