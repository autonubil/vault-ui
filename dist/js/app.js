
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

// Declare factory
angular
    .module('vaultApi', ['restangular'])

    .provider('vaultService',  function () {
       
        var scope;
        var privateMounts;
        var privateAuthMethods;
        var privateTokenInfo;
        var privateServerInfo;
        var privateCurrentItem = {};

        this.$get = ['Restangular', 'localStorageService', '$q', '$rootScope', function(Restangular, localStorageService, $q, $rootScope) {
            var vaultApi =  {
                policies : function() {return [].concat (this.privatePolicies);},
                mounts : function() {return [].concat (this.privateMounts);},
                currentItem : function() {  return angular.copy(this.privateCurrentItem); },
                tokenInfo : function() {  return angular.copy(this.privateTokenInfo); },
                serverInfo : function() { return angular.copy(this.privateServerInfo); },
                token: function () { return localStorageService.get('token'); },
                serverUrl: function () { return localStorageService.get('serverUrl'); },
                authMethods: function () {return angular.copy(this.privateAuthMethods); },

                api: function(setToken) {
                    var api =  Restangular.withConfig(function (RestangularConfigurer) {
                        RestangularConfigurer.setDefaultHeaders({ 'X-Vault-Token': vaultApi.token() });
                        RestangularConfigurer.setBaseUrl(vaultApi.serverUrl());
                    });
                    return api;
                },

                getHealth: function () {
                    return this.api().all('v1/sys').one('health').get();
                },
                validateToken: function () {
                    return this.api(true).all('v1/auth/token').one('lookup-self').get();
                },
                listMounts: function () {
                    return this.api(true).all('v1/sys').one('mounts').get();
                },
                listAuthMethods: function () {
                    return this.api().all('v1/sys').one('auth').get();
                },
                listPolicies: function () {
                    return this.api(true).all('v1/sys').one('policy').get();
                },
                readPath: function (path) {
                    return this.api(true).all('v1/'+ this.firstPathSegments(path)).one(this.lastPathSegment(path) ).get();
                },
                listPath: function (path) {
                      if (path == null)
                        return null;
                    return this.api(true).all('v1/'+this.firstPathSegments(path)).one(this.lastPathSegment(path)+"?list=true" ).get();
                },

                sanitizePath: function(path) {
                     if (path == null)
                        return null;
                    if ( path.lastIndexOf('/') == path.length-1){
                        path = path.substring(0,path.length-1);
                    }
                    return path;
                },
                lastPathSegment: function(path) {
                    if (path == null)
                        return null;
                    path = this.sanitizePath(path);
                    var lastSlash = path.lastIndexOf('/');
                    if (lastSlash != -1) {
                        return path.substring(lastSlash);
                    }
                    return path;
                },
                firstPathSegments: function(path) {
                    if (path == null)
                        return null;
                    path = this.sanitizePath(path);
                    var lastSlash = path.lastIndexOf('/');
                    if (lastSlash != -1) {
                        return path.substring(0, lastSlash);
                    }
                    return "";
                },

                setCurrentItem: function(path) {
                    self = this;
                     $q(function (resolve, reject) {
                    self.readPath(path).then(function (val) {
                            self.privateCurrentItem = {
                                path: path,
                                content: val ? val.data : null
                            }
                            $rootScope.$broadcast("vaultApi.refresh.currentItem");
                        }, function (reason) { 
                            self.privateCurrentItem = {};
                            $rootScope.$broadcast("vaultApi.refresh.currentItem");
                            console.log(reason); reject(reason); });
                     });
                },

                reset: function() {
                    self = this;
                    self.privatePolicies = [];
                    $rootScope.$broadcast("vaultApi.refresh.policies");
                    
                    self.privateMounts = [];
                    $rootScope.$broadcast("vaultApi.refresh.mounts");

                    self.privateAuthMethods = [];
                    $rootScope.$broadcast("vaultApi.refresh.authMethods");
                    
                    self.privateTokenInfo = {};
                    $rootScope.$broadcast("vaultApi.refresh.tokenInfo");
                    
                    self.privateServerInfo = {};  
                    $rootScope.$broadcast("vaultApi.refresh.serverInfo");

                    self.privateServerInfo = {};  
                    $rootScope.$broadcast("vaultApi.refresh.serverInfo");
                    
                    self.privateCurrentItem = {};  
                    $rootScope.$broadcast("vaultApi.refresh.currentItem");
                    
                    $rootScope.$broadcast("vaultApi.refresh");
                },
                refresh: function () {
                     self = this;
                     self.reset();
                    return $q(function (resolve, reject) {
                        self.getHealth().then(function (val) {
                            self.privateServerInfo = val;
                            $rootScope.$broadcast("vaultApi.refresh.serverInfo");
                        }, function (reason) { console.log(reason); reject(reason); })
                        self.validateToken().then(function (val) {
                            self.privateTokenInfo = val.data;
                            $rootScope.$broadcast("vaultApi.refresh.tokenInfo");
                            self.listMounts().then(function (val) {
                                self.privateMounts = [];
                                angular.forEach(val.data, function(mountInfo, mountPoint) {
                                    var sanitizedPath = self.sanitizePath(mountPoint);
                                    if (sanitizedPath != 'sys') { 
                                        mountInfo['path'] = sanitizedPath;
                                        self.privateMounts.push(mountInfo);
                                    }
                                });
                                $rootScope.$broadcast("vaultApi.refresh.mounts");

                                self.listAuthMethods().then(function (val) {
                                    self.privateAuthMethods = val.data;
                                    $rootScope.$broadcast("vaultApi.refresh.authMethods");
                                    self.listPolicies().then(function (val) {
                                        self.privatePolicies = val.policies;
                                        $rootScope.$broadcast("vaultApi.refresh.policies");
                                        $rootScope.$broadcast("vaultApi.refresh");
                                        resolve(self);
                                    }, function (reason) { console.log(reason); self.reset(); reject(reason); })
                                }, function (reason) { console.log(reason); self.reset(); reject(reason); })
                            }, function (reason) { console.log(reason); self.reset(); reject(reason); })
                        }, function (reason) { console.log(reason); self.reset(); reject(reason); })
                    });
                }
            }

            return vaultApi;
        }];
    });
function VaultContentController($rootScope, $scope, $routeParams, vaultService) {

  $scope.options = {
      mode: 'code',
      modes: ['tree', 'code'],
      search: true};

  if ($routeParams.path) {
    $scope.obj =  {
        path : $routeParams.path,
        content: {info: "loading...."}
    }
    
  } else {
    $scope.obj = vaultService.currentItem();
  }
  
  var unbind = $rootScope.$on("vaultApi.refresh.currentItem", function () {
      $scope.obj = vaultService.currentItem();
  });
  $scope.$on('$destroy', unbind);

  $scope.btnClick = function() {
    $scope.obj.options.mode = 'code'; //should switch you to code view
  }
};


angular.module('vaultUI')
  .component('vaultContent', {
    templateUrl: 'vault-content/vault-content.template.html',
    controller: ['$rootScope', '$scope', '$routeParams', 'vaultService',  VaultContentController],
    bindings: {
      name: '<',
      path: '<'
    }
  });

// VaultHealthComponent

function VaultHealthController($scope, $rootScope, vaultService) {
  $scope.health = vaultService.serverInfo();
  var unbind = $rootScope.$on("vaultApi.refresh.serverInfo", function () {
    $scope.health = vaultService.serverInfo();
  });
  $scope.$on('$destroy', unbind);


};


angular.module('vaultUI')
  .component('vaultHealth', {
    templateUrl: 'vault-health/vault-health.template.html',
    controller: ['$scope', '$rootScope', 'vaultService', VaultHealthController]
  }); 
// VaultPathComponent

function VaultPathController($scope, $rootScope, $routeParams, $location, vaultService) {
  $scope.loaded = false;
  $scope.pathes = [];
  $scope.items = [];
  $scope.pathCount = 0;
  $scope.error = null;
  $scope.pathStates = {};

  $scope.togglePath = function (what) {
    $scope.pathStates[what] = !$scope.pathStates[what];
    console.log("Toggled path '" + what + "' to " + $scope.pathStates[what]);
  }

  $scope.selectPath = function (what) {
    $scope.pathStates[what] = true;
    $location.path("/vault/" + this.type + "/" + what);

    var pathItemName = what.substring(0, what.length-1);
    var pathItemNames = pathItemName.split('/');
    console.log(pathItemName);
    console.log(pathItemName);
    console.log(pathItemName);
    console.log($scope.items);
    if ($scope.items.indexOf( pathItemNames[ pathItemNames.length-1]) > -1 ){
      vaultService.setCurrentItem(pathItemName);
    } else {
      vaultService.setCurrentItem(null);
    }
  }


  $scope.selectDetails = function (what) {
    $location.path("/vault/" + this.type + "/" + what);
    if (!what.endsWith("/")) {
      vaultService.setCurrentItem(what);
    }
  }

  // select from path?
  if ($routeParams.itemType == this.type && $routeParams.itemPath) {
    $scope.pathStates[$routeParams.itemPath] = true;
    var parts = $routeParams.itemPath.split('/');
    var thisParts = this.path.split('/');
 
    if (parts.length >= thisParts.length) {
      var selected = ""
      var selected = "";
      for (var i = 0; i <= thisParts.length; i++) {
        if (parts[i] != '') {
          selected += parts[i] + "/";
         $scope.pathStates[selected] = true;
        }
      }
    }
  }



  this.$onInit = function () {
    console.log("path.$onInit with: " + this.type + " | " + this.subtype + " " + this.path + " : " + this.name);
    $scope.path = this.path;
    $scope.name = this.name;
    $scope.type = this.type;
    $scope.subtype = this.subtype;

    if (this.type == "auth" && this.subtype == 'userpass' && this.path.split('/').length == 3 ) {
        $scope.pathes = ["users"];
        $scope.items = [];
        $scope.loaded = true;
        return;
      } else     if (this.type == "auth" && this.subtype == 'ldap' && this.path.split('/').length == 3 ) {
        $scope.pathes = ["roles","groups", "users"];
        $scope.items = [ "config"];
        $scope.loaded = true;
        return;
      }  else     if (this.type == "auth" && this.subtype == 'chef' && this.path.split('/').length == 3 ) {
        $scope.pathes = ["roles" ,"groups", "users"];
        $scope.items = [ "config"];
        $scope.loaded = true;
        return;
      }

    if (!this.path.endsWith("/")) {

      vaultService.readPath(this.path).then(function (val) {
        $scope.content = val.data;
        $scope.loaded = true;
      }, function (reason) {
        console.log(reason);
        if (reason.status == 404) {
          $scope.loaded = true;
          $scope.content = {};
        } else {
          alert(reason.status);
          $scope.error = reason.statusText;
        }
      });
    } else {

      // some mounts have "hardcoded" children
      if (this.type == "mount" && this.subtype == 'pki' && this.path.split('/').length == 2) {
        $scope.pathes = ["roles","certs"];
        $scope.items = [ "config/urls","config/crl"];
        $scope.loaded = true;

      }
      else  if (this.type == "mount" && this.subtype == 'ssh' && this.path.split('/').length == 2) {
        $scope.pathes = ["roles"];
        $scope.items = [ "config/zeroaddress"];
        $scope.loaded = true;
      } 
      else  vaultService.listPath(this.path).then(function (val) {
        var pathes = []
        var items = []
        for (var i = 0; i < val.data.keys.length; i++) {
          var key = val.data.keys[i];
          var path = key;
          if (key.endsWith('/')) {
            path = path.substring(0, path.length - 1);
            pathes.push(path)
          } else {
            items.push(path)
          }

        }
        $scope.pathes = pathes;
        $scope.items = items;
        $scope.loaded = true;

      }, function (reason) {
        if (reason.status == 404) {
          $scope.loaded = true;
          $scope.keys = [];
        } else {
          console.log(reason);
          $scope.error = reason.statusText;
        }
      });
    }


  };
};


angular.module('vaultUI')
  .component('vaultPath', {
    templateUrl: 'vault-path/vault-path.template.html',
    controller: ['$scope', '$rootScope', '$routeParams', '$location', 'vaultService', VaultPathController],
    scope: {},
    bindings: {
      name: '<',
      path: '<',
      type: '<',
      subtype: '<'
    }
  }); 
angular.
  module('vaultUI').
  controller('VaultSettingsController', ['$scope', 'vaultService', 'localStorageService', '$rootScope', '$location', function ($scope, vaultService, localStorageService, $rootScope,
    $location) {

    $scope.health = vaultService.serverInfo;
    var unbind = $rootScope.$on("vaultApi.refresh.serverInfo", function () {
      $scope.health = vaultService.serverInfo();
    });
    $scope.$on('$destroy', unbind);

    $scope.update = function (serverUrl, token) {
      localStorageService.set('serverUrl', serverUrl);
      localStorageService.set('token', token);
      if (token) {
        vaultService.refresh().then(function (val) {
          $location.url('/vault/mount/');
        })
      }
    }

    localStorageService.bind($scope, 'serverUrl');
    localStorageService.bind($scope, 'token');
    console.log("New Health Controller");
    vaultService.refresh().then(function (val) {
      $scope.health = val.serverInfo;
    },
      function (reason) {
        console.log("Failed: " + reason);
        $scope.health = reason;
      }

    );
  }
  ]);
// VaultTokenController

function VaultTokenController($scope, $rootScope, vaultService) {
  $scope.health = vaultService.serverInfo();
  var unbind = $rootScope.$on("vaultApi.refresh.tokenInfo", function () {
    $scope.tokenInfo = vaultService.tokenInfo();
  });
  $scope.$on('$destroy', unbind);

};


angular.module('vaultUI')
  .component('vaultToken', {
    templateUrl: 'vault-token/vault-token.template.html',
    controller: ['$scope', '$rootScope', 'vaultService', VaultTokenController]
  });
function VaultTreeController($rootScope, $scope, $routeParams, $location, vaultService) {

  $scope.itemExpanded = {};
  $scope.policyExpanded = {};
  $scope.authExpanded = {};

  $scope.toggleMount = function (what) {
    $scope.itemExpanded[what] = !$scope.itemExpanded[what];
  }

   $scope.selectMount = function (what) {
    $scope.itemExpanded[what] = true;
    $location.path("/vault/"+this.type+"/"+ what)
    // vaultService.setCurrentItem(what);
  }
  
  $scope.togglePolicy = function (what) {
    $scope.policyExpanded[what] = !$scope.policyExpanded[what];
  }

   $scope.selectPolicy = function (what) {
    $scope.policyExpanded[what] = true;
    $location.path("/vault/"+this.type+"/"+ what)
    vaultService.setCurrentItem('/sys/policy/'+what);
  }
  
  $scope.toggleAuthMethod = function (what) {
    $scope.authExpanded[what] = !$scope.authExpanded[what];
  }

   $scope.selectAuthMethod = function (what) {
    $scope.authExpanded[what] = true;
    $location.path("/vault/"+this.type+"/"+ what)
    vaultService.setCurrentItem('auth/'+what);
  }

  $scope.mounts = vaultService.mounts();
  var unbind = $rootScope.$on("vaultApi.refresh.mounts", function () {
    $scope.mounts = vaultService.mounts();
  });
  $scope.$on('$destroy', unbind);

  $scope.policies = vaultService.policies();
  var unbindPolicies = $rootScope.$on("vaultApi.refresh.policies", function () {
    $scope.policies = vaultService.policies();
  });
  $scope.$on('$destroy', unbindPolicies);


  $scope.authMethods = vaultService.authMethods();
  var unbindAuthMethods = $rootScope.$on("vaultApi.refresh.authMethods", function () {
    $scope.authMethods = vaultService.authMethods();
  });
  $scope.$on('$destroy', unbindAuthMethods);


  // Select from path



  if ($routeParams.itemType == this.type &&  $routeParams.itemPath && $routeParams.itemPath.split('/').length > 0) {

      if ($routeParams.itemType == 'mount') {
        var mountFromPath = $routeParams.itemPath.split('/')[0]; 
        $scope.itemExpanded[mountFromPath] = true;
      }
      if ($routeParams.itemType == 'policy') { 
        $scope.policyExpanded[mountFromPath] = true;
      }
      if ($routeParams.itemType == 'auth') {
        var mountFromPath = $routeParams.itemPath.split('/')[1];
        $scope.authExpanded["auth/"+mountFromPath+'/'] = true;
                console.log($scope.authExpanded); 
      }        
   }
   
  this.$onInit = function () {
    $scope.type = this.type;
  }
};


angular.module('vaultUI')
  .component('vaultTree', {
    templateUrl: 'vault-tree/vault-tree.template.html',
    controller: ['$rootScope', '$scope', '$routeParams', '$location', 'vaultService',  VaultTreeController],
    bindings: {
      type: '<'
    }
  });

angular
    .module('angular-duration-format.filter', [ ])
    .filter('duration', function() {

        var DURATION_FORMATS_SPLIT = /((?:[^ydhms']+)|(?:'(?:[^']|'')*')|(?:y+|d+|h+|m+|s+))(.*)/;
        var DURATION_FORMATS = {
            'y': { // years
                // "longer" years are not supported
                value: 365 * 24 * 60 * 60 * 1000
            },
            'yy': {
                value: 'y',
                pad: 2
            },
            'd': { // days
                value: 24 * 60 * 60 * 1000
            },
            'dd': {
                value: 'd',
                pad: 2
            },
            'h': { // hours
                value: 60 * 60 * 1000
            }, 
            'hh': { // padded hours
                value: 'h',
                pad: 2
            }, 
            'm': { // minutes
                value: 60 * 1000
            }, 
            'mm': { // padded minutes
                value: 'm',
                pad: 2
            }, 
            's': { // seconds
                value: 1000
            }, 
            'ss': { // padded seconds
                value: 's',
                pad: 2
            }, 
            'sss': { // milliseconds
                value: 1
            }, 
            'ssss': { // padded milliseconds
                value: 'sss',
                pad: 4
            } 
        };

        
        function _parseFormat(string) {
            // @inspiration AngularJS date filter
            var parts = [];
            var format = string;

            while(format) {
                var match = DURATION_FORMATS_SPLIT.exec(format);

                if (match) {
                    parts = parts.concat(match.slice(1));
                    
                    format = parts.pop();
                } else {
                    parts.push(format);

                    format = null;
                }
            }

            return parts;
        }


        function _formatDuration(timestamp, format) {
            var text = '';
            var values = { };

            format.filter(function(format) { // filter only value parts of format
                return DURATION_FORMATS.hasOwnProperty(format);
            }).map(function(format) { // get formats with values only
                var config = DURATION_FORMATS[format];

                if(config.hasOwnProperty('pad')) {
                    return config.value;
                } else {
                    return format;
                }
            }).filter(function(format, index, arr) { // remove duplicates
                return (arr.indexOf(format) === index);
            }).map(function(format) { // get format configurations with values
                return angular.extend({
                    name: format,
                }, DURATION_FORMATS[format]);
            }).sort(function(a, b) { // sort formats descending by value
                return b.value - a.value;
            }).forEach(function(format) { // create values for format parts
                var value = values[format.name] = Math.floor(timestamp / format.value);

                timestamp = timestamp - (value * format.value);
            });

            format.forEach(function(part) {
                var format = DURATION_FORMATS[part];

                if(format) {
                    var value = values[format.value];

                    text += (format.hasOwnProperty('pad') ? _padNumber(value, Math.max(format.pad, value.toString().length)) : values[part]);
                } else {
                    text += part.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
                }
            });

            return text;
        }


        function _padNumber(number, len) {
            return ((new Array(len + 1)).join('0') + number).slice(-len);
        }


        return function(value, format) {
            if (typeof value !== "number") {
                return value;
            }
            
            var timestamp = parseInt(value.valueOf(), 10);

            if(isNaN(timestamp)) {
                return value;
            } else {
                return _formatDuration(
                        timestamp,
                        _parseFormat(format)
                    );
            }
        };
    });
angular
	.module('angular-duration-format', [
		'angular-duration-format.filter'
	]);