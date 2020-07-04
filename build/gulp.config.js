const gulp = require('gulp')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const autoprefixer = require('autoprefixer')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')

const taskCopyStatic = () => {
  return gulp.src('../src/static/**/*.*')
    .pipe(gulp.dest('../dist/static'))
}

const taskLess = () => {
  return gulp.src(['../src/**/*.less', '!../src/styles/var.less'])
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
    .pipe(gulp.dest('../dist'))
}

const taskJS = () => {
  return gulp.src('../src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(sourcemaps.write())
    // 如果需要将sourcemap分离到单独的文件中，则需要指定sourcemap文件路径
    // .pipe(sourcemaps.write('sourcemap path'))
    .pipe(gulp.dest('../dist'))
}

const taskWatch = () => {
  gulp.watch('../src/**/*.js', gulp.series(taskJS))
  gulp.watch('../src/**/*.less', gulp.series(taskLess))
  gulp.watch('../src/static/**/*.*', gulp.series(taskCopyStatic))
}

exports.default = gulp.parallel(taskCopyStatic, taskLess, taskJS, taskWatch)
