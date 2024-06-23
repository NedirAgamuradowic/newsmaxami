// global plugin
const {src, dest, watch, series, parallel }  = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();


// gulp plugins
const plumber = require('gulp-plumber');
const htmlmin = require('gulp-htmlmin');
const webpHTML = require('gulp-webp-html');
const sass = require('gulp-sass')(require('sass'));
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const shorthand = require('gulp-shorthand');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const webpCss = require('gulp-webp-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const webp = require('gulp-webp');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');


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
	scss:{
		src:pathSrc + '/scss/*.scss',
		watch:pathSrc + '/scss/**/*.scss',
		dest:pathDest +'/css'
	},
	js:{
		src:pathSrc + '/js/*.js',
		watch:pathSrc + '/js/**/*.js',
		dest:pathDest +'/js'
	},
	img:{
		src:pathSrc + '/img/*.*',
		watch:pathSrc + '/img/**/*.*',
		dest:pathDest +'/img'
	},
	font:{
		src:pathSrc + '/font/*.*',
		watch:pathSrc + '/font/**/*.*',
		dest:pathDest +'/font'
	}
};

// config
const isProd = process.argv.includes('--production');
const isDev = !isProd;


const config = {

	isProd:isProd,

	isDev:isDev,

	html:{collapseWhitespace:isProd},

	sourcemaps:{sourcemaps:isDev},

	rename:{suffix:".min"},

	babel:{
		presets: ['@babel/preset-env']
	},

	imagemin:{
		verbose:true
	},

	fonter:{
		formats:['ttf', 'eot', 'woff']
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

// scss
function scss() {
	return src(path.scss.src, config.sourcemaps)
	.pipe(plumber())
	.pipe(sass())
	.pipe(webpCss())
	.pipe(autoprefixer())
	.pipe(shorthand())
	.pipe(groupCssMediaQueries())
	.pipe(dest(path.scss.dest, config.sourcemaps))
	.pipe(rename(config.rename))
	.pipe(csso())
	.pipe(dest(path.scss.dest))
	.pipe(browserSync.stream())
};

// javascript
function js() {
	return src(path.js.src, config.sourcemaps)
	.pipe(plumber())
	.pipe(babel(config.babel))
	.pipe(uglify())
	.pipe(dest(path.js.dest))
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


// font
function font() {
	return src(path.font.src)
	.pipe(plumber())
	.pipe(newer(path.font.dest))
	.pipe(fonter(config.fonter))
	.pipe(dest(path.font.dest))
	.pipe(ttf2woff2())
	.pipe(dest(path.font.dest));
}

// watch task
function watcher() {
	watch(path.html.watch, html)
	watch(path.scss.watch, scss)
	watch(path.js.watch, js)
	watch(path.img.watch, image)
	watch(path.font.watch, font);
}

// browsersync server
function server() {
	browserSync.init(config.browserSync);
}

// build project
const build = series(clear, parallel(html, scss, js, image, font));

// development
const development = series(build,  parallel(watcher, server));


// export tasks
exports.clear = clear;
exports.html = html;
exports.scss = scss;
exports.js = js;
exports.image = image;
exports.font = font;
exports.watch = watcher;


// 
exports.default = config.isProd ? build : development;