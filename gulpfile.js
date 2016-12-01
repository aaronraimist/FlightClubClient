var gulp = require('gulp');

// minify changed images
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
// minify html
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
// minify js
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var minify = require('gulp-minify');
// minify css
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

gulp.task('imagemin', function () {
    
    gulp.src('./public_html/images/**/*')
            .pipe(changed('/var/www/html/images'))
            .pipe(imagemin())
            .pipe(gulp.dest('/var/www/html/images'));
    
}).task('htmlpage', function () {
    
    gulp.src('./public_html/local_index.html') // change this to index.html to use CDN's for angular etc.
            .pipe(changed('/var/www/html'))
            .pipe(rename('index.html'))
            .pipe(htmlmin({removeComments: true, collapseBooleanAttributes: true, removeAttributeQuotes: true, removeRedundantAttributes: true, removeEmptyAttributes: true}))
            .pipe(gulp.dest('/var/www/html/'));

    gulp.src('./public_html/pages/*.html')
            .pipe(changed('/var/www/html/pages/'))
            .pipe(htmlmin({removeComments: true, collapseWhitespace: true, collapseBooleanAttributes: true, removeAttributeQuotes: true, removeRedundantAttributes: true, removeEmptyAttributes: true}))
            .pipe(gulp.dest('/var/www/html/pages/'));
  
}).task('scripts', function () {

    gulp.src(['./public_html/js/app.js', './public_html/js/config.js', './public_html/js/index.js', './public_html/js/*.js'])
            .pipe(concat('flightclub.js'))
            .pipe(stripDebug())
            .pipe(minify({ext:{src:'.js', min:'.min.js'},mangle: false}))
            .pipe(gulp.dest('/var/www/html/js/'));

}).task('styles', function () {

    gulp.src(['./public_html/css/*.css'])
            .pipe(concat('flightclub.min.css'))
            .pipe(autoprefix('last 2 versions'))
            .pipe(minifyCSS())
            .pipe(gulp.dest('/var/www/html/css/'));
    
}).task('static_scripts', function () {
    /*
     * concatenate local angular/jquery/flot/cesium source files for offline dev. Should be a once off...
     */
    gulp.src(['./public_html/angular-1.5.8/angular.min.js', './public_html/angular-1.5.8/*.js'])
            .pipe(concat('angular-1.5.8.js'))
            .pipe(stripDebug())
            .pipe(minify({ext:{src:'.js', min:'.min.js'},mangle: false}))
            .pipe(gulp.dest('/var/www/html/js/'));

    gulp.src('./public_html/angular-material-1.1.1/*.js').pipe(gulp.dest('/var/www/html/js/'));
    gulp.src('./public_html/jquery-3.1.1/*.js').pipe(gulp.dest('/var/www/html/js/'));
    gulp.src('./public_html/flot/*.js').pipe(gulp.dest('/var/www/html/js/'));

}).task('static_styles', function () {
    /*
     * copy local angular/cesium css source files to server for offline dev. Should be a once off...
     */
    gulp.src('./public_html/cesium/*.css').pipe(gulp.dest('/var/www/html/css/'));
    gulp.src('./public_html/angular-material-1.1.1/*.css').pipe(gulp.dest('/var/www/html/css/'));

}).task("default", ["imagemin", "htmlpage", "scripts", "styles", "static_scripts", "static_styles"], function () {

    gulp.watch('./public_html/images/**/*', ["imagemin"]);
    gulp.watch('./public_html/**/*.html', ["htmlpage"]);
    gulp.watch('./public_html/js/*.js', ["scripts"]);
    gulp.watch('./public_html/css/*.css', ["styles"]);
    gulp.watch(['./public_html/angular-1.5.8/angular.min.js', './public_html/angular-1.5.8/*.js', './public_html/angular-material-1.1.1/*.js', './public_html/jquery-3.1.1/*.js', './public_html/flot/*.js'], ["static_scripts"]);
    gulp.watch(['./public_html/cesium/*.css', './public_html/angular-material-1.1.1/*.css'], ["static_styles"]);

});
