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