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
          
          $scope.login=function() {
            var data = JSON.stringify($scope.form);
            httpRequest(api_url + '/login', 'POST', data, loginSuccess($cookies), updateError);
          };
        });
        
var loginSuccess = function (cookies) {
  return function (data)
  {
    var now = new Date();
    var expiryDate = new Date(now.getTime()+1000*parseInt(data.Success.maxAge));
    
    var res = jQuery.parseJSON(JSON.stringify(data, null, 2));
    cookies.put('authToken', res.Success.authToken, {'expires':expiryDate});
    window.location = "/";
  };
};

var updateError = function(data) {
  window.location = '/error.php';    
};
