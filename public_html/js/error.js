angular.module('FlightClub').controller('ErrorCtrl', function ($http, $scope) {

    $scope.$emit('viewBroadcast', 'error');

    $scope.$parent.toolbarTitle = 'Flight Club | Error';
    $scope.mailSuccess = $scope.mailError = $scope.formDisabled = false;

    var hash = window.location.hash.substring(1);
    $scope.data = JSON.parse(window.atob(hash));

    $scope.reportError = function () {

        $scope.formDisabled = true;
        $http({url: '/report.php', data: $.param($scope.data), method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).then(function () {
            $scope.mailSuccess = true;
        }, function () {
            $scope.mailError = true;
        });
    };

});