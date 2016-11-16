angular.module('FlightClub').config(function ($routeProvider, $locationProvider, $mdThemingProvider) {

    $mdThemingProvider.definePalette('primaryPalette', $mdThemingProvider.extendPalette('pink', {
        '500': '181c1f', // grey for navbar
        '600': '424e57' // hover on sites
    }));

    $mdThemingProvider.definePalette('backgroundPalette', $mdThemingProvider.extendPalette('blue', {
        '50': 'fff',
        '200': 'eee', // hover on select option
        '400': 'aaa', // disabled options
        '500': '424e57', // hover on buttons
        '900': '181c1f', // md-raised text color
        'A100': 'fff', // dropdown menu background
        'A200': '000' // dropdown menu text
    }));

    $mdThemingProvider.definePalette('accentPalette', $mdThemingProvider.extendPalette('green', {
        '200': 'ccac55', // gold for selected options (hover)
        '600': 'ccac55', // gold for selected options
        'A200': 'ccac55', // gold for selected tab underline, radio on
        'A700': 'ccac55' // hover on selected grid tile
    }));

    $mdThemingProvider.theme('default')
            .backgroundPalette('backgroundPalette')
            .primaryPalette('primaryPalette')
            .accentPalette('accentPalette');

    $locationProvider.html5Mode(true);
    $routeProvider
            .when("/", {templateUrl: "/pages/home.html", controller: "HomeCtrl"})
            .when("/login/", {templateUrl: "/pages/login.html", controller: "LoginCtrl"})
            .when("/docs/", {controller: function () {
                    window.location.replace('/docs/');
                }, template: "<div></div>"})
            .when("/contact/", {templateUrl: "/pages/contact.html", controller: "ContactCtrl"})
            .when("/donate/", {templateUrl: "/pages/donate.html", controller: "DonateCtrl"})
            .when("/error/", {templateUrl: "/pages/error.html", controller: "ErrorCtrl"})
            .when("/results/", {templateUrl: "/pages/results.html", controller: "ResultsCtrl", reloadOnSearch: false})
            .when("/world/", {templateUrl: "/pages/world.html", controller: "WorldCtrl", reloadOnSearch: false})
            .otherwise({redirectTo: '/'});
});

angular.module('FlightClub').directive('int', function () {
    return {
        require: 'ngModel',
        link: function (scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                return parseInt(viewValue, 10);
            });
        }
    };
});

angular.module('FlightClub').directive('float', function () {
    return {
        require: 'ngModel',
        link: function (scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                return parseFloat(viewValue, 10);
            });
        }
    };
});