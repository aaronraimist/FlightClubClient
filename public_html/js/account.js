angular.module('FlightClub').controller('AccountCtrl', function ($timeout, $document, $scope, $cookies) {

    $scope.$emit('viewBroadcast', 'login');
    $scope.$parent.toolbarTitle = 'Flight Club | Account';

    $scope.forms = [];
    // hack to fix password label not detecting input on Chrome 
    // https://github.com/angular/material/issues/1376
    $timeout(function () {
        var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
        if (elem.length) {
            elem.parent().addClass('md-input-has-value');
        }
    }, 150);
    
    $scope.httpRequest('/user/permissions', 'GET', null, function (data) {
        var list = data.data;
        $scope.permissions = {};
        for (var i = list.length; i > 0; i--) {
            $scope.permissions[list[i - 1].code] = {code: list[i - 1].code, name: list[i - 1].name};
        }
    }, function(data, statusText) {
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.alerts[2] += 'Permissions: ' + statusText + '\n';
    });
    
    $scope.capitalise = function(string) {
        return string === undefined ? undefined : string.charAt(0).toUpperCase() + string.slice(1);
    };

    $scope.alerts = [];
    $scope.loginToggle = function () {
        if (!$scope.$parent.authorised) {
            
            var data = JSON.stringify($scope.forms[0]);
            $scope.$parent.httpRequest('/user/login', 'POST', data, function (data) {
                if (data.Success) {
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
                $scope.forms[0] = {};
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
    
    $scope.updatePassword = function () {
        $scope.forms[1].auth = {token: $scope.$parent.token};
        var data = JSON.stringify($scope.forms[1]);
        $scope.forms[1].auth = {token: ''};
        $scope.$parent.httpRequest('/user/updatePass', 'POST', data, function (data) {
            if (data.Success) {
                $scope.alerts[1] = 'Password updated successfully!';
            } else {
                $scope.alerts[1] = data.error;
            }
            $scope.forms[1] = {};
            $scope.$apply();
        }, function (data) {
            $scope.alerts[1] = 'Error sending request\n'+data.error;
            $scope.$apply();
        });
    };
    
    $scope.create = function () {
        $scope.forms[2].auth = {token: $scope.$parent.token};
        var data = JSON.stringify($scope.forms[2]);
        $scope.forms[2].auth = {token: ''};
        $scope.$parent.httpRequest('/user/new', 'POST', data, function (data) {
            if (data.Success) {
                $scope.alerts[2] = 'User \"' + $scope.forms[2].Create.new.username + '\" created successfully!';
            } else {
                $scope.alerts[2] = data.error;
            }
            $scope.forms[2] = {};
            $scope.$apply();
        }, function (data) {
            $scope.alerts[2] = 'Error sending request\n'+data.error;
            $scope.$apply();
        });
    };
});