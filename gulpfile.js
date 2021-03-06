/* eslint-env node */

'use strict';

const gulp = require('gulp');

const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const zip = require('gulp-zip');
const del = require('del');
const runSequence = require('run-sequence');
const webserver = require('gulp-webserver');
const mocha = require('gulp-mocha');
const gls = require('gulp-live-server');
const sww = require('gulp-sww');
const esdoc = require('gulp-esdoc');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const merge = require('merge2');
const rollup = require('gulp-rollup');
const rollupBabelPlugin = require('rollup-plugin-babel');
const rollupIncludePathsPlugin = require('rollup-plugin-includepaths');
//const rollupUglifyPlugin = require('rollup-plugin-uglify');
const minifier = require('gulp-uglify/minifier');
const uglifyjs = require('uglify-js');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');
const stylelint = require('gulp-stylelint');
const git = require('gulp-git');
const ghPages = require('gulp-gh-pages');

const APP_ROOT = './app/';
const TESTS_ROOT = './tests/';
const DOC_ROOT = './doc/';

const DIST_ROOT = './dist/';
const DIST_APP_ROOT = './dist/app/';
const DIST_TESTS_ROOT = './dist/tests/';

const EXTERNAL = [
  'components/react',
  'components/react-dom',
  'components/lodash',
  'components/moment',
  'components/cldr/en',
  'components/cldr/core',
  'components/jsspeechrecognizer',
  'components/chrono',
  'components/webaudiokws',
];

let webserverStream;
let foxboxSimulator;
let registrationServerSimulator;

/**
 * Runs eslint on all javascript files found in the app and tests dirs.
 */
gulp.task('lint', () => {
  return merge(
    // Note: To have the process exit with an error code (1) on lint error,
    // return the stream and pipe to failOnError last.
    gulp
      .src([`${APP_ROOT}**/*.{js,jsx}`, `${TESTS_ROOT}**/*.js`, './*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError()),

    gulp
      .src('app/**/*.css')
      .pipe(
        stylelint({ reporters: [{ formatter: 'string', console: true }] })
      )
  );
});

gulp.task('copy-app-common', () => {
  return merge(
    gulp.src([
      `${APP_ROOT}**`,
      `${APP_ROOT}/data`,
      // Don't copy documentation files.
      `!${APP_ROOT}**/*.md`,
      // Don't copy JS, it will be compiled and copied on the compile step.
      `!${APP_ROOT}js/**`,
      // Don't copy CSS, it will be compiled and copied on the compile step.
      `!${APP_ROOT}**/*.css`,
    ], { nodir: true }),

    // Module loader.
    gulp.src('./node_modules/alameda/alameda.js')
      .pipe(rename('js/alameda.js')),

    // Components.
    gulp.src('./node_modules/lodash/lodash.min.js')
      .pipe(rename('js/components/lodash.js')),
    gulp.src('./node_modules/moment/min/moment-with-locales.min.js')
      .pipe(rename('js/components/moment.js')),
    gulp.src('./node_modules/chrono-node/chrono.min.js')
      .pipe(rename('js/components/chrono.js')),
    gulp.src('./node_modules/twitter_cldr/min/core.min.js')
      .pipe(rename('js/components/cldr/core.js')),
    gulp.src('./node_modules/twitter_cldr/min/en.min.js')
      .pipe(rename('js/components/cldr/en.js')),
    gulp.src('./node_modules/webaudio-kws-node/dist/amd-library.js')
      .pipe(rename('js/components/webaudiokws.js')),
    gulp.src('./node_modules/webaudio-kws-node/dist/ps-worker.js')
      .pipe(rename('js/components/ps-worker.js')),
    gulp.src('./node_modules/webaudio-kws-node/dist/pocketsphinx.js')
      .pipe(rename('js/components/pocketsphinx.js')),

    // Polyfills.
    gulp.src('./node_modules/whatwg-fetch/fetch.js')
      .pipe(rename('js/polyfills/fetch.js')),
    gulp.src('./node_modules/webrtc-adapter/out/adapter.js')
      .pipe(rename('js/polyfills/webrtc-adapter.js'))
  )
    .pipe(gulp.dest(DIST_APP_ROOT));
});

/**
 * Copy all required app resources/assets/external components to be used in
 * development build.
 */
gulp.task('copy-app-dev', ['copy-app-common'], () => {
  return merge(
    // Components.
    gulp.src('./node_modules/react/dist/react.js')
      .pipe(rename('js/components/react.js')),
    gulp.src('./node_modules/react-dom/dist/react-dom.js')
      .pipe(rename('js/components/react-dom.js')),

    // Polyfills.
    gulp.src('./node_modules/url-search-params/build/url-search-params.max.js')
      .pipe(rename('js/polyfills/url-search-params.js'))
  )
    .pipe(gulp.dest(DIST_APP_ROOT));
});

/**
 * Copy all required app resources/assets/external components to be used in
 * production build.
 */
gulp.task('copy-app-production', ['copy-app-common'], () => {
  return merge(
    // Components.
    gulp.src('./node_modules/react/dist/react.min.js')
      .pipe(rename('js/components/react.js')),
    gulp.src('./node_modules/react-dom/dist/react-dom.min.js')
      .pipe(rename('js/components/react-dom.js')),

    // Polyfills.
    gulp.src('./node_modules/url-search-params/build/url-search-params.js')
      .pipe(rename('js/polyfills/url-search-params.js'))
  )
    .pipe(gulp.dest(DIST_APP_ROOT));
});

/**
 * Compiles app source i.e. processes source with Babel and Rollup.
 */
gulp.task('compile-app-dev', () => {
  return gulp
    .src(`${APP_ROOT}js/*.js`)
    .pipe(
      rollup({
        sourceMap: true,
        format: 'amd',
        external: EXTERNAL,
        plugins: [
          rollupBabelPlugin(),
          rollupIncludePathsPlugin({ extensions: ['.js', '.jsx'] }),
        ],
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${DIST_APP_ROOT}js`));
});

/**
 * Compiles app source for production i.e. processes source with Babel, Rollup
 * and UglifyJS.
 */
gulp.task('compile-app-production', ['compress-external-modules'], () => {
  return gulp
    .src(`${APP_ROOT}js/*.js`)
    .pipe(
      rollup({
        sourceMap: false,
        format: 'amd',
        external: EXTERNAL,
        plugins: [
          rollupBabelPlugin(),
          //rollupUglifyPlugin({ sourceMap: false }, uglifyjs.minifier),
          rollupIncludePathsPlugin({ extensions: ['.js', '.jsx'] }),
        ],
      })
    )
    .pipe(gulp.dest(`${DIST_APP_ROOT}js`));
});

/**
 * Compresses external modules that don't provide compressed version.
 */
gulp.task('compress-external-modules', () => {
  return gulp
    .src([
      `${DIST_APP_ROOT}js/alameda.js`,
      `${DIST_APP_ROOT}js/polyfills/fetch.js`,
    ], { base: DIST_APP_ROOT })
    .pipe(sourcemaps.init())
    .pipe(minifier({}, uglifyjs))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(DIST_APP_ROOT));
});

/**
 * Applies Babel transform to the app/tests JS and JSX files. The only
 * difference between normal app build and build for unit tests is that Rollup
 * is not used here.
 */
gulp.task('compile-unit-tests', () => {
  process.env.BABEL_ENV = 'test';

  return gulp
    .src([`${APP_ROOT}js/**/*.{js,jsx}`, `${TESTS_ROOT}unit/**/*.js`])
    .pipe(babel())
    .pipe(gulp.dest(`${DIST_TESTS_ROOT}unit/`));
});

/**
 * Pipes CSS through several postCSS plugins and outputs single CSS file.
 */
gulp.task('compile-css', () => {
  return gulp.src(`${APP_ROOT}css/app.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss([
      postcssImport(),
      postcssUrl({ url: 'rebase' }),
      cssnano(),
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${DIST_APP_ROOT}css/`));
});

/**
 * Packages the application into a zip.
 */
gulp.task('zip', () => {
  return gulp.src(DIST_APP_ROOT)
    .pipe(zip('app.zip'))
    .pipe(gulp.dest(DIST_ROOT));
});

/**
 * Builds the app for development.
 */
gulp.task('build-dev', (cb) => {
  process.env.BABEL_ENV = 'development';

  runSequence(
    'lint', 'clobber-app', 'copy-app-dev', 'compile-app-dev', 'compile-css',
    'offline', cb
  );
});

/**
 * Builds the app for the production.
 */
gulp.task('build-production', (cb) => {
  process.env.BABEL_ENV = 'production';

  runSequence(
    'lint', 'clobber-app', 'copy-app-production', 'compile-app-production',
    'compile-css', 'offline', cb
  );
});

/**
 * Add offline support.
 */
gulp.task('offline', () => {
  return gulp.src(
    [
      '**/*',
      '!**/*.map',
    ],
    { cwd: DIST_APP_ROOT }
  )
    .pipe(sww({ hookSW: ['serviceworker/push.js', 'serviceworker/update.js'] }))
    .pipe(gulp.dest(DIST_APP_ROOT));
});

/**
 * Watch for changes on the file system, and rebuild if so.
 */
gulp.task('watch', () => {
  gulp.watch([`${APP_ROOT}**`], ['build-dev']);
});

gulp.task('webserver', () => {
  webserverStream = gulp.src(DIST_APP_ROOT)
    .pipe(webserver({
      port: process.env.PORT || 8000,
      host: process.env.HOSTNAME || 'localhost',
      livereload: false,
      directoryListing: false,
      open: false,
      https: { key: './certs/key.pem', cert: './certs/cert.pem' },
    }));
});

gulp.task('stop-webserver', () => {
  webserverStream.emit('kill');
});

/**
 * The default task when `gulp` is run.
 * Adds a listener which will re-build on a file save.
 */
gulp.task('default', (cb) => {
  runSequence('build-dev', 'webserver', 'watch', cb);
});

/**
 * Remove the distributable files.
 */
gulp.task('clobber-app', () => del(DIST_APP_ROOT));
gulp.task('clobber-tests', () => del(DIST_TESTS_ROOT));
gulp.task('clobber-doc', () => del(DOC_ROOT));

/**
 * Cleans all created files by this gulpfile, and node_modules.
 */
gulp.task('clean', () => {
  return del([
    DIST_ROOT,
    DOC_ROOT,
    'node_modules/',
  ]);
});

/**
 * Generate documentation from the code.
 */
gulp.task('generate-doc', () => {
  return gulp.src(`${APP_ROOT}js/lib/foxbox/`)
    .pipe(esdoc({
      destination: DOC_ROOT,
      title: 'Project Cue app',
      test: {
        type: 'mocha',
        source: TESTS_ROOT,
      },
    }));
});

gulp.task('copy-doc-badge', () => {
  return gulp.src(`${DOC_ROOT}badge.svg`)
    .pipe(gulp.dest('./assets/'));
});

gulp.task('start-simulators', () => {
  foxboxSimulator = gls(
    `${TESTS_ROOT}foxbox-simulator/http-server.js`, undefined, false
  );
  foxboxSimulator.start();

  registrationServerSimulator = gls(
    `${TESTS_ROOT}registration-server-simulator/http-server.js`, undefined,
    false
  );
  registrationServerSimulator.start();
});

gulp.task('stop-simulators', () => {
  foxboxSimulator.stop();
  registrationServerSimulator.stop();
});

gulp.task('run-unit-tests', ['compile-unit-tests'], (cb) => {
  const server = new (require('karma').Server)(
    { configFile: `${__dirname}/karma.conf.js` }, cb
  );

  server.start();
});

gulp.task('run-test-integration', () => {
  return gulp.src(
    `${TESTS_ROOT}{common,integration}/**/*_test.js`, { read: false }
  )
    .pipe(mocha());
});

gulp.task('doc', (cb) => {
  runSequence(['clobber-doc'], ['generate-doc'], ['copy-doc-badge'], cb);
});

gulp.task('test-integration', (cb) => {
  runSequence('start-simulators', 'run-test-integration', () => {
    // Tear down whatever the result is
    runSequence('stop-simulators', cb);
  });
});

gulp.task('run-test-e2e', () => {
  return gulp.src(`${TESTS_ROOT}{common,e2e}/**/*_test.js`, { read: false })
    .pipe(mocha());
});

gulp.task('test', ['clobber-tests', 'build-production'], (cb) => {
  runSequence(
    'run-unit-tests',
    'webserver',
    'test-integration',
    () => { // Tear down whatever the result is
      runSequence('stop-webserver', cb);
    }
  );
});

// @todo Should be included in 'test' once less manual steps are required.
gulp.task('test-e2e', (cb) => {
  runSequence(
    'build-production',
    'webserver',
    'run-test-e2e',
    'stop-webserver',
    cb
  );
});

/**
 * Deploys production-optimized app build to the "origin/gh-branch". Every new
 * deployment comes with a separate commit attributed with the date and source
 * branch revision. If tree has some changes that are not committed yet, there
 * will be a warning, but all local changes will be deployed anyway.
 */
gulp.task('deploy', ['build-production'], () => {
  const wrapIntoPromise = (method, args) => new Promise((resolve, reject) => {
    git[method].call(
      git, args, (err, result) => err ? reject(err) : resolve(result)
    );
  });

  return Promise
    .all([
      wrapIntoPromise('revParse', { args: '--short HEAD', quiet: true }),
      wrapIntoPromise('status', { args: '--porcelain', quiet: true }),
    ])
    .then((results) => {
      const revision = results[0];
      const status = results[1];

      let message = `Deployment is based on ${revision}`;

      if (status) {
        console.log(
          '\x1b[31m',
          `You have uncommitted changes that will be deployed!\n${status}`,
          '\x1b[0m'
        );

        message += ' (includes uncommitted changes)';
      }

      return new Promise((resolve, reject) => {
        merge(gulp.src(`${DIST_APP_ROOT}**/*`).pipe(ghPages({ message })))
          .on('end', resolve)
          .on('error', reject);
      });
    });
});
