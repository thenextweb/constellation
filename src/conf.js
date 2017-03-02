module.exports = {
	webpack: {
		header: '/* ✨ constellation ✨ – https://github.com/walaura/constellation  */',
		library: 'constellation',
		filename: {
			dist: 'constellation.min.js',
			dev: 'constellation.js'
		}
	},
	defaults: {
		size: [400,400],
		canvas: undefined,
		starCount: 30,
		lineCount: 70,
		fuzziness: 100,
		padding: [0,0],
		scale: 2,
		onDraw: {},
		style: {
			starSize: 4,
			starPadding: 5,
			starColor: '#000',
			lineColor: 'rgba(0,0,0,.5)',
			lineSize: 2
		},
		speed: {
			active: .125,
			passive: .075
		}
	}
};
