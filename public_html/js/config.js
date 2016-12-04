angular.module('FlightClub').config(function ($routeProvider, $locationProvider, $mdThemingProvider) {

    $mdThemingProvider.definePalette('primaryPalette', $mdThemingProvider.extendPalette('pink', {
        '500': '181c1f', // grey for navbar
        '600': '424e57' // hover on sites
    }));

    $mdThemingProvider.definePalette('accentPalette', $mdThemingProvider.extendPalette('green', {
        '500': 'ccac55', // accents in dark()
        '200': 'ccac55', // gold for selected options (hover)
        '600': 'ccac55', // gold for selected options
        'A200': 'ccac55', // gold for selected tab underline, radio on
        'A700': 'ccac55' // hover on selected grid tile
    }));
    
    $mdThemingProvider.theme('fc_default')
            .backgroundPalette('grey')
            .primaryPalette('primaryPalette')
            .accentPalette('accentPalette')
    ;
    
    $mdThemingProvider.theme('fc_dark')
            .primaryPalette('primaryPalette')
            .accentPalette('accentPalette')
            .dark()
    ;
    
    $mdThemingProvider.alwaysWatchTheme(true);

    $locationProvider.html5Mode(true);
    $routeProvider
            .when("/share/", {templateUrl: "/pages/home.html", controller: "HomeCtrl", reloadOnSearch: false})
            .when("/account/", {templateUrl: "/pages/account.html", controller: "AccountCtrl"})
            .when("/docs/", {controller: function () {
                    window.location.replace('/docs/');
                }, template: "<div></div>"})
            .when("/contact/", {templateUrl: "/pages/contact.html", controller: "ContactCtrl"})
            .when("/donate/", {templateUrl: "/pages/donate.html", controller: "DonateCtrl"})
            .when("/error/", {templateUrl: "/pages/error.html", controller: "ErrorCtrl"})
            .when("/results/", {templateUrl: "/pages/results.html", controller: "ResultsCtrl", reloadOnSearch: false})
            .when("/media/", {templateUrl: "/pages/media.html", controller: "MediaCtrl"})
            .when("/world/", {templateUrl: "/pages/world.html", controller: "WorldCtrl", reloadOnSearch: false})
            .otherwise({redirectTo: '/share'});
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