export default class Canvas {


	constructor($canvas,{style=undefined,onDraw={}}={}) {

		this.$canvas = $canvas;
		this.style = style;
		this.onDraw = onDraw;
		this.ctx = this.$canvas.getContext('2d');

	}


	draw(objects) {

		let ctx = this.ctx;
		let style = this.style;
		let onDraw = this.onDraw;

		ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

		/*lines*/
		ctx.lineWidth = style.lineSize;
		ctx.strokeStyle = style.lineColor;
		for (let i = 0, len = objects.lines.length; i < len; i++) {
			let line = objects.lines[i]
			if(onDraw.line) {
				onDraw.line(ctx,style,line);
			}
			else {
				ctx.beginPath();
					ctx.moveTo(line.pos[0],line.pos[1]);
					ctx.lineTo(line.pos[2],line.pos[3]);
					ctx.globalCompositeOperation = 'source-over';
					ctx.stroke();
					ctx.closePath();
			}
			if(onDraw.afterLine) onDraw.afterLine(ctx,style,line);
		}

		/*stars*/
		ctx.fillStyle = '#f0f';
		if(style.starPadding > 0) {
			ctx.globalCompositeOperation = 'destination-out';
			for (let i = 0, len = objects.nodes.length; i < len; i++) {
				let node = objects.nodes[i]
				ctx.beginPath();
					ctx.arc(
						node.pos[0], node.pos[1],
						(style.starSize + style.starPadding),
						0, 2 * Math.PI);
					ctx.fill();
				ctx.closePath();
			}
		}

		ctx.fillStyle = style.starColor;
		for (let i = 0, len = objects.nodes.length; i < len; i++) {
			let node = objects.nodes[i]
			if(onDraw.star) {
				onDraw.star(ctx,style,node);
			}
			else {
				ctx.beginPath();
					ctx.arc(
						node.pos[0], node.pos[1], style.starSize,0, 2 * Math.PI
					);
					ctx.globalCompositeOperation = 'source-over';
					ctx.fill();
				ctx.closePath();
			}
			if(onDraw.afterStar) onDraw.afterStar(ctx,style,node);
		};
		ctx.closePath();

		if(onDraw.afterFrame) onDraw.afterFrame(ctx,style);

	}

}
