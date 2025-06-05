


const { src, dest, watch, series } = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const plumber = require('gulp-plumber');
const fs = require('fs');
const path = require('path');
const colors = require('ansi-colors');
const fancyLog = require('fancy-log');
const htmlLint = require('gulp-htmllint');
const prettyError = require('gulp-prettyerror');

// Cesty ke šablonám a datům
const paths = {
  templates: 'src/templates/**/*.html',
  dataFile: 'src/templates/data.json',
  dest: './'
};

// Načte JSON data s proměnnými
function getData() {
  return JSON.parse(fs.readFileSync(paths.dataFile));
}

// Render task
function render() {
  return src(['src/templates/**/*.html', '!src/templates/layout.html'])

    .pipe(plumber())
    .pipe(data(getData))
    .pipe(nunjucksRender({
      path: ['src/'] // pro include/extend
    }))
    .pipe(dest(paths.dest));
}

// Watcher
function watchFiles() {
  watch(paths.templates, render);
  watch(paths.dataFile, render);
}

function htmlLintTask() {
  let errorFree = true;

  return src(['src/templates/**/*.html'])
    .pipe(
      htmlLint({}, function (filepath, issues) {
        if (issues.length > 0) {
          errorFree = false;
          fancyLog(colors.cyan('[gulp-htmllint]') + ' Error in ' + colors.magenta(filepath));
        }

        issues.forEach(function (issue) {
          process.stdout.write(
            colors.white('line ' + issue.line + ', col ' + issue.column) +
            '\t\t' +
            colors.red(issue.msg) +
            ' ' +
            colors.white('[' + issue.rule + ':' + issue.code + ']') +
            '\n'
          );
        });

        if (issues.length > 0) {
          process.exitCode = 1;
        }
      })
    )
    .on('finish', function (error) {
      if (errorFree) {
        fancyLog(colors.green('Task completed successfully!') + ' [_htmlLint]');
      } else {
        fancyLog(colors.red('Task failed!'));
      }
    });
}


exports.default = series(render, htmlLintTask, watchFiles);

