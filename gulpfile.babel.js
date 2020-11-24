//JavaScript
const gulp = require('gulp');
const babel = require('gulp-babel');
//Gulp terser sirve para ofuscar el código
const terser = require('gulp-terser');
//Pug
const pug = require('gulp-pug');
//Sass
const sass = require('gulp-sass');
//common
const concat = require('gulp-concat');
//Html
const htmlmin = require('gulp-htmlmin');
//Css
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
//Variables / Constante
const cssPlugins = [cssnano(), autoprefixer()];
//Pug para producción poner a true
const production = false;
//Clean css
const clean = require('gulp-purgecss');
//Caché bust
const cacheBust = require('gulp-cache-bust');
//Optimización IMG
const imagemin = require('gulp-imagemin');
const { stream } = require('browser-sync');
//Browser sync
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
//Gulp Plumber (para que no se detenga la aplicación si hay un error)
const plumber = require('gulp-plumber');
gulp.task('html-min', () => {
    return gulp
        .src('./src/*.html')
        .pipe(plumber())
        .pipe(
            htmlmin({
                collapseWhitespace: true, //Quita los comentarios
                removeComments: true, //Quita los espacios en blanco
            })
        )
        .pipe(gulp.dest('./public'));
});

gulp.task('styles', () => {
    return gulp
        .src('./src/css/*.css')
        .pipe(plumber())
        .pipe(concat('styles-min.css'))
        .pipe(postcss(cssPlugins))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
});

gulp.task('babel', () => {
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber())
        .pipe(concat('scripts-min.js'))
        .pipe(babel())
        .pipe(terser())
        .pipe(gulp.dest('./public/js'));
});

gulp.task('pug', () => {
    return gulp
        .src('./src/views/*.pug')
        .pipe(plumber())
        .pipe(
            pug({
                pretty: production ? false : true,
            })
        )
        .pipe(
            cacheBust({
                type: 'timestamp',
            })
        )
        .pipe(gulp.dest('./public'));
});

gulp.task('sass', () => {
    return gulp
        .src('./src/scss/styles.scss')
        .pipe(plumber())
        .pipe(
            sass({
                outputStyle: 'expanded',
            })
        )
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
});

//Esta tarea de clean se ejecuta cuando se termina el porjecto
//Se le pasa la ruta del html para saber si las clases estan declaradas o no
gulp.task('clean', () => {
    return gulp
        .src('./public/css/styles.css')
        .pipe(plumber())
        .pipe(
            clean({
                content: ['./public/*.html'],
            })
        )
        .pipe(gulp.dest('./public/css'));
});

gulp.task('imgmin', () => {
    return gulp
        .src('./src/images/*')
        .pipe(plumber())
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 40, progressive: true }),
                imagemin.optipng({ optimizationLevel: 2 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ]).pipe(gulp.dest('./public/images'))
        );
});

gulp.task('default', () => {
    browserSync.init({
        server: {
            baseDir: './public',
        },
    });
    // gulp.watch('./src/.html', gulp.series('html-min'));
    // gulp.watch('./src/css/*.css', gulp.series('styles'));
    gulp.watch('./src/views/**/*.pug', gulp.series('pug')).on('change', reload);
    gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./src/js/*.js', gulp.series('babel')).on('change', reload);
});
