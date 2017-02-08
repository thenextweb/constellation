var gulp = require('gulp');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');
var path = require('path');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var WrapperPlugin = require('wrapper-webpack-plugin');
var release = require('gulp-github-release');

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

gulp.task('test', function () {
	return gulp
	.src('test/index.html')
	.pipe(mochaPhantomJS({
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
	}));
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
					header: '/* constellation – dev */',
					footer: "if(window.constellation && typeof window.constellation === 'function'){window.constellation = window.constellation()}"
				})
			],
			module: webpackModule,
			resolve: {
				root: path.resolve('./src')
			}
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('make', function() {
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
				  header: '/* constellation – https://github.com/lawwrr/constellation */',
				  footer: "if(window.constellation && typeof window.constellation === 'function'){window.constellation = window.constellation()}"
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
