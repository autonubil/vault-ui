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
