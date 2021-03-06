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
                        if (setToken) {
                            RestangularConfigurer.setDefaultHeaders({ 'X-Vault-Token': vaultApi.token() });
                        }
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
                    return this.api(true).all('v1/sys').one('auth').get();
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
                                content: val ? val.hasOwnProperty('data') ?   val.data : val : null
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
                            self.privateTokenInfo =  val.hasOwnProperty('data') ?   val.data : val;
                            $rootScope.$broadcast("vaultApi.refresh.tokenInfo");
                            self.listMounts().then(function (val) {
                                val = val.hasOwnProperty('data') ?   val.data : val;
                                self.privateMounts = [];
                                angular.forEach(val, function(mountInfo, mountPoint) {
                                    if (val.hasOwnProperty(mountPoint) && mountPoint[mountPoint.length-1] == '/' ) {
                                    var sanitizedPath = self.sanitizePath(mountPoint);
                                        if (sanitizedPath != 'sys' && sanitizedPath != null) { 
                                            mountInfo['path'] = sanitizedPath;
                                            self.privateMounts.push(mountInfo);
                                        }
                                    }
                                });
                                $rootScope.$broadcast("vaultApi.refresh.mounts");

                                self.listAuthMethods().then(function (val) {
                                    self.privateAuthMethods = {};
                                    var data = val.hasOwnProperty('data') ?   val.data : val;
                                    angular.forEach(data, function(value, key) {
                                        if (data.hasOwnProperty(key) && value && value.hasOwnProperty('type')) {
                                            self.privateAuthMethods[key] = value;
                                        }
                                    });
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