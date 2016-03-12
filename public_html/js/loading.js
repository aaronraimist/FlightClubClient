/* global angular */

angular
        .module('FCLoad', ['ngMaterial', 'ngCookies'])
        .controller('LoadCtrl', function ($scope) {

          var formHash = window.location.hash.substring(1);
          var formData = window.atob(formHash);
  
          httpRequest(api_url + '/simulator/new', 'POST', formData, completeSim, errorSim);
          animate_rocket(30);
        });

function completeSim(data)
{ 
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  if (obj.Mission.success === true) {
    var queryString = obj.Mission.output.split('?')[1];
    window.location = client + '/results.php?' + queryString;
  } else {
    var errors = obj.Mission.errors;
    var errorsHash = window.btoa(errors);

    window.location = client + '/error.php#' + errorsHash;
  }

}

function errorSim(data)
{
  var errors, errorsHash = '';
  if (data.responseJSON !== undefined) {
    errors = data.responseJSON.Mission.errors;
    errorsHash = window.btoa(errors);
  }

  window.location = client + '/error.php#' + errorsHash;
}

function animate_rocket(w) {

  var windowWidth = $(document).width();
  if (w <= 99.5) {
    $("#rocket").animate(
        {marginLeft: 0.01 * w * windowWidth + 'px'},
        1500,
        "linear", 
        function () {
          animate_rocket(50 + 0.5 * w);
        }
    );
  }
}