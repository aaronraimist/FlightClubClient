var base = 'http://www.flightclub.io';
var client = base;
var server = base + ':8080/FlightClub';
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

