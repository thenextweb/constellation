const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const path = require('path');
const fs = require('fs-extra');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const WrapperPlugin = require('wrapper-webpack-plugin');
const release = require('gulp-github-release');
const through = require('through2');

var webpackModule = {
	loaders: [
		{
			test: /\.css$/, loader: "raw"
		},
		{
			test: /\.mustache$/, loader: "raw"
		},
		{
			test: /.js?$/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015'],
				plugins: ["transform-object-assign"]
			}
		}
	]
};

gulp.task('clean', () => {
	['dist','temp','temp/screenshots'].map((dir)=>{
		fs.removeSync(dir);
		fs.mkdirSync(dir);
	})
});

gulp.task('test', ['make'], function () {
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
		}

		screenshots.map((screenshot)=>{

			let spawn = require('child_process').spawn;
			let child = spawn('curl',[
				'--upload-file',
				`./${screenshotPath+screenshot}`,
				'https://transfer.sh/'
			]);

			child.stdout.on('data', (buffer) => {
				gutil.log('Look at it!!!', gutil.colors.magenta(buffer.toString().replace("\n",'')));
			});
			child.stdout.on('end', isDoneMaybe);

		});

	}))
});

gulp.task('default', function() {
	return gulp.src('src/app.js')
		.pipe(webpack({
			watch: true,
			devtool: 'source-map',
			output: {
				filename: 'constellation.js',
				library: 'constellation',
				libraryTarget: 'umd'
			},
			plugins: [
				new webpack.webpack.ProvidePlugin({
					Promise: 'es6-promise-promise'
				}),
				new WrapperPlugin({
					header: '/* ✨ constellation ✨ – dev – https://github.com/lawwrr/constellation  */'
				})
			],
			module: webpackModule,
			resolve: {
				root: path.resolve('./src')
			}
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('make', ['clean'], function() {
	return gulp.src('src/app.js')
		.pipe(webpack({
			output: {
				filename: 'constellation.min.js',
				library: 'constellation',
				libraryTarget: 'umd'
			},
			plugins: [
				new webpack.webpack.ProvidePlugin({
					Promise: 'es6-promise-promise'
				}),
				new WrapperPlugin({
				  header: '/* ✨ constellation ✨ – https://github.com/lawwrr/constellation */'
				})
			],
			module: webpackModule,
			resolve: {
				root: path.resolve('./src')
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'))
})

gulp.task('release', function(){
	return gulp.src('dist/constellation.min.js')
		.pipe(release({
			manifest: require('./package.json')
		}).on('error',function(e){
			this.emit('end');
		}))

});
