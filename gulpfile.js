const gulp = require('gulp');
const minifyCss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const maps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const gulpClean = require('gulp-clean');
const connect = require('gulp-connect');

sass.compiler = require('node-sass');
 
const src = '.';
const dest = 'dist';

function compileSass() {
    return gulp.src(src + '/sass/*.scss')
      .pipe(maps.init())  
      .pipe(sass().on('error', sass.logError))
      .pipe(maps.write('./'))
      .pipe(gulp.dest(src + '/css'));
}

function minCss () {
    return gulp.src(src + '/css/global.css')
        .pipe(minifyCss())
        .pipe(rename('all.min.css'))
        .pipe(gulp.dest(dest + '/styles'))
}

function concatScripts() {
    return gulp.src(src + '/js/circle/*.js')
        .pipe(maps.init())
        .pipe(concat('global.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(src + '/js'));
};

function minifyScripts() {
    return gulp.src(src + '/js/global.js', { allowEmpty: true })
        .pipe(uglify())
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest(dest + '/scripts'));
};

function images() {
    return gulp.src(src + '/images/**')
        .pipe(imagemin())
        .pipe(gulp.dest(dest + '/content'));
}

function htmlReplace() {
    return gulp.src(src + '/index.html')
        .pipe(replace("images/", "content/"))
        .pipe(replace("js/global.js", "scripts/all.min.js"))
        .pipe(replace("css/global.css", "styles/all.min.css"))
        .pipe(gulp.dest(dest));
}

function clean() {
    return gulp.src([dest], { read: false, allowEmpty: true })
        .pipe(gulpClean());
}

function watch() {
    gulp.watch([ 
        src + '/sass/*.scss', 
        src + '/sass/**/*.sass', 
        src + '/sass/circle/components/*.sass', 
        src + '/sass/circle/components/*.sass'
    ], gulp.series(compileSass, minCss, reload));
};

function reload() {
    return gulp.src(dest + '/index.html')
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
}

function runServer() {
    connect.server({
        root: dest,
        port: 3000,
        livereload: true
    });
}

gulp.task('build', gulp.series(clean, gulp.parallel(compileSass, concatScripts), gulp.parallel(minCss, minifyScripts, images, htmlReplace), gulp.parallel(runServer, watch)));

gulp.task('default', gulp.series('build')); // wanted to use this convention for default and build so that 
                                       // when default is run, it will say that build is running 

exports.scripts = gulp.series(concatScripts, minifyScripts);
exports.styles = gulp.series(compileSass, minCss);
exports.images = gulp.series(images);
exports.html = htmlReplace;
exports.clean = clean;
exports.watch = watch;