var gulp = require('gulp');

// minify changed images
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
// minify html
var minifyHTML = require('gulp-minify-html');
// minify js
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
// minify css
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

gulp.task('imagemin', function () {
    var imgSrc = './src/images/**/*',
            imgDst = './images';

    gulp.src(imgSrc)
            .pipe(changed(imgDst))
            .pipe(imagemin())
            .pipe(gulp.dest(imgDst));
});

gulp.task('htmlpage', function () {
    var htmlSrc = './src/index.html',
            htmlDst = '.';

    gulp.src(htmlSrc)
            .pipe(changed(htmlDst))
            .pipe(minifyHTML())
            .pipe(gulp.dest(htmlDst));
    
    htmlSrc = './src/pages/*.html',
            htmlDst = './pages/';

    gulp.src(htmlSrc)
            .pipe(changed(htmlDst))
            .pipe(minifyHTML())
            .pipe(gulp.dest(htmlDst));
});

gulp.task('scripts', function () {
    gulp.src(['./src/js/app.js', './src/js/config.js', './src/js/index.js', './src/js/*.js'])
            .pipe(concat('flightclub.min.js'))
            .pipe(stripDebug())
            //.pipe(uglify())
            .pipe(gulp.dest('./js/'));
    gulp.src('./src/flot/*.js')
            .pipe(gulp.dest('./js/'));
});

gulp.task('styles', function () {
    gulp.src(['./src/css/*.css'])
            .pipe(concat('flightclub.min.css'))
            .pipe(autoprefix('last 2 versions'))
            .pipe(minifyCSS())
            .pipe(gulp.dest('./css/'));
});

gulp.task("default", ["imagemin", "htmlpage", "scripts", "styles"], function () {
    gulp.watch('./public_html/images/**/*', ["imagemin"]);
    gulp.watch('./public_html/**/*.html', ["htmlpage"]);
    gulp.watch('./public_html/js/*.js', ["scripts"]);
    gulp.watch('./public_html/css/*.css', ["styles"]);
});
