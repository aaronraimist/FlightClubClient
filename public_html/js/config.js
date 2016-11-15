angular.module('FlightClub').config(function ($routeProvider, $locationProvider, $mdThemingProvider) {

    $mdThemingProvider.definePalette('primaryPalette', $mdThemingProvider.extendPalette('pink', {
        '50': '424e57', // md-button, radio off
        '200': 'ccac55', // gold for selected options (hover)
        '500': '181c1f', // grey for navbar, selected grid tile (md-primary), radio off background
        '600': 'ccac55', // gold for selected options
        '900': 'fff', // add/remove text
        'A100': 'fff', // white for tab background
        'A700': 'ff0000' // warn messages
    }));

    $mdThemingProvider.definePalette('accentPalette', $mdThemingProvider.extendPalette('pink', {
        'A200': 'ccac55' // gold for selected tab underline, radio on
    }));

    $mdThemingProvider.theme('default')
            .primaryPalette('primaryPalette')
            .backgroundPalette('primaryPalette')
            .accentPalette('accentPalette')
            .warnPalette('primaryPalette');

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