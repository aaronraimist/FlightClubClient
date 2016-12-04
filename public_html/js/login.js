angular.module('FlightClub').controller('LoginCtrl', function ($timeout, $document, $scope, $cookies, $mdDialog) {

    $scope.$emit('viewBroadcast', 'login');

    $scope.$parent.toolbarTitle = 'Flight Club | Login';

    // hack to fix password label not detecting input on Chrome 
    // https://github.com/angular/material/issues/1376
    $timeout(function () {
        var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
        if (elem.length) {
            elem.parent().addClass('md-input-has-value');
        }
    }, 150);
    
    $scope.httpRequest('/user/permissions', 'GET', null, function (data) {
        $scope.permissions = fill(data);
    }, function(data, statusText) {
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.alerts[2] += 'Permissions: ' + statusText + '\n';
    });

    var fill = function (data) {
        var list = data.data;
        var array = {};
        for (var i = list.length; i > 0; i--) {
            array[list[i - 1].code] = {code: list[i - 1].code, name: list[i - 1].name};
        }
        return array;
    };

    $scope.alerts = [];
    $scope.loginToggle = function () {
        if (!$scope.$parent.authorised) {
            
            var data = JSON.stringify($scope.form);
            $scope.$parent.httpRequest('/user/login', 'POST', data, function (data) {
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
                    
                    $scope.alerts[0] = "Successfully logged in!";
            
                } else {
                    $scope.alerts[0] = data.error;
                }
                $scope.$apply();
            }, function (data) {
                $scope.alerts[0] = data.error;
                $scope.$apply();
            });
    
        } else {
            $cookies.remove('authToken');
            $scope.$parent.authorised = false;
            $scope.$parent.permissions.length = 0;
            $scope.$parent.token = undefined;
            $scope.alerts[0] = "Successfully logged out!";
        }
    };
    
    $scope.create = function () {
        $scope.form.auth = {token: $scope.$parent.token};
        var data = JSON.stringify($scope.form);
        $scope.form.auth = {token: ''};
        $scope.$parent.httpRequest('/user/new', 'POSTT', data, function (data) {
            if (data.Success !== undefined) {
                $scope.alerts[1] = 'User \"' + $scope.form.Login.new.username + '\" created successfully!';
            } else {
                $scope.alerts[1] = 'Internal error creating User\n'+data;
            }
        }, function (data) {
            $scope.alerts[1] = 'Error sending request\n'+data;
        });
    };
    
    $scope.updatePassword = function () {
        $scope.form.auth = {token: $scope.$parent.token};
        var data = JSON.stringify($scope.form);
        $scope.form.auth = {token: ''};
        $scope.$parent.httpRequest('/user/updatePass', 'POST', data, function (data) {
            if (data.Success !== undefined) {
                $scope.alerts[1] = 'User \"' + $scope.form.Login.new.username + '\" created successfully!';
            } else {
                $scope.alerts[1] = 'Internal error creating User\n'+data;
            }
        }, function (data) {
            $scope.alerts[1] = 'Error sending request\n'+data;
        });
    };
});