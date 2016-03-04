var client = 'http://www.flightclub.io';
//var client = 'http://localhost';
var server = client + ':8080/FlightClub';
var api_url = server + '/api/v1';

function httpRequest(dest, method, data, successfn, errorfn) 
{  
  $.ajax({
      type: method,
      url: dest,
      contentType: 'application/json',
      data: data,
      dataType: "json",
      xhrFields: {
        withCredentials: false
      },
      headers: {
      },
      success: successfn,
      error: errorfn
    });
}

function completeSim(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  if(obj.Mission.success === true) {
    var queryString = obj.Mission.output.split('?')[1];
    window.location = client+'/results.php?' + queryString;
  } else {
    var errors = obj.Mission.errors;
    var errorsHash = window.btoa(errors);

    window.location = client + '/error.php#' + errorsHash;
  }
  
}

function errorSim(data)
{
  var errors, errorsHash='';
  if(data.responseJSON!==undefined) {
    errors = data.responseJSON.Mission.errors;
    errorsHash = window.btoa(errors);
  }
  
  window.location = client+'/error.php#'+errorsHash;
}