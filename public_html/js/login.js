/* global angular */

angular
        .module('FCLogin', ['ngMaterial', 'ngCookies'])
        .controller('LoginCtrl', function ($timeout, $document, $scope, $cookies) {
          
          // hack to fix password label not detecting input on Chrome 
          // https://github.com/angular/material/issues/1376
          $timeout(function () {
            var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
            if (elem.length) {
              elem.parent().addClass('md-input-has-value');
            }
          }, 150);            
          
          $scope.goHome = function() {
            window.location = "/";
          };
          
          $scope.loginError = "";
          $scope.login=function() {
            var data = JSON.stringify($scope.form);
            httpRequest(api_url + '/login', 'POST', data, loginSuccess($scope, $cookies), updateError($scope));
          };
        });
        
var loginSuccess = function (scope, cookies) {
  return function (data)
  {
    if (data.Success !== undefined) {
      var now = new Date();
      var expiryDate = new Date(now.getTime() + 1000 * parseInt(data.Success.maxAge));

      var res = jQuery.parseJSON(JSON.stringify(data, null, 2));
      cookies.put('authToken', res.Success.authToken, {'expires': expiryDate});
      scope.goHome();
    }
    else {
      scope.loginError = data.error;
      scope.$apply();
    }
  };
};

var updateError = function (scope) {
  return function (data) {
    scope.loginError = data.error;
    scope.$apply();
  };
};
