import random from 'lib/random';
import text from 'lib/text';

let speed, starCount, lineCount, padding, size, style, fuzziness;
let nodes, ships;
let isJiggling,pointerPosition;

let chunks = [];
let connectedNodes = [];
let shipOrderedList = {
	start: {},
	end: {}
};
let nodeOrderedList = [];

let nodeRenderList = [];
let shipRenderList = [];


const makeNode = (tries=500) => {
	let makeDimension = (coord) => {
		let localsize = (coord==='x')?size[0]:size[1];
		let localPadding = (coord==='x')?padding[0]:padding[1];
		return Math.ceil(
			Math.random()*(localsize - localPadding*2) + localPadding
		);
	}
	let node = [makeDimension('x'),makeDimension('y')];
	let chunk = JSON.stringify([
		Math.ceil(node[0]/size[0]*(size[0]/style.starSize/10)),
		Math.ceil(node[1]/size[1]*(size[1]/style.starSize/10))
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

const repositionNodes = () => {

	let x = pointerPosition[0];
	let y = pointerPosition[1];
	let localSpeed = speed.active;

	nodeRenderList.map((node)=>{

		if(isJiggling) {
			localSpeed = speed.passive;
			x = node.original[0] + node._jiggle[0],
			y = node.original[1] + node._jiggle[1]
		}

		if(
			(x > node.original[0] - fuzziness*1.1 && x < node.original[0] + fuzziness*1.1)
			&&
			(y > node.original[1] - fuzziness*1.1 && y < node.original[1] + fuzziness*1.1)
		)
		{
			let fromCenter = [
				node.original[0]-x,
				node.original[1]-y
			];

			let displacement = [];

			if(fromCenter[0] > 0) {
				displacement[0] = node._previousTransform[0] + localSpeed - (node._previousTransform[0]/fuzziness)*localSpeed
			}
			else {
				displacement[0] = node._previousTransform[0] - localSpeed + (node._previousTransform[0]*-1/fuzziness)*localSpeed
			}
			if(fromCenter[1] > 0) {
				displacement[1]= node._previousTransform[1] + localSpeed - (node._previousTransform[1]/fuzziness)*localSpeed
			}
			else {
				displacement[1] = node._previousTransform[1] - localSpeed + (node._previousTransform[1]*-1/fuzziness)*localSpeed
			}

			node._previousTransform = displacement;

			node.pos[0] = node.original[0] + node._previousTransform[0];
			node.pos[1] = node.original[1] + node._previousTransform[1];

			if(shipOrderedList.end[node._posAsString]) {
				for (var i = 0, len = shipOrderedList.end[node._posAsString].length; i < len; i++) {
					let line = shipOrderedList.end[node._posAsString][i];
					line.pos[2] = line.original[2]+node._previousTransform[0];
					line.pos[3] = line.original[3]+node._previousTransform[1];
				}
			}
			if(shipOrderedList.start[node._posAsString]) {
				for (var i = 0, len = shipOrderedList.start[node._posAsString].length; i < len; i++) {
					let line = shipOrderedList.start[node._posAsString][i];
					line.pos[0] = line.original[0]+node._previousTransform[0];
					line.pos[1] = line.original[1]+node._previousTransform[1];
				}
			}
		}
	});
};

const createThings = () => {

	nodes = (() => {
		let nodes = [];
		for(let i = 0;i < starCount;i++) {
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

	ships = (() => {
		let ships = [];
		let faves = [0,1,2];
		for(let i = 0;i < lineCount;i++) {
			ships.push(makeShip(faves));
		}
		return ships;
	})();

	nodes.map((originalNode)=>{

		let node = makeCoordinateList(...originalNode.pos);
		let posAsString = JSON.stringify([node.pos[0],node.pos[1]]);

		nodeRenderList.push(node);

		node._posAsString = posAsString;
		node._previousTransform = [0,0];
		node._jiggle = [Math.random()*20 - 10,Math.random()*20 - 10];
		setInterval(()=>{
			node._jiggle = [Math.random()*20 - 10,Math.random()*20 - 10];
		},5000);
		nodeOrderedList[node._posAsString] = node;

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

};

self.onmessage = function(ev) {
	switch(ev.data.body) {
		case 'sendParameters' :
			speed = ev.data.payload.speed;
			starCount = ev.data.payload.starCount;
			lineCount = ev.data.payload.lineCount;
			padding = ev.data.payload.padding;
			size = ev.data.payload.size;
			style = ev.data.payload.style;
			fuzziness = ev.data.payload.fuzziness;
			createThings();
			break;
		case 'requestUpdate' :
			isJiggling = ev.data.payload.isJiggling;
			pointerPosition = ev.data.payload.pointerPosition;
			repositionNodes();
			text.send(
				self,
				'updateComplete',
				{
					stars: nodeRenderList,
					lines: shipRenderList
				}
			)
			break;
	}
}
