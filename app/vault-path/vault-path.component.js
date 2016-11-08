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