describe('Initialization', function() {
	it('window.constellation should exist',function(done){
		if(window.constellation) done();
		else done(new Error())
	})
});

describe('Rendering', function() {
	this.timeout(10000);
	it('should render a constellation', function(done) {
		var constellationInstance = window.constellation({
			size:[window.innerWidth,window.innerHeight],
			canvas: document.querySelector('canvas'),
			nodeSize: 2,
			nodePadding: 1,
			padding: [100,100],
			nodesTotal: 100,
			shipsTotal: 400,
			fuzziness: 100,
			style: {
				starColor: '#fff',
				lineColor: 'rgba(255,255,255,.5)',
				lineSize: .5,
				starPadding: 0,
				starSize: 2
			}
		});
		constellationInstance.then(function(){
			done();
		})
	});
	after(function(){
		if (window.callPhantom) {
			var date = new Date()
			var filename = "test/screenshots/" + date.getTime()
			console.log("Taking screenshot " + filename)
			callPhantom({'screenshot': filename})
		}
	})
});
