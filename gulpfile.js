var gulp = require('gulp');

// minify changed images
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
// minify html
var minifyHTML = require('gulp-minify-html');
// minify js
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
// minify css
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

gulp.task('imagemin', function () {
    var imgSrc = './public_html/images/**/*',
            imgDst = '/var/www/html/images';

    gulp.src(imgSrc)
            .pipe(changed(imgDst))
            .pipe(imagemin())
            .pipe(gulp.dest(imgDst));
});

gulp.task('htmlpage', function () {
    var htmlSrc = './public_html/index.html',
            htmlDst = '/var/www/html';

    gulp.src(htmlSrc)
            .pipe(changed(htmlDst))
            .pipe(minifyHTML())
            .pipe(gulp.dest(htmlDst));
    
    htmlSrc = './public_html/pages/*.html',
            htmlDst = '/var/www/html/pages/';

    gulp.src(htmlSrc)
            .pipe(changed(htmlDst))
            .pipe(minifyHTML())
            .pipe(gulp.dest(htmlDst));
});

gulp.task('scripts', function () {
    gulp.src(['./public_html/js/app.js', './public_html/js/config.js', './public_html/js/index.js', './public_html/js/*.js'])
            .pipe(concat('flightclub.min.js'))
            .pipe(stripDebug())
            //.pipe(uglify())
            .pipe(gulp.dest('/var/www/html/js/'));
    gulp.src('./public_html/flot/*.js')
            .pipe(gulp.dest('/var/www/html/js/'));
});

gulp.task('styles', function () {
    gulp.src(['./public_html/css/*.css'])
            .pipe(concat('flightclub.min.css'))
            .pipe(autoprefix('last 2 versions'))
            .pipe(minifyCSS())
            .pipe(gulp.dest('/var/www/html/css/'));
});

gulp.task("default", ["imagemin", "htmlpage", "scripts", "styles"], function () {
    gulp.watch('./public_html/images/**/*', ["imagemin"]);
    gulp.watch('./public_html/**/*.html', ["htmlpage"]);
    gulp.watch('./public_html/js/*.js', ["scripts"]);
    gulp.watch('./public_html/css/*.css', ["styles"]);
});
