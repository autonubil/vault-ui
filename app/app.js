
var underscore = angular.module('underscore', []);
underscore.factory('_', function () {
    return window._; // Underscore must already be loaded on the page
});

var jQuery = angular.module('jQuery', []);
jQuery.factory('$', function () {
    return window.$; // jQuery must already be loaded on the page
});


angular.module('vaultUI', ['underscore', 'jQuery', 'ngRoute', 'restangular', 'LocalStorageModule',
      'ng.jsoneditor',
      'vaultApi', 'templates',
      'angular-duration-format'])
    .config(['$routeProvider', 'localStorageServiceProvider', 'vaultServiceProvider', function ($routeProvider, localStorageServiceProvider, vaultServiceProvider) {
       
        $routeProvider.when('/vault/', {templateUrl: 'common/templates/structure.html' });
        $routeProvider.when('/vault/:itemType', {templateUrl: 'common/templates/structure.html' });  
        $routeProvider.when('/vault/:itemType/:itemPath*', {templateUrl: 'common/templates/structure.html' });
        // $routeProvider.when('/', {templateUrl: 'common/templates/structure.html' });
        $routeProvider.when('/_settings', {templateUrl: 'vault-settings/vault-settings.template.html' });
        $routeProvider.when('/_about', {templateUrl: 'common/templates/about.html' });
        $routeProvider.when('/_contact', {templateUrl: 'common/templates/contact.html' });

//        $routeProvider.otherwise('/dope');

        localStorageServiceProvider
            .setPrefix('vaultUI') 
            .setNotify(true, false);

        console.log('Vault UI Configured');

    }]).run(['localStorageService', 'vaultService', function (localStorageService, vaultService) {
   
        if (!localStorageService.get('serverUrl')) {
            localStorageService.set('serverUrl', 'http://127.0.0.1:9200')
        }

        if (localStorageService.get('serverUrl') && localStorageService.get('token')) {
            vaultService.refresh();
        }

    }]);


    console.log('Script.js loaded');
