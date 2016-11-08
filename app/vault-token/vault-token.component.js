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