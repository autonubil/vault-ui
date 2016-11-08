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