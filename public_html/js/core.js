//var base = 'http://localhost', port=':8080';
var base = '//www.flightclub.io', port = ':8443';
var client = base;
var server = base + port + '/FlightClub';
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

