var gulp = require('gulp');
var template_cache = require('gulp-angular-templatecache');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var karma = require('gulp-karma');
var debug = require('gulp-debug');


gulp.task('build-root', function() {
    return gulp.src(['app/*.html'])
        .pipe(gulp.dest('./dist/'));
});


gulp.task('build-app', function() {
    return gulp.src(['app/**/*.js', '!app/**/*.spec.js'])
        .pipe(concat('js/app.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-css', function(){
    var cssFiles = [
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/jsoneditor/dist/jsoneditor.css',
        'app/css/*.css'
    ];
    return gulp.src(cssFiles)
        .pipe(concat('css/styles.css'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-fonts', function(){
    return gulp.src('node_modules/bootstrap/dist/fonts/*')
        .pipe(rename({
            dirname: 'fonts/'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-img', function(){
    return gulp.src('node_modules/jsoneditor/dist/img/jsoneditor-icons.svg')
        .pipe(rename({
            dirname: 'css/img/'
        }))
        .pipe(gulp.dest('./dist/'));
});

    

gulp.task('build-js', ['build-app', 'build-templates'], function(){
    var jsFiles = [
        'node_modules/jquery/dist/jquery.min.js', //min
        'node_modules/underscore/underscore-min.js', // -min
        'node_modules/bootstrap/dist/js/bootstrap.min.js',  //min
        'node_modules/angular/angular.min.js',  //min
        'node_modules/angular-route/angular-route.min.js',  //min 
        'node_modules/restangular/dist/restangular.min.js',  //min
        'node_modules/angular-local-storage/dist/angular-local-storage.min.js', // min
        'node_modules/jsoneditor/dist/jsoneditor.min.js',
        'node_modules/ng-jsoneditor/ng-jsoneditor.js'
//        'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js',
//        'dist/js/templates.js',
//        'dist/js/app.js'
    ];

    return gulp.src(jsFiles)
        .pipe(concat('js/scripts.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-templates', function() {
    return gulp.src(["app/**/*.html", '!app/*.html'])
        .pipe(template_cache('**',{
            standalone: true,
            module: "templates",
        }))
        .pipe(concat("js/templates.js"))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function () {
    return gulp.src('./dist/', {read: false})
        .pipe(clean());
});

gulp.task('karma', ['build-js'], function(){
    return gulp.src('blop')
        .pipe(karma({
            configFile: 'karma.conf.js',
            browsers: ['PhantomJS']
        }))
        .on('error', function(error){
            throw error;
        })
    ;
});


gulp.task('default', ['build']);

gulp.task('build', [ 'build-root', 'build-css', 'build-fonts', 'build-img', 'build-js']);

gulp.task('watch', ['build'], function () {
    gulp.watch("app/*.html", ['build']);
    gulp.watch("app/**/*.js", ['build']);
    gulp.watch("app/**/*.html", ['build']);
});
