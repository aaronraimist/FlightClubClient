/* global angular, Stripe, StripeCheckout */

angular
        .module('FCDonate', ['ngMaterial'])
        .controller('DonateCtrl', function ($scope) {
          
          $scope.processed = false;
          $scope.handler = StripeCheckout.configure({
            key: 'pk_test_AHzw9GreVMENAVkw9J2hhPaJ',
            image: 'images/favicon/android-icon-192x192.png',
            locale: 'auto',
            token: function (token) {
              var data = {
                amount: 100 * parseFloat($scope.amountEuro),
                stripeToken: token.id,
                email: token.email,
                client_ip: token.client_ip
              };
              httpRequest(api_url + '/donate', 'POST', JSON.stringify(data),
                  function (data) {
                    $scope.processed = true;
                    $scope.validate();
                  }, 
                  function (data) {
                    $scope.validate();
                  }
              );
            }
          });
          
          $scope.goHome = function() {
            window.location="/";
          };
          
          $scope.click = function () {
            // Open Checkout with further options
            $scope.valid = false;
            $scope.handler.open({
              name: 'flightclub.io',
              description: 'Donation',
              currency: "eur",
              amount: 100*parseFloat($scope.amountEuro)
            });
          };
          
          $scope.valid = false;
          $scope.validate = function() {
            var input = parseFloat($scope.amountEuro);
            
            if($scope.processed) {
              $scope.error = "You've already donated successfully!";
              $scope.valid = false;
            } else if(isNaN(input)) {
              $scope.error = $scope.amountEuro==="" ? "" : $scope.amountEuro + " is not a valid amount";
              $scope.valid = false;
            } else if(input<1) {
              $scope.error = "Amount must be at least €1!";
              $scope.valid = false;
            } else  {
              $scope.error = "";
              $scope.valid = true;
            }
          };
          
        });

// Close Checkout on page navigation
$(window).on('popstate', function () {
  handler.close();
});