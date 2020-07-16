const del = require('del')
const path = require('path')
const gulp = require('gulp')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const autoprefixer = require('autoprefixer')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')

const resolve = (...args) => path.resolve(__dirname, '..', ...args)

const config = {
  src: {
    js: resolve('src/**/*.js'),
    less: [
      resolve('src/**/*.less'),
      `!${resolve('src/styles/var.less')}`
    ],
    static: resolve('src/static/**/*.*')
  },
  dist: {
    default: resolve('dist'),
    static: resolve('dist/static')
  }
}

const taskCopyStatic = () => {
  return gulp.src(config.src.static)
    .pipe(gulp.dest(config.dist.static))
}

const taskLess = () => {
  return gulp.src(config.src.less)
    .pipe(less())
    .on('error', ({ message }) => {
      throw new Error(message)
    })
    .pipe(postcss([autoprefixer(['iOS >= 8', 'Android >= 4.1'])]))
    .pipe(cssnano({
      zindex: false,
      autoprefixer: false,
      discardComments: { removeAll: true },
      svg: false
    }))
    // 如果是在小程序中使用, 则需要将后缀名改为'wxss'并引入gulp-rename
    // const rename = require('gulp-rename')
    // .pipe(rename((path) => {
    //   path.extname = '.wxss'
    //   return path
    // }))
    .pipe(gulp.dest(config.dist.default))
}

const taskJS = () => {
  return gulp.src(config.src.js)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(sourcemaps.write())
    // 如果需要将sourcemap分离到单独的文件中，则需要指定sourcemap文件路径
    // .pipe(sourcemaps.write('sourcemap path'))
    .pipe(gulp.dest(config.dist.default))
}

const taskClean = async () => {
  return await del([config.dist.default], { force: true })
}

const taskWatch = () => {
  gulp.watch(config.src.js, gulp.series(taskJS))
  gulp.watch(config.src.less, gulp.series(taskLess))
  gulp.watch(config.src.static, gulp.series(taskCopyStatic))
}

exports.default = gulp.series(taskClean, gulp.parallel(taskCopyStatic, taskLess, taskJS, taskWatch))
