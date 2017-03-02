const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const path = require('path');
const fs = require('fs-extra');

const config = require('./src/conf.js');


const webpackConfig = {
	module: {
		loaders: [
			{
				test: /.js?$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015'],
					plugins: ['transform-object-assign']
				}
			}
		]
	},
	resolve: {
		modulesDirectories: ['node_modules', 'bower_components'],
		extensions: ['', '.js', '.jsx']
	},
	plugins: [
		new webpack.webpack.ProvidePlugin({
			Promise: 'es6-promise-promise'
		})
	]
};


gulp.task('clean', () => {
	['dist','temp','temp/screenshots'].map((dir)=>{
		fs.removeSync(dir);
		fs.mkdirSync(dir);
	});
});


gulp.task('test', ['make'], function () {

	const through = require('through2');
	const mochaPhantomJS = require('gulp-mocha-phantomjs');

	return gulp
	.src('test/index.html')
	.pipe(mochaPhantomJS({
		reporter: 'nyan',
		suppressStderr: false,
		phantomjs: {
			viewportSize: {
				width: 1440,
				height: 900
			},
			settings: {
				webSecurityEnabled: false,
				localToRemoteUrlAccessEnabled: true
			}
		}
	}))
	.pipe(through.obj((chunk, enc, cb) => {

		const screenshotPath = 'temp/screenshots/';
		const screenshots = fs.readdirSync(screenshotPath);

		let uploadCount = 0;
		const isDoneMaybe = () => {
			uploadCount++;
			if(uploadCount >= screenshots.length) {
				cb(null, chunk);
			}
		};

		screenshots.map((screenshot)=>{

			let spawn = require('child_process').spawn;
			let child = spawn('curl',[
				'--upload-file',
				`./${screenshotPath+screenshot}`,
				'https://transfer.sh/'
			]);

			child.stdout.on('data', (buffer) => {
				gutil.log('Look at it!!!', gutil.colors.magenta(buffer.toString().replace('\n','')));
			});
			child.stdout.on('end', isDoneMaybe);

		});

	}));
});


gulp.task('default', function() {
	return gulp.src('src/app.js')
		.pipe(webpack({
			watch: true,
			devtool: 'source-map',
			output: {
				filename: config.webpack.filename.dev,
				library: config.webpack.library,
				libraryTarget: 'umd'
			},
			plugins: webpackConfig.plugins,
			module: webpackConfig.module,
			resolve: {
				root: path.resolve('./src')
			}
		}))
		.pipe(header(config.webpack.header+'\n'))
		.pipe(gulp.dest('dist/'));
});


gulp.task('make', ['clean'], function() {
	return gulp.src('src/app.js')
		.pipe(webpack({
			output: {
				filename: config.webpack.filename.dist,
				library: config.webpack.library,
				libraryTarget: 'umd'
			},
			plugins: webpackConfig.plugins,
			module: webpackConfig.module,
			resolve: {
				root: path.resolve('./src')
			}
		}))
		.pipe(uglify())
		.pipe(header(config.webpack.header+'\n'))
		.pipe(gulp.dest('dist/'));
});


gulp.task('release', function(){

	const release = require('gulp-github-release');

	return gulp.src('dist/'+config.webpack.filename.dist)
		.pipe(release({
			manifest: require('./package.json')
		}).on('error',function(e){
			console.error(e);
			this.emit('end');
		}));

});
