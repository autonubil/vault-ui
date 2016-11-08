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
