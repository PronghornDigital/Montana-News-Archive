'use strict';

let gulp = require('gulp');
let gutil = require('gulp-util');
let path = require('path');

const INDEX = 'src/client/index.jade';
const SOURCES = 'src/**/*.ts';
const TEST_SOURCES = 'src/**/*.{mock,spec}.ts';
const MOCKS = 'src/**/*mock.ts';
const TYPEDEPS = 'src/typings/**/*.d.ts';
const COMPILED_TEST_SOURCES = [
  'dist/**/*.spec.js',
  '!dist/client/**/*.spec.js'
];
const STATIC_FILES = 'src/static/**/*.css';
const CLIENT_ROOT = 'src/client';
const TEMPLATES = CLIENT_ROOT + '/**/*.jade';
const STYLES = CLIENT_ROOT + '/**/*.scss';
const STATIC = 'dist/_static';

const DEFAULT_TASKS = ['build', 'lint'];


/**
 * Typescript gets compiled from src/ to dist/
 */
let gts = require('gulp-typescript');
let tsProject = gts.createProject('tsconfig.json');
let ts = gts(tsProject);
gulp.task('build:tsc', function() {
  let destination = gulp.dest('dist');
  return gulp.src([SOURCES]).pipe(ts).pipe(destination);
});

/**
 * Copy static files
 */
gulp.task('build:copy:static', function() {
  let destination = gulp.dest(STATIC);
  return gulp.src([STATIC_FILES]).pipe(destination);
});

/**
 * Bundle client app.
 */
let webpack = require('webpack');
gulp.task('bundle:client', ['build:tsc', 'build:copy:static'], function(done) {
  const INDEX_ROOT = './dist/client/index.js';
  const WPOPTS = require('./webpack.config.js');
  WPOPTS.entry = INDEX_ROOT;
  WPOPTS.output.path = path.resolve(STATIC);
  webpack(WPOPTS, function(err, stats) {
    if(err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString({
      colors: true,
      chunks: false
    }));
    done();
  });
});

/**
 * Compile all templates
 */
let jade = require('gulp-jade');
let cache = require('gulp-angular-templatecache');
gulp.task('index', function() {
  let STATIC_DEST = gulp.dest(STATIC);
  return gulp.src([INDEX]).pipe(jade()).pipe(STATIC_DEST);
});
gulp.task('templates', function() {
  const TEMPL_DEST = gulp.dest(STATIC);
  const CACHE_OPTS = {
    module: 'mtna.templates',
    standalone: true,
    transformUrl: _ => '/' + _
  };
  return gulp.src([TEMPLATES]).pipe(jade()).pipe(cache(CACHE_OPTS)).pipe(TEMPL_DEST);
});

/**
 * Put together custom styles.
 */
let sass = require('gulp-sass');
let concatcss = require('gulp-concat-css');
gulp.task('styles', function() {
  let STATIC_DEST = gulp.dest(STATIC);
  return gulp.src([STYLES]).pipe(sass({outputStyle: 'compressed'})).pipe(concatcss('styles.css')).pipe(STATIC_DEST);
});

/**
 * Lint checks all of our code.
 */
let tslintconfig = require('./tslint.json');
let tslint = require('gulp-tslint');
gulp.task('lint:tslint', function() {
  return gulp.src([SOURCES, `!${TYPEDEPS}`, `!${MOCKS}`])
      .pipe(tslint({configuration: tslintconfig}))
      .pipe(tslint.report('prose'));
});

/**
 * Some default tasks.
 */
const DEFAULT = ['default'];
gulp.task('default', DEFAULT_TASKS);
gulp.task('build', ['build:tsc', 'bundle:client', 'templates', 'styles', 'index']);
gulp.task('lint', ['lint:tslint']);
gulp.task('watch', DEFAULT, function() { gulp.watch([SOURCES], DEFAULT); });

if (require.main === module) {
  gulp.runTask('default');
}
