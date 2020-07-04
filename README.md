# Gulp4在前端中的基本使用

## 功能

* 复制静态资源
* 打包Less(自动CSS前缀, 转换为小程序可用的wxss样式)
* 打包JavaScript(Babel转换代码，压缩及生成sourcemap)

## 基本介绍
### gulp的特点

1. 灵活

使用JavaScript配置你的gulpfile，可以使用您自己的代码或链接的单一用途插件编写任务，也可以随意组合多个任务，以提高速度和准确性。

2. 高效

通过使用gulp流，可以在将任何内容写入磁盘之前对内存中的文件进行转换，减少磁盘写入次数，从而极大地加快了构建过程。


### 安装gulp

* 如果你需要在命令行中使用gulp，则需要全局安装gulp-cli，运行 `yarn global add gulp-cli` 或`npm install -g gulp-cli`。
* 如果你只需要在scripts中使用gulp，则只需要安装gulp即可，运行`yarn add -D gulp` 或 `npm install -D gulp`。

### 创建一个gulpfile文件

在项目的根目录下创建一个名为gulpfile.js的文本文件(当然，这个文件可以存在于任何目录中，只需要在使用时通过 `gulp --gulpfile filepath`指定其路径即可, 本文中默认gulp配置文件存在于项目根目录下的build/gulp.config.js中)，并在文件中输入以下内容:

```js
const defaultTask = async () => {
	console.log('gulp default task')
}

exports.default = defaultTask
```
* 如果你安装的是gulp-cli，则在命令行中运行`gulp`就即可，此时控制台输出相应的字符串`gulp default task`。
* 如果你安装的是gulp，则需要在package.json中添加scripts命令，如： `"start": "gulp --gulpfile build/gulp.config.js"`,然后在控制台运行`yarn run start`即可。

## 复制静态资源

在gulp.config.js中添加如果代码, 即可将src/static中的静态资源文件复制到dist/static目录中

```js
const taskCopyStatic = () => {
  return gulp.src('./src/static/**/*.*')
    .pipe(gulp.dest('./dist/static'))
}

const taskWatch = () => {
  gulp.watch('./src/static/**/*.*', gulp.series(taskCopyStatic))
}

exports.default = gulp.parallel(taskCopyStatic, taskWatch)
```

## 打包Less

1. 安装依赖`yarn add -D gulp-less gulp-postcss gulp-cssnano autoprefixer gulp-rename `
2. 添加Less任务

```js
const gulp = require('gulp')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const autoprefixer = require('autoprefixer')

const taskCopyStatic = () => {
  return gulp.src('./src/static/**/*.*')
    .pipe(gulp.dest('./dist/static'))
}

const taskLess = () => {
  return gulp.src(['./src/**/*.less', '!./src/styles/var.less'])
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
    .pipe(gulp.dest('dist'))
}

const taskWatch = () => {
  gulp.watch('./src/**/*.less', gulp.series(taskLess))
  gulp.watch('./src/static/**/*.*', gulp.series(taskCopyStatic))
}

exports.default = gulp.parallel(taskCopyStatic, taskLess, taskWatch)
```

3. 运行命令 `yarn run gulp`, 这样src目录下的Less文件就被打包到了dist/styles目录中了.

**但是需要注意的是, gulp无法打包Less中的依赖资源(如字体, 图片等)**

## 打包JavaScript

### 使用babel

* 安装babel `yarn add -D gulp-babel @babel/core @babel/preset-env`
* 添加JS任务


```js
const taskJS = () => {
  return gulp.src('../src/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(gulp.dest('../dist'))
}
```

* 在src/js目录下index.js文件, 并写入以下代码, 重新运行 `yarn run start`， 即可看到js已经被成功打包到dist/js目录中。

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  static sleep() {
    console.log(`${this.name} is sleeping`)
  }

  eat() {
    console.log(`${this.name} is eating`)
  }
}

class Cat extends Animal {
  constructor(name) {
    super(name)
  }
}

const cat = new Cat('hellokitty')
```

### 生产sourcemap

1. 安装依赖`yarn add -D gulp-sourcemaps`
2. 将JS task更改为如下

```js
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
```

---

本为已同步到个人博客网站, 地址:  [Gulp4在前端中的基本用法](https://www.gogoing.site/articles/1fa6b018-335e-4d7a-a525-45fb73871cdd.html)
