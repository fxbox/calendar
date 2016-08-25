import BaseController from './base';

export default class Analytics extends BaseController {
  constructor(props) {
    super(props);

    // Creates an initial ga() function.
    // The queued commands will be executed once analytics.js loads.
    window.ga = window.ga || function() {
        (ga.q = ga.q || []).push(arguments);
      };

    // Sets the time (as an integer) this tag was executed.
    // Used for timing hits.
    ga.l = Date.now();

    // Creates a default tracker.
    ga('create', 'UA-83150540-1', {
      'siteSpeedSampleRate': 100,
      'forceSSL': true,
      'dataSource': 'app', // Rather than web.
      'appName': 'Project Cue',

      // Disabling cookies.
      // @see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#disabling_cookies
      'storage': 'none',
      'clientId': this.settings.gaClientID,
    });

    // Using localStorage to store the client ID.
    // @see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id
    ga((tracker) => {
      this.settings.gaClientID = tracker.get('clientId');
    });

    // Sends a pageview hit from the tracker just created.
    ga('send', 'pageview');

    // Track the installation of the app using the W3C app manifest.
    window.addEventListener('install', () => {
      ga('send', 'event', 'App', 'install');
    });
  }
}
