angular.module('FlightClub').controller('IndexCtrl', function ($scope, $mdSidenav, $cookies, $location, $window, $interval) {

    var base, port;
    if($location.host() === 'localhost') {
        base= 'http://localhost';
        port = ':8080';
    } else {
        base = '//'+$location.host();
        port = ':8443';
    }
    $scope.toolbarClass = "";
    $scope.client = base;
    $scope.server = base + port + '/FlightClub';
    var api_url = $scope.server + '/api/v1';

    $scope.token = $cookies.get('authToken');
    $scope.authorised = false;
    $scope.permissions = [];
    $scope.canCreateUser = false;

    $scope.httpRequest = function (dest, method, data, successfn, errorfn) {
        $.ajax({type: method, url: api_url + dest, contentType: 'application/json', data: data,
            dataType: "json", xhrFields: {withCredentials: false}, headers: {},
            success: successfn, error: errorfn
        });
    };

    if ($scope.token !== undefined) {
        var data = JSON.stringify({auth: {token: $scope.token}});
        $scope.httpRequest('/auth/', 'POST', data, function (data) {
            $scope.authorised = data.auth;
            
            data.permissions.split(",").forEach(function(el) {
                $scope.permissions.push(el.toLowerCase());
            });
            $scope.canCreateUser = $scope.hasPermission('createUser');
            
            if (!$scope.authorised) {
                $cookies.remove('authToken');
            }
            $scope.$apply();
        });
    }
    
    $interval(function() {
        if ($scope.theme)
            $interval.cancel(this);
        else {
            $scope.theme = $cookies.get('fc_theme');
            if($scope.theme === undefined)
                $scope.theme = 'fc_default';
        }
    }, 100);        

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

    $scope.redirect = function (path) {
        $location.url(path);
    };

    $scope.redirectExternal = function (path) {
        $window.location.href = path;
    };

    $scope.toggleNav = function (id) {
        $mdSidenav(id).toggle();
    };

    $scope.open = function (id) {
        $mdSidenav(id).open();
    };

    $scope.close = function (id) {
        $mdSidenav(id).close();
    };
    
    $scope.hasPermission = function(toCheck) {
        var ret = false;
        toCheck = toCheck.toLowerCase();
        $scope.permissions.forEach(function(p) {
            if(p === "all" || p === toCheck)
                ret = true;
        });
        return ret;
    };
    
    $scope.toggleTheme = function() {
        $scope.theme = $scope.theme === 'fc_dark' ? 'fc_default' : 'fc_dark';
        $cookies.put('fc_theme', $scope.theme);
    };
    
    $scope.supports_html5_storage = function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    };
});