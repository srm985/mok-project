'use strict';

const gulp = require('gulp'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    sassLint = require('gulp-sass-lint'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    eslint = require('gulp-eslint'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    gulpSequence = require('gulp-sequence'),
    rename = require('gulp-rename');

let env;

const arg = (argList => {
    let arg = {},
        a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');
        if (opt === thisOpt) {
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);


gulp.task('clean', () => {
    del.sync(['dist/**/*']);
});

gulp.task('copy', () => {
    return gulp.src('src/languages/*.klc', { base: 'src/languages/' })
        .pipe(gulp.dest('dist/languages'));
});

gulp.task('copy-demo', () => {
    return gulp.src('src/demo/*.html', { base: 'src/demo/' })
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-css', () => {
    return gulp.src('src/scss/**/*.scss')
        .pipe(gulpif(arg.sourcemap, sourcemaps.init()))
        .pipe(sassLint())
        .pipe(concat('styles.scss'))
        .pipe(sassLint.format())
        .pipe(sass())
        .pipe(autoprefixer('last 20 versions'))
        .pipe(cssnano())
        .pipe(gulpif(arg.sourcemap, sourcemaps.write()))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(gulpif(arg.sourcemap, sourcemaps.init()))
        .pipe(concat('main.js'))
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(uglify())
        .pipe(gulpif(arg.sourcemap, sourcemaps.write()))
        .pipe(gulp.dest('dist/'));
});

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'index.html'
        },
        reloadDelay: 50,
        reloadDebounce: 250
    });
    gulp.watch('src/scss/**/*.scss', ['build-css']);
    gulp.watch('src/js/**/*.js', ['build-js']).on('change', (e) => {
        browserSync.reload();
    });
});

gulp.task('develop', gulpSequence('clean', ['copy', 'copy-demo', 'build-css', 'build-js'], 'serve'));
gulp.task('build', gulpSequence('clean', ['copy', 'build-css', 'build-js']));
