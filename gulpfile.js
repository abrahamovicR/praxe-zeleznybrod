const { src, dest, watch, series } = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const data = require("gulp-data");
const plumber = require("gulp-plumber");
const fs = require("fs");
const path = require("path");
const colors = require("ansi-colors");
const fancyLog = require("fancy-log");
const htmlLint = require("gulp-htmllint");
const prettyError = require("gulp-prettyerror");

// --- CSS ---
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// --- JS ---
const terser = require("gulp-terser");

// --- Next-gen obrĂˇzky ---
//const webp = require("gulp-webp");
const avif = require("gulp-avif");

// Cesty
const paths = {
  templates: "src/templates/**/*.html",
  dataFile: "src/templates/data.json",
  dest: "docs",
  styles: "src/styles/*.css",
  scripts: "src/scripts/*.js",
  stylesDest: "dist/assets/css",
  scriptsDest: "dist/assets/js",
  images: "src/img/*.{jpg,jpeg}",
  imagesDest: "dist/assets/images",
};

// --- Ĺ ablony (Nunjucks) ---
function render() {
  return src(["src/**/*.html", "!src/layout.html"])
    .pipe(plumber())
    .pipe(data(JSON.parse(fs.readFileSync(paths.dataFile))))
    .pipe(
      nunjucksRender({
        path: ["src/"],
      })
    )
    .pipe(dest(paths.dest));
}

// --- SCSS â†’ CSS + autoprefix + minify ---
function styles() {
  return src(paths.styles)
    .pipe(plumber())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(paths.stylesDest));
}

// --- Minifikace JS ---
function scripts() {
  return src(paths.scripts).pipe(plumber()).pipe(terser()).pipe(dest(paths.scriptsDest));
}

// --- Konverze obrĂˇzkĹŻ na WebP ---
/*function imagesToWebp() {
  return src(paths.images).pipe(plumber()).pipe(webp()).pipe(dest(paths.imagesDest));
}*/

// --- Konverze obrĂˇzkĹŻ na AVIF ---
function imagesToAvif() {
  return src(paths.images)
    .pipe(plumber())
    .pipe(avif({ quality: 50 }))
    .pipe(dest(paths.imagesDest));
}

// --- Watcher ---
function watchFiles() {
  watch(paths.templates, render);
  watch(paths.dataFile, render);
  watch(paths.styles, styles);
  watch(paths.scripts, scripts);
  watch(paths.images, series(/*imagesToWebp,*/ imagesToAvif));
}

// --- HTML lint ---
function htmlLintTask() {
  let errorFree = true;

  return src(["src/**/*.html"])
    .pipe(
      htmlLint({}, function (filepath, issues) {
        if (issues.length > 0) {
          errorFree = false;
          fancyLog(colors.cyan("[gulp-htmllint]") + " Error in " + colors.magenta(filepath));
        }

        issues.forEach(function (issue) {
          process.stdout.write(colors.white("line " + issue.line + ", col " + issue.column) + "\t\t" + colors.red(issue.msg) + " " + colors.white("[" + issue.rule + ":" + issue.code + "]") + "\n");
        });

        if (issues.length > 0) {
          process.exitCode = 1;
        }
      })
    )
    .on("finish", function () {
      if (errorFree) {
        fancyLog(colors.green("Task completed successfully!") + " [_htmlLint]");
      } else {
        fancyLog(colors.red("Task failed!"));
      }
    });
}

// --- Default ---
exports.default = series(render, styles, scripts, imagesToAvif, htmlLintTask, watchFiles);