describe('Initialization', function() {
	it('window.constellation should exist',function(done){
		if(window.constellation) done();
		else done(new Error())
	})
});

describe('Rendering', function() {
	this.timeout(1000);

	it('should render a constellation', function(done) {
		var constellationInstance = window.constellation({
			size:[window.innerWidth,window.innerHeight],
			canvas: document.querySelector('canvas'),
			padding: [100,100],
			starCount: 100,
			lineCount: 400,
			style: {
				starColor: '#fff',
				lineColor: 'rgba(255,255,255,.5)',
				lineSize: .5,
				starPadding: 5,
				starSize: 2
			}
		});
		constellationInstance.then(function(){
			done();
		})
	});
	it('should make a canvas, then render a constellation', function(done) {
		var constellationInstance = window.constellation({
			size:[window.innerWidth,100],
			padding: [100,100],
			starCount: 10,
			lineCount: 10,
			style: {
				starColor: '#f0f',
			}
		});
		constellationInstance.then(function(){
			done();
		})
	});

	after(function(){
		if (window.callPhantom) {
			var date = new Date()
			var filename = "temp/screenshots/" + date.getTime()
			callPhantom({'screenshot': filename})
		}
	})
});
