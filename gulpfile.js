var gulp = require('gulp'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    reveal = require('./lib/reveal');

var options = {
  title: 'gulp-reveal'
};

gulp.task('slides', function () {
  gulp.src('./slides/*/*.md')
    .pipe(reveal(options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./target'))
    .pipe(connect.reload());
});

gulp.task('vendor-revealjs', function () {
  gulp.src('./node_modules/reveal.js/{css,js,lib,plugin}/**/*')
    .pipe(gulp.dest('./target/vendor/revealjs'));
});

gulp.task('vendor', ['vendor-revealjs']);

gulp.task('connect', ['build'], function () {
  connect.server({
    port: 9000,
    root: './target/',
    livereload: true
  });
});

gulp.task('watch', ['build'], function () {
  gulp.watch('./slides/*/*.md', ['slides']);
});

gulp.task('build', ['vendor', 'slides']);
gulp.task('server', ['build', 'connect', 'watch']);

gulp.task('default', ['server']);
