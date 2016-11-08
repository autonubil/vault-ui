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
            return {
                
                policies : function() {return [].concat (this.privatePolicies);},
                mounts : function() {return [].concat (this.privateMounts);},
                currentItem : function() {  return angular.copy(this.privateCurrentItem); },
                tokenInfo : function() {  return angular.copy(this.privateTokenInfo); },
                serverInfo : function() { return angular.copy(this.privateServerInfo); },
                token: function () { return localStorageService.get('token'); },
                authMethods: function () {return angular.copy(this.privateAuthMethods); }, 

                api: Restangular.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.setBaseUrl('http://192.168.23.151:9200');
                    RestangularConfigurer.setDefaultHeaders(function () {
                        return { 'X-Vault-Token': this.token() };
                    });
                }),
                getHealth: function () {
                    return this.api.all('v1/sys').one('health').get();
                },
                validateToken: function () {
                    this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/auth/token').one('lookup-self').get();
                },
                listMounts: function () {
                    this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/sys').one('mounts').get();
                },
                listAuthMethods: function () {
                  //  this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/sys').one('auth').get();
                },
                listPolicies: function () {
                    this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/sys').one('policy').get();
                },
                readPath: function (path) {
                    this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/'+ this.firstPathSegments(path)).one(this.lastPathSegment(path) ).get();
                },
                listPath: function (path) {
                      if (path == null)
                        return null;
                    this.api.setDefaultHeaders({ 'X-Vault-Token': this.token() });
                    return this.api.all('v1/'+this.firstPathSegments(path)).one(this.lastPathSegment(path)+"?list=true" ).get();
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
                        self.api.setDefaultHeaders({ 'X-Vault-Token': self.token() });
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
        }];
    });