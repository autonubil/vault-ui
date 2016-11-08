
module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],


    preprocessors: {
        './app/*/*/**/*.js': 'coverage'
    },


    // list of files / patterns to load in the browser
    files: [
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/angular/angular.min.js',
        './node_modules/angular-mocks/angular-mocks.js',
        './node_modules/angular-route/angular-route.min.js',
        './node_modules/bootstrap/dist/js/bootstrap.min.js',
        './node_modules/restangular/dist/restangular.min.js',
        './node_modules/underscore/underscore-min.js',
        './node_modules/ng-file-upload/dist/ng-file-upload-all.min.js',
        './dist/js/templates.js',
        './app/app.js',
        './app/*/module.js',
        './app/*/*/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'

    reporters: ['progress', 'coverage'],

    coverageReporter: {
        type : 'html',
        dir : 'coverage/'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true, //true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
