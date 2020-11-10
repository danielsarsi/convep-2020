const { series, src, dest } = require("gulp");
const postcss = require("gulp-postcss");
const posthtml = require("gulp-posthtml");
const babel = require("gulp-babel");
const terser = require("gulp-terser");

function vendor() {
  return src("./src/vendor/**/*.*").pipe(dest("./dist/vendor"));
}

function img() {
  return src("./src/assets/**/*.{png,svg}").pipe(dest("./dist/assets"));
}

function favicon() {
  return src("./src/favicon.png").pipe(dest("./dist"));
}

function css() {
  return src("./src/assets/**/*.css")
    .pipe(postcss())
    .pipe(dest("./dist/assets"));
}

function html() {
  var plugins = [require("htmlnano")({ minifySvg: false })];

  return src("./src/**/*.html").pipe(posthtml(plugins)).pipe(dest("./dist"));
}

function js() {
  return src("./src/assets/**/*.js")
    .pipe(babel())
    .pipe(terser())
    .pipe(dest("./dist/assets"));
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.vendor = vendor;
exports.default = series(vendor, favicon, img, css, js, html);
