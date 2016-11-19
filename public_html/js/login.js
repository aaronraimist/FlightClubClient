angular.module('FlightClub').controller('LoginCtrl', function ($timeout, $document, $scope, $cookies, $location, $mdDialog) {

    $scope.$parent.toolbarClass = "fullPage fixie";
    $scope.$parent.toolbarTitle = 'Flight Club | Login';

    // hack to fix password label not detecting input on Chrome 
    // https://github.com/angular/material/issues/1376
    $timeout(function () {
        var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
        if (elem.length) {
            elem.parent().addClass('md-input-has-value');
        }
    }, 150);

    $scope.alert = "";
    $scope.loginToggle = function () {
        if (!$scope.$parent.authorised) {
            
            var data = JSON.stringify($scope.form);
            $scope.$parent.httpRequest('/login', 'POST', data, function (data) {
                if (data.Success !== undefined) {
                    var now = new Date();
                    var expiryDate = new Date(now.getTime() + 1000 * parseInt(data.Success.maxAge));

                    $cookies.put('authToken', data.Success.authToken, {'expires': expiryDate});
                    $scope.$parent.token = data.Success.authToken;
                    $scope.$parent.authorised = true;
            
                    $scope.$parent.permissions.length = 0;
                    data.Success.permissions.split(",").forEach(function (el) {
                        $scope.$parent.permissions.push(el.toLowerCase());
                    });
                    
                    $scope.alert = "Successfully logged in!";
            
                } else {
                    $scope.alert = data.error;
                }
                $scope.$apply();
            }, function (data) {
                $scope.alert = data.error;
                $scope.$apply();
            });
    
        } else {
            $cookies.remove('authToken');
            $scope.$parent.authorised = false;
            $scope.$parent.permissions.length = 0;
            $scope.$parent.token = undefined;
        }
    };
    
    $scope.create = function () {
        var data = JSON.stringify($scope.form);
        $scope.$parent.httpRequest('/login', 'PUT', data, function (data) {
            if (data.Success !== undefined) {
                $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('User created successfully!')
                        .textContent('User \"' + $scope.form.Login.new.username + '\" now exists.')
                        .ariaLabel('create success')
                        .ok('Ok!')
                        );
            } else {
                $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Error creating User')
                        .textContent(data)
                        .ariaLabel('create failure')
                        .ok('Ok!')
                        );
            }
        }, function (data) {
            $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Error creating User')
                    .textContent(data)
                    .ariaLabel('create failure')
                    .ok('Ok!')
                    );
        });
    };
});