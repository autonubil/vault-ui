angular.module('templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('vault-content/vault-content.template.html','<div ng-if="obj.path">\r\n<h2>{{obj.path}}</h2>\r\n<div ng-jsoneditor ng-model="obj.content" options="options" style="width: 100%; height: 300px;">\r\n\r\n</div>\r\n<botton role="button" class"btn btn-default">Save</botton> <botton  role="button" class"btn btn-primary">Reload</botton>\r\n</div>\r\n<div ng-if="!obj.path">\r\n<h2>Details</h2>\r\n<i>No item selected</i>\r\n</div>\r\n');
$templateCache.put('vault-health/vault-health.template.html','<div ng-if="health.cluster_name">\r\n    <div title="Cluster id: {{health.cluster_id}}">Cluster Name: {{health.cluster_name}}</div>\r\n    <div>\r\n    <span>Version: {{health.version}}</span>\r\n    <span>|</span>\r\n    <span>Server Time UTC: {{health.server_time_utc * 1000 | date:\'yyyy-MM-dd HH:mm:ss Z\'  }}</span>\r\n    </div>\r\n    <div>\r\n    <dispanv>Initialized: {{health.initialized}}</span>\r\n    <span>|</span> \r\n    <dspaniv>Sealed: {{health.sealed}}</span>\r\n    <span>|</span>\r\n    <span>Standby: {{health.standby}}</span>\r\n    <span>|</span>\r\n    <span>Initialized: {{health.initialized}}</span>\r\n    </div>\r\n</div>\r\n<div ng-if="!health.cluster_name">\r\n<i>Please configure Vault Server</i>\r\n</div>');
$templateCache.put('vault-path/vault-path.template.html','<div ng-if="loaded" style="padding-left:20px">\r\n\t<div ng-repeat="subPath in pathes">\r\n\t\t<span role="button" ng-click="togglePath(path + subPath +\'/\')" ng-class="pathStates[path +  subPath+\'/\'] ? \'glyphicon glyphicon-folder-open\' : \'glyphicon glyphicon-folder-close\'"\r\n\t\t\taria-hidden="true"></span>\r\n\t\t<span ng-click="selectPath(path + subPath+\'/\')">&nbsp;{{subPath}}</span>\r\n\t\t<div ng-if="pathStates[path   + subPath+\'/\']">\r\n\t\t\t<vault-path path="path +   subPath+\'/\'" name="subPath" type="type" subtype="subtype"></vault-path>\r\n\t\t</div>\r\n\t</div>\r\n\r\n\t<div ng-repeat="item in items">\r\n\t\t<span role="button" ng-click="selectDetails(path + item)" class="glyphicon glyphicon-list-alt" aria-hidden="true"></span>\t\t&nbsp;\r\n\t\t<span role="button" ng-click="selectDetails(path + item)">{{item}}</span>\r\n\t</div>\r\n\r\n\t<div ng-if="error" class="alert alert-warning" role="alert">\r\n\t\t<i>{{error}}</i>\r\n\t</div>\r\n</div>\r\n\r\n<div ng-if="!loaded" style="padding-left:20px"></div>');
$templateCache.put('vault-token/vault-token.template.html','<div ng-if="tokenInfo.display_name">\r\n    <div>Token: {{tokenInfo.display_name}}</div>\r\n    <div>\r\n    <span>Path: {{tokenInfo.path}}</span>\r\n    </div>\r\n    <div>\r\n    <span>Policies: {{tokenInfo.policies | json}}</span>\r\n    </div>\r\n    \r\n    <!-- {{tokenInfo}} -->\r\n</div>\r\n<div ng-if="!tokenInfo.display_name">\r\n<i>Not Authenticated</i>\r\n</div>');
$templateCache.put('vault-settings/vault-settings.template.html','<div class="row">\r\n\r\n<h1>Settings</h1>\r\n<form name="settingsForm" ng-controller="VaultSettingsController">\r\n\t<div ng-if="token.valid">\r\n\r\n\t</div>\r\n\t<div ng-if="!token.valid">\r\n\t\t<div role="alert">\r\n\t\t\t<span class="error" ng-show="myForm.input.$error.required">\r\n      Required!</span>\r\n\t\t\t<span class="error" ng-show="myForm.input.$error.pattern">\r\n      Single word only!</span>\r\n\t\t</div>\r\n\t\t<label>Server URL:\r\n        <input type="url" name="serverUrl" ng-model="serverUrl" required> \r\n        </label>\r\n\t\t<br/>\r\n\t\t<label>Token: \r\n        <input type="password" name="token" ng-model="token" ng-minlength="36" ng-maxlength="36" required>\r\n        </label>\r\n\t\t<br/><br/>\r\n\t\t<button ng-click="update(serverUrl, token)">Authenticate</button>\r\n\t</div>\r\n</form>\r\n</div>');
$templateCache.put('vault-tree/vault-tree.template.html','<h2>{{type}}</h2>\r\n<div ng-if="type == \'mount\'">\r\n\t<div ng-repeat="mount in mounts track by mount.path">\r\n\t\t<div title="{{mount.type}}{{mount.description ? \' (\'+mount.description + \')\' : \'\'}} | Default TTL {{mount.config.default_lease_ttl == 0 ? \'n/a\' :  mount.config.default_lease_ttl |  duration:\'hh:mm:ss:sss\'}} | Max TTL: {{mount.config.max_lease_ttl == 0 ? \'n/a\' :   mount.config.max_lease_ttl | duration:\'hh:mm:ss:sss\'}}">\r\n\t\t\t<span role="button" ng-click="toggleMount(mount.path)" ng-class="mount.type == \'cubbyhole\'  ? \'glyphicon glyphicon-user\' :  mount.type == \'pki\'  ? \'glyphicon glyphicon-certificate\' : mount.type == \'system\'  ? \'glyphicon glyphicon-cog\' : \'glyphicon glyphicon-lock\'"\r\n\t\t\t\taria-hidden="true"></span>\r\n\t\t\t<span role="button" ng-click="selectMount(mount.path)">&nbsp;{{mount.path}}</span>\r\n\t\t</div>\r\n\t\t<div ng-if="itemExpanded[mount.path]">\r\n\t\t\t<vault-path path="mount.path+\'/\'" name="mount.path" type="type" subtype="mount.type"></vault-path>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n\r\n<div ng-if="type == \'policy\'">\r\n\t<div ng-repeat="policy in policies track by $index">\r\n\r\n\t\t<div>\r\n\t\t\t<span role="button" ng-click="selectPolicy(policy)" class="glyphicon glyphicon-cog"\r\n\t\t\t\taria-hidden="true"></span>\r\n\t\t\t<span role="button" ng-click="selectPolicy(policy)">&nbsp;{{policy}}</span>\r\n\t\t</div>\r\n\t\t<div ng-if="policyExpanded[policy]">\r\n\t\t\t<vault-path path="policy+\'/\'" name="policy" type="type"  ></vault-path>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n\r\n\r\n<div ng-if="type == \'auth\'">\r\n\t<div ng-repeat="(authMethod, authInfo) in authMethods">\r\n\t\t<div title="{{authInfo.type}}{{authInfo.config.description ?\' (\'+authInfo.config.description+ \')\' : \'\'}} | Default TTL {{authInfo.config.default_lease_ttl == 0 ? \'n/a\' :  authInfo.config.default_lease_ttl |  duration:\'hh:mm:ss:sss\'}} | Max TTL: {{authInfo.config.max_lease_ttl == 0 ? \'n/a\' :   authInfo.config.max_lease_ttl | duration:\'hh:mm:ss:sss\'}}">\r\n\t\t\t<span role="button" ng-click="toggleAuthMethod(\'auth/\'+authMethod)" ng-class="auth.type == \'cubbyhole\'  ? \'glyphicon glyphicon-user\' :  auth.type == \'pki\'  ? \'glyphicon glyphicon-certificate\' : auth.type == \'system\'  ? \'glyphicon glyphicon-cog\' : \'glyphicon glyphicon-lock\'"\r\n\t\t\t\taria-hidden="true"></span>\r\n\t\t\t<span role="button" ng-click="toggleAuthMethod(\'auth/\'+authMethod)">&nbsp;{{authMethod.substring(0,authMethod.length-1)}}</span>\r\n\t\t</div>\r\n\t\t<div ng-if="authExpanded[\'auth/\'+authMethod]">\r\n\t\t\t<vault-path path="\'auth/\'+authMethod" name="authMethod.substring(0,authMethod.length-1)" type="type" subtype="authInfo.type" ></vault-path>\r\n\t\t</div>\r\n\t</div>\r\n</div>');
$templateCache.put('common/templates/about.html','<div class="row">\r\n\r\n<h1>Vault UI</h1>\r\n&copy; 2016 by autonubil System GmbH\r\n</div>');
$templateCache.put('common/templates/contact.html','<div class="row">\r\n\r\n<h1>Contact</h1>\r\n\r\n<p>autonubil System GmbH<br>\r\nBramfelder Strasse 119a<br>\r\n22305&nbsp;Hamburg,&nbsp;Germany</p>\r\n<p>HRB 137825 \u2013&nbsp;St Nr&nbsp;41/762/03612 \u2013 UST ID DE302215451</p>\r\n<p>Managing Director: Hendrik Knopp &amp; Andreas O. Loff<br>\r\nMailto: info(at)autonubil.com</p>\r\n<p>Autonubil ist eine eingetragene Marke der autonubil System GmbH</p>\r\n</div>\r\n</div>');
$templateCache.put('common/templates/navbar.html','<nav class="navbar navbar-inverse navbar-fixed-top">\r\n\t<div class="container">\r\n\t\t<div class="navbar-header">\r\n\t\t\t<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false"\r\n\t\t\t\taria-controls="navbar">\r\n            <span class="sr-only">Toggle navigation</span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n          </button>\r\n\t\t\t<a class="navbar-brand" href="#">Vault UI</a>\r\n\t\t</div>\r\n\t\t<div id="navbar" class="collapse navbar-collapse">\r\n\t\t\t<ul class="nav navbar-nav">\r\n\t\t\t\t<li class="active"><a href="#/vault/mounts">Explorer</a></li>\r\n\t\t\t\t<li><a href="#_settings">Settings</a></li>\r\n\t\t\t\t<li><a href="#_about">About</a></li>\r\n\t\t\t\t<li><a href="#_contact">Contact</a></li>\r\n\t\t\t</ul>\r\n\t\t</div>\r\n\t\t<!--/.nav-collapse -->\r\n\t</div>\r\n</nav>');
$templateCache.put('common/templates/structure.html','<div class="row">\r\n<h1>Structure</h1>\r\n</div>\r\n<div class="row">\r\n    <div class="col-md-4">\r\n        <vault-tree type="\'mount\'"></vault-tree>\r\n        <vault-tree type="\'policy\'"></vault-tree>\r\n        <vault-tree type="\'auth\'"></vault-tree>\r\n    </div>\r\n\r\n    <div class="col-md-8">\r\n        <vault-content></vault-content>\r\n    </div>\r\n</div>');
$templateCache.put('common/templates/test.html','<div>test</div>');
$templateCache.put('common/templates/welcome_page.html','<div class="row">\r\n<h1>Welcome to the Vault UI</h1>\r\n</div>');}]);