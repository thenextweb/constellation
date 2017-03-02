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
		ctx.globalCompositeOperation = 'source-over';
		for (let i = 0, len = objects.lines.length; i < len; i++) {
			let line = objects.lines[i];
			if(onDraw.line) {
				onDraw.line(ctx,style,line);
			}
			else {
				ctx.beginPath();
				ctx.moveTo(line.pos[0],line.pos[1]);
				ctx.lineTo(line.pos[2],line.pos[3]);
				ctx.stroke();
				ctx.closePath();
			}
			if(onDraw.afterLine) onDraw.afterLine(ctx,style,line);
		}

		/*star padding*/
		if(style.starPadding > 0) {
			ctx.fillStyle = '#f0f';
			ctx.globalCompositeOperation = 'destination-out';
			for (let i = 0, len = objects.stars.length; i < len; i++) {
				let star = objects.stars[i];
				ctx.beginPath();
				ctx.arc(
						star.pos[0], star.pos[1],
						(style.starSize + style.starPadding),
						0, 2 * Math.PI);
				ctx.fill();
				ctx.closePath();
			}
		}

		/*stars*/
		ctx.fillStyle = style.starColor;
		ctx.globalCompositeOperation = 'source-over';
		for (let i = 0, len = objects.stars.length; i < len; i++) {
			let star = objects.stars[i];
			if(onDraw.star) {
				onDraw.star(ctx,style,star);
			}
			else {
				ctx.beginPath();
				ctx.arc(
						star.pos[0], star.pos[1], style.starSize,0, 2 * Math.PI
					);
				ctx.fill();
				ctx.closePath();
			}
			if(onDraw.afterStar) onDraw.afterStar(ctx,style,star);
		}
		ctx.closePath();

		if(onDraw.afterFrame) onDraw.afterFrame(ctx,style,objects);

	}

}
