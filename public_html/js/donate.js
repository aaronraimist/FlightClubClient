/* global angular, Stripe, StripeCheckout */

angular
        .module('FCDonate', ['ngMaterial'])
        .controller('DonateCtrl', function ($scope) {
          
          $scope.handler = StripeCheckout.configure({
            key: 'pk_test_AHzw9GreVMENAVkw9J2hhPaJ',
            image: 'images/favicon/android-icon-192x192.png',
            locale: 'auto',
            token: function (token) {
              var data = {
                amount: 100*parseFloat($scope.amountEuro),
                stripeToken: token.id,
                email: token.email,
                client_ip: token.client_ip
              };
            httpRequest(api_url + '/donate', 'POST', JSON.stringify(data), function(data) {
              var x = 5;
            }, function(data) {
              var x = 5;
            });
              // Use the token to create the charge with a server-side script.
              // You can access the token ID with `token.id`
            }
          });
          
          $scope.click = function () {
            // Open Checkout with further options
            $scope.handler.open({
              name: 'flightclub.io',
              description: '2 widgets',
              currency: "eur",
              amount: 100*parseFloat($scope.amountEuro)
            });
          };
          
        });

// Close Checkout on page navigation
$(window).on('popstate', function () {
  handler.close();
});