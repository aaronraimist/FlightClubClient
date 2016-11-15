angular.module('FlightClub').controller('LoginCtrl', function ($timeout, $document, $scope, $cookies, $location) {

    $scope.$parent.toolbarClass = "fullPage fixie";
    $scope.$parent.toolbarTitle = 'Login';

    // hack to fix password label not detecting input on Chrome 
    // https://github.com/angular/material/issues/1376
    $timeout(function () {
        var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
        if (elem.length) {
            elem.parent().addClass('md-input-has-value');
        }
    }, 150);

    $scope.loginError = "";
    $scope.login = function () {
        var data = JSON.stringify($scope.form);
        $scope.$parent.httpRequest('/login', 'POST', data, function (data) {
            if (data.Success !== undefined) {
                var now = new Date();
                var expiryDate = new Date(now.getTime() + 1000 * parseInt(data.Success.maxAge));

                $cookies.put('authToken', data.Success.authToken, {'expires': expiryDate});
                $scope.$parent.token = data.Success.authToken;
                $scope.$parent.loginLabel = "Logout";
                $scope.$parent.authorised = true;
                $scope.$parent.$apply(function () {
                    $location.path('/');
                });
            } else {
                $scope.$parent.loginLabel = "Login";
                $scope.loginError = data.error;
                $scope.$apply();
            }
        }, function (data) {
            $scope.$parent.loginLabel = "Login";
            $scope.loginError = data.error;
            $scope.$apply();
        });
    };
});