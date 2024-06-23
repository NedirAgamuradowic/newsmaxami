// global plugin
const {src, dest, watch, series, parallel }  = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');


// html plugins
const webpHTML = require('gulp-webp-html');
const htmlmin = require('gulp-htmlmin');

// css plugins
const concat = require('gulp-concat');
const cssimport = require('gulp-cssimport');
const autoprefixer = require('gulp-autoprefixer');
const shorthand = require('gulp-shorthand');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const csso = require('gulp-csso');

// image plugins
const newer = require('gulp-newer');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');

// path
const pathSrc = './src';
const pathDest = './public';

const path = {
	root:pathDest,

	html:{
		src:pathSrc + '/*.html',
		watch:pathSrc + '/html/**/*.html',
		dest:pathDest
	},
	css:{
		src:pathSrc + '/css/*.css',
		watch:pathSrc + '/css/**/*.css',
		dest:pathDest +'/css'
	},
	img:{
		src:pathSrc + '/img/*.*',
		watch:pathSrc + '/img/**/*.*',
		dest:pathDest +'/img'
	}
};

// config
const isProd = process.argv.includes('--production');
const isDev = !isProd;


const config = {

	isProd:isProd,

	isDev:isDev,

	sourcemaps:{sourcemaps:isDev},

	html:{collapseWhitespace:isProd},

	concat:"style.css",

	rename:{suffix:".min"},

	imagemin:{
		verbose:true
	},

	browserSync:{
		server:{
			baseDir:path.root
		}
	}
};


// clear task
const clear = () =>{
	return del(path.root);
}

// html task
function html() {
	return src(path.html.src)
	.pipe(plumber())
	.pipe(webpHTML())
	.pipe(htmlmin(config.html))
	.pipe(dest(path.html.dest))
	.pipe(browserSync.stream())
}

// css task
function css() {
	return src(path.css.src, config.sourcemaps)
	.pipe(plumber())
	.pipe(concat(config.concat))
	.pipe(cssimport())
	.pipe(autoprefixer()
	.pipe(shorthand()))
	.pipe(groupCssMediaQueries())
	.pipe(dest(path.css.dest, config.sourcemaps))
	.pipe(rename(config.rename))
	.pipe(csso())
	.pipe(dest(path.css.dest))
	.pipe(browserSync.stream())
}

// image
function image() {
	return src(path.img.src)
	.pipe(plumber())
	.pipe(newer(path.img.dest))
	.pipe(webp())
	.pipe(dest(path.img.dest))
	.pipe(src(path.img.src))
	.pipe(newer(path.img.dest))
	.pipe(imagemin(config.imagemin))
	.pipe(dest(path.img.dest))
	.pipe(browserSync.stream())
}

// watch task
function watcher() {
	watch(path.html.watch, html)
	watch(path.css.watch, css)
	watch(path.img.watch, image);
}

// browsersync server
function server() {
	browserSync.init(config.browserSync);
}

// build project
const build = series(clear, parallel(html, css, image));

// development
const development = series(build,  parallel(watcher, server));


// export tasks
exports.clear = clear;
exports.html = html;
exports.css = css;
exports.image = image;
exports.watch = watcher;


//  default
exports.default = config.isProd ? build : development;