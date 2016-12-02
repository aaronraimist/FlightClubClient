var gulp = require('gulp');

// minify changed images
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
// minify html
var minifyHTML = require('gulp-minify-html');
var htmlmin = require('gulp-htmlmin');
// minify js
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var minify = require('gulp-minify');
// minify css
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

gulp.task('imagemin', function () {

    gulp.src('./src/images/**/*')
            .pipe(changed('./images'))
            .pipe(imagemin())
            .pipe(gulp.dest('./images'));
    
});
        
gulp.task('htmlpage', function () {

    gulp.src('./src/index.html')
            .pipe(changed('.'))
            .pipe(htmlmin({removeComments: true,collapseBooleanAttributes: true,removeAttributeQuotes: true,removeRedundantAttributes: true,removeEmptyAttributes: true}))
            .pipe(gulp.dest('.'));
    
    gulp.src('./src/pages/*.html')
            .pipe(changed('./pages/'))
            .pipe(htmlmin({removeComments: true,collapseWhitespace: true,collapseBooleanAttributes: true,removeAttributeQuotes: true,removeRedundantAttributes: true,removeEmptyAttributes: true}))
            .pipe(gulp.dest('./pages/'));
    
});
        
gulp.task('scripts', function () {

    gulp.src(['./src/js/app.js', './src/js/config.js', './src/js/index.js', './src/js/*.js'])
            .pipe(concat('flightclub.js'))
            .pipe(stripDebug())
            .pipe(minify({ext:{src:'.js', min:'.min.js'},mangle: false}))
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

    gulp.watch('./images/**/*', ["imagemin"]);
    gulp.watch('./**/*.html', ["htmlpage"]);
    gulp.watch('./js/*.js', ["scripts"]);
    gulp.watch('./css/*.css', ["styles"]);

});
