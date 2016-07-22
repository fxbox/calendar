define(function () { 'use strict';

  /* eslint-env amd */

  require.config({
    // ReactDOM expects "react" module to be defined, but it is not.
    map: { '*': { 'react': 'components/react' } }
  });

  var polyfills = [];

  if (!('URLSearchParams' in self)) {
    polyfills.push('polyfills/url-search-params');
  }

  if (!('fetch' in self)) {
    polyfills.push('polyfills/fetch');
  }

  polyfills.push('polyfills/webrtc-adapter');

  var polyfillsPromise = polyfills.length ? require(polyfills) : Promise.resolve();
  polyfillsPromise.then(function () {
    return require(['js/app.js']);
  });

});