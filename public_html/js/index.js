angular.module('FlightClub').controller('IndexCtrl', function ($scope, $mdSidenav, $cookies, $location, $window) {

    var base = 'http://localhost', port = ':8080';
    //var base = '//'+$location.host(), port = ':8443';
    $scope.toolbarClass = "";
    $scope.client = base;
    $scope.server = base + port + '/FlightClub';
    var api_url = $scope.server + '/api/v1';

    $scope.httpRequest = function (dest, method, data, successfn, errorfn) {
        $.ajax({type: method, url: api_url + dest, contentType: 'application/json', data: data,
            dataType: "json", xhrFields: {withCredentials: false}, headers: {},
            success: successfn, error: errorfn
        });
    };

    $scope.parseQueryString = function (queryString)
    {
        var pairs = queryString.split("&");
        var paramMap = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            paramMap[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return paramMap;
    };

    $scope.token = $cookies.get('authToken');
    $scope.authorised = false;

    $scope.redirect = function (path) {
        $location.url(path);
    };

    $scope.redirectExternal = function (path) {
        $window.location.href = path;
    };

    $scope.toggleNav = function (id) {
        $mdSidenav(id).toggle();
    };

    $scope.toggleLogin = function () {
        if (!$scope.authorised) {
            $location.path('/login');
        } else {
            $cookies.remove('authToken');
            $scope.loginLabel = "Login";
            $scope.authorised = false;
            $scope.token = undefined;
        }
    };

    if ($scope.token !== undefined) {
        var data = JSON.stringify({auth: {token: $scope.token}});
        $scope.httpRequest('/auth/', 'POST', data, function (data) {
            $scope.authorised = data.auth;
            if (!$scope.authorised) {
                $cookies.remove('authToken');
                $scope.loginLabel = "Login";
            } else {
                $scope.loginLabel = "Logout";
            }
            $scope.$apply();
        });
    } else {
        $scope.loginLabel = "Login";
    }
});