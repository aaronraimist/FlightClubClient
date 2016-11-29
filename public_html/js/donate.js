/* global StripeCheckout */

angular.module('FlightClub').controller('DonateCtrl', function ($scope) {

    $scope.$emit('viewBroadcast', 'donate');

    $scope.$parent.toolbarTitle = 'Flight Club | Donate';
    $scope.processed = false;
    $scope.success = false;
    $scope.isLoading = false;

    $scope.click = function () {
        // Open Checkout with further options
        $scope.valid = false;
        $scope.handler.open({
            name: 'flightclub.io',
            description: 'Donation',
            currency: "eur",
            amount: 100 * parseFloat($scope.amountEuro)
        });
    };

    $scope.valid = false;
    $scope.validate = function () {
        var input = parseFloat($scope.amountEuro);

        if ($scope.processed) {
            $scope.error = "You've already donated successfully!";
            $scope.valid = false;
        } else if (isNaN(input)) {
            $scope.error = $scope.amountEuro === "" ? "" : $scope.amountEuro + " is not a valid amount";
            $scope.valid = false;
        } else if (input < 1) {
            $scope.error = "Amount must be at least €1!";
            $scope.valid = false;
        } else {
            $scope.error = "";
            $scope.valid = true;
        }
    };

    angular.element(document).ready(function () {
        $.getScript("//checkout.stripe.com/checkout.js", function ()
        {
            $scope.handler = StripeCheckout.configure({
                key: 'pk_live_s4EXO3kyuZktYh40Mbed0IFi',
                image: 'images/favicon/android-icon-192x192.png',
                locale: 'auto',
                token: function (token) {
                    $scope.isLoading = true;
                    $scope.$apply();
                    var data = {
                        amount: 100 * parseFloat($scope.amountEuro),
                        stripeToken: token.id,
                        email: token.email,
                        client_ip: token.client_ip
                    };
                    $scope.processed = true;
                    $scope.$parent.httpRequest('/donate', 'POST', JSON.stringify(data),
                            function (res) {
                                $scope.isLoading = false;
                                if (res.error === undefined) {
                                    $scope.success = true;
                                } else {
                                    $scope.error = "Oops! There was an error of some sort. Your card has not been charged.";
                                    $scope.errorDetail = res.error;
                                }
                                $scope.$apply();
                            },
                            function (res) {
                                $scope.isLoading = false;
                                $scope.error = "Oops! Looks like FlightClub isn't responding. You will not be charged.";
                                $scope.errorDetail = res.error;
                                $scope.$apply();
                            }
                    );
                }
            });
        });
    });

});