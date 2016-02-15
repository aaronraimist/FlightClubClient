/* 
 This file is part of FlightClub.
 
 Copyright © 2014-2015 Declan Murphy
 
 FlightClub is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 FlightClub is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with FlightClub.  If not, see <http://www.gnu.org/licenses/>.
 */

//var client = 'http://www.flightclub.io';
var client = 'http://localhost';
var server = client + ':8080/FlightClub';
var api_url = server + '/api/v1';

var mobile_query = window.matchMedia( "(max-width: 767px)" );
var large_query = window.matchMedia( "(min-width: 768px)" );

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
  
// off canvas menu for mobile. button not visible on desktop
$(document).on('click', '[data-toggle="offcanvas"]', function () {
  $('.row-offcanvas').toggleClass('active');
});

// only show one item at a time in burn and course correction lists
$(document).on('click', '.slideList>li', function (e) {

  if ($(e.target).is('.slideItem *'))
    return;

  $(this).siblings().removeClass('active');
  $(this).addClass('active');

  var list = $(this).children('ul').first();
  if (list.is(':visible')) {
    $(this).removeClass('active');
  }
  list.slideToggle();

  $(this).siblings().children('ul').slideUp(); // Hide all li siblings child ul's
});

function parseQueryString(queryString) 
{
  var pairs = queryString.split("&");
  var paramMap = {};
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    paramMap[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return paramMap;
}

/////////////////////////////////////////////////
//                                             //
//    Functions to deal with AJAX responses    //
//                                             //
/////////////////////////////////////////////////

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

function updateSuccess() 
{
  window.location = client;
}

function updateError() 
{
  window.location = client+'/error.php';
}

function goHome(data)
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  $.cookie("authToken", obj.Success.authToken, { expires : obj.Success.maxAge });
  
  updateSuccess();
}

function setOverrideSuccess(data)
{
  $("#overrideStatus").removeClass();
  $("#overrideStatus").addClass("fa fa-check");
}

function setOverrideFailure(data)
{
  $("#overrideStatus").removeClass();
  $("#overrideStatus").addClass("fa fa-close");  
}

function fillOutputArray(data)
{
  var missionName = data.Mission.desc;
  var title = 'Simulation Results';
  if(missionName !== undefined)
    title = missionName + ' Results';
  $("#missionTag").append(title);
  document.title = title;
  
  var fileMap = new Object();
  var files = data.Mission.Output.Files;
  $.each(files, function(key,val)
  {
    fileMap[val.desc] = val.url;
  });
  
  var warningsFile = fileMap['warnings'];
  $.get(warningsFile, function (txt) {
    var warnings = txt.split(";");

    content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
    for (var i = 0; i < warnings.length; i++) {
      content += '<li><div class="row nopadding text_normal"><div class="col-xs-12">' + warnings[i] + '</div></li>';
    }
    content += '</ul>';

    $('.warnings').append(content);
    $('.warnings .slideTag').append(' ('+(warnings.length-1)+')');
  });
  
  var telemetryFile = fileMap['telemetry'];
  $.get(telemetryFile, function (txt) {

    var stage = 0;
    var lines = txt.split("\n");
    for (var i = 0; i < lines.length; i++)
    {
      // time-event map
      if (i === 0) {
        content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
        var event = lines[i].split(';');
        for (var j = 0; j < event.length; j++) {
          var pair = event[j].split(':');
          if (pair[0] !== undefined && pair[1] !== undefined) {
            content += '<li><div class="row nopadding text_normal"><div class="col-xs-4 col-sm-3 textright">' + pair[0] + '</div><div class="col-xs-8 col-xs-9 textleft">' + pair[1] + '</div></div></li>';
          }
        }
        content += '</ul>';
        $('.events').append(content);
      } else {
        // landing info
        var map = lines[i].split(':');
        var infoMap = map[1].split(';');
        if (map[0] === 'Landing') {
          stage++;
          content = stage===1 ? '' : '<hr>';
          for (var j = 0; j < infoMap.length; j++) {
            var pair = infoMap[j].split('=');
            if (pair[0] !== undefined && pair[1] !== undefined) {
              content += '<li><div class="row nopadding text_normal"><div class="col-xs-6 textright">' + pair[0] + '</div><div class="col-xs-6 textleft">' + pair[1] + '</div></div></li>';
            }
          }
          $('.landing ul').append(content);
        }
        // orbit info
        else if (map[0] === 'Orbit') {
          content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
          for (var j = 0; j < infoMap.length; j++) {
            var pair = infoMap[j].split('=');
            if (pair[0] !== undefined && pair[1] !== undefined) {
              content += '<li><div class="row nopadding text_normal"><div class="col-xs-6 textright">' + pair[0] + '</div><div class="col-xs-6 textleft">' + pair[1] + '</div></div></li>';
            }
          }
          content += '</ul>';
          $('.orbit').append(content);
          
        }
      }
    }
  });
  
}

function fillProfile(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  
  var mission = obj.Mission;
  $("input[name='Mission.code']").val(mission.code);
  $("input[name='Mission.date']").val(mission.date);
  $("input[name='Mission.time']").val(mission.time);
  $("select[name='Mission.launchvehicle']").val(mission.launchvehicle);
  $("select[name='Mission.launchsite']").val(mission.launchsite);
  $("select[name='Mission.display']").val(mission.display+'');
  $("select[name='Mission.Profile.Payload.code']").val(mission.Profile.Payload.code+'');

  var item = $('#sites li[id="'+mission.launchsite+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
  item = $('#vehicles li[id="'+mission.launchvehicle+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
  item = $('#payloads li[id="'+mission.Profile.Payload.code+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");

  var notSatellite = mission.Profile.Payload.code !== 'SATL';
  
  var profile = mission.Profile;
  
  // Add Core tab before stages
  $("#tabs ul.nav li[id^='tab']").remove();
  $("#tab-content").children("[id^='stage']").remove();
  
  $("#tabs ul.nav li[id='info']").before('<li id="tab-0" class="active"><a href="#core" role="tab" data-toggle="tab">Pad+LV</a></li>');

  var stages = profile.Stages;
  $.each(stages, function(key,val)
  {
    // Just make sure key has the right value
    key = val.Core.id;
    
    // Tab for this stage
    var numStages = numStagesPerVehicle(mission.launchvehicle);
    var name = getStageName(key+1, numStages);
            
    $("#tabs ul.nav li[id='info']").before('<li id="tab-'+(key+1)+'"><a href="#stage-'+key+'" role="tab" data-toggle="tab">'+name+'</a></li>');
    
    addStageTabPane($("#tab-content"), key, numStages);

    var pre = 'Mission.Profile.Stages['+key+'].';
    
    $("input[name='"+pre+"Core.id']").val(val.Core.id);
    $("select[name='"+pre+"Core.legs']").val(val.Core.legs+'');
    $("input[name='"+pre+"Core.fairing_sep']").val(val.Core.fairing_sep);
    $("input[name='"+pre+"Core.fairing_sep']").prop('disabled', notSatellite);    
    $("input[name='"+pre+"release']").val(val.release);
    
    var burns = val.Burns;
    $.each(burns, function(burnKey,burnVal)
    {
      var burnPre = pre + 'Burns['+burnKey+'].';
      addBurnItem($('#burns-'+key+' .slideList'), burnPre, burnVal.tag);
  
      $("input[name='"+burnPre+"tag']").val(burnVal.tag);
      $("input[name='"+burnPre+"engines']").val(burnVal.engines);
      $("input[name='"+burnPre+"start']").val(burnVal.start);
      $("input[name='"+burnPre+"end']").val(burnVal.end);
      
    });
    
    var corrs = val.Course;
    $.each(corrs, function(corrKey,corrVal)
    {
      var corrPre = pre + 'Course['+corrKey+'].';
      addCourseItem($('#course-'+key+' .slideList'), corrPre, corrVal.tag);
  
      $("input[name='"+corrPre+"tag']").val(corrVal.tag);
      $("input[name='"+corrPre+"start']").val(corrVal.start);
      $("input[name='"+corrPre+"Attitude.pitch']").val(corrVal.Attitude.pitch);
      $("input[name='"+corrPre+"Attitude.yaw']").val(corrVal.Attitude.yaw);
      $("select[name='"+corrPre+"Attitude.gt']").val(corrVal.Attitude.gt);
      $("input[name='"+corrPre+"Attitude.throttle']").val(corrVal.Attitude.throttle);
      
      if(corrVal.Attitude.pitch !== undefined) {
        $("input[name='"+corrPre+"Attitude.pitch']").trigger('keyup');
      } else if(corrVal.Attitude.yaw !== undefined) {
        $("input[name='"+corrPre+"Attitude.yaw']").trigger('keyup');
      } else if(corrVal.Attitude.gt !== undefined) {
        $("select[name='"+corrPre+"Attitude.gt']").trigger('keyup');
      } else if(corrVal.Attitude.throttle !== undefined) {
        $("input[name='"+corrPre+"Attitude.throttle']").trigger('keyup');        
      }
      
    });
    
  });

  $("input[name='Mission.Profile.Payload.mass']").val(profile.Payload.mass);
      
  // Activate Core tab-pane
  $("#tabs").find('li').first().addClass('active');
  var corePane = $("#tab-content").children('.tab-pane[id="core"]');
  corePane.siblings().removeClass('active').removeClass('in');
  corePane.addClass('active').addClass('in');

}

function fillMissions(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var list = obj.data;
  
  $.each(list, function(key,val)
  {
    $('#head ul').prepend('<li role="presentation" id="'+val.code+'"><a href="#">'+val.description+'</a></li>');
    if(key===list.length-1)
    {
      // Click top mission
      var li = $('#head ul').children('li[id="'+val.code+'"]');
      li.trigger("click");
    }
  });
  
  var windowHeight = window.innerHeight;
  var headerHeight = $("#navHeader").outerHeight(true);
  var listHeight = windowHeight - headerHeight;
  $("#headList").css({ 'height': listHeight + "px" });
  
  var hash = window.location.hash;
  if(hash !== '') {
    var el = $("#headList li" + hash);
    var parent = $("#headList");
    parent.animate({scrollTop: el.offset().top - parent.offset().top + parent.scrollTop()}, 1000);

    el.trigger('click');
  }
}

function fillLaunchSites(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var list = obj.data;
  
  $.each(list, function(key,val)
  {
    $('#sites ul.slideItem').prepend('<li id="'+val.code+'"><a href="#">'+val.description+'</a></li>');
    $('#sites select').prepend('<option value="'+val.code+'">'+val.description+'</option>');
  });
}

function fillLaunchVehicles(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var list = obj.data;
  
  $.each(list, function(key,val)
  {
    $('#vehicles ul.slideItem').prepend('<li id="'+val.code+'"><a href="#">'+val.description+'</a></li>');
    $('#vehicles select').prepend('<option value="'+val.code+'">'+val.description+'</option>');
  });
}

function fillPayloads(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var list = obj.data;
  
  $.each(list, function(key,val)
  {
    $('#payloads ul.slideItem').prepend('<li id="'+val.code+'"><a href="#">'+val.description+'</a></li>');
    $('#payloads select').prepend('<option value="'+val.code+'">'+val.description+'</option>');
  });
}

/////////////////////////////////////////////////
//                                             //
//    Functions to add stage tab-pane HTML     //
//                                             //
/////////////////////////////////////////////////

function addStageTabPane(parent, id, numStages)
{
  
  var content = '        <div class="tab-pane fade in" id="stage-' + id + '">'
          + '              <input name="Mission.Profile.Stages[' + id + '].Core.id" value="" type="hidden"/>'
          + '              <div class="row">'
          + '                <div class="col-xs-12 col-sm-4 rborder_large">'
          + '                  <div class="row">'
          + '                    <div class="col-xs-6">Legs</div>'
          + '                    <div class="col-xs-6">'
          + '                      <div class="input-group">'
          + '                        <select name="Mission.Profile.Stages[' + id + '].Core.legs" class="form-control"><option value="true">Yes</option><option value="false">No</option></select>'
          + '                      </div>'
          + '                    </div>'
          + '                  </div>';

  if (id === numStages-1) {
    
    
    var token = $.cookie('authToken');
    var disabled = token===undefined ? ' disabled' : '';
  
    content +=
              '                  <div class="row">'
            + '                    <div class="col-xs-6">Payload Mass</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Payload.mass" value="" class="form-control" type="text"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>'
            + '                  <div class="row">'
            + '                    <div class="col-xs-6">Orbits</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.orbits" value="1" class="form-control" type="text"' + disabled + '/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>';
  }
  if(id !== 0) {
    content +=
            '                  <div class="tmargin2 row">'
          + '                    <div class="col-xs-6">Stage Sep</div>'
          + '                    <div class="col-xs-6">'
          + '                      <div class="input-group">'
          + '                        <input name="Mission.Profile.Stages[' + id + '].release" value="" class="form-control" type="text"/>'
          + '                      </div>'
          + '                    </div>'
          + '                  </div>';
  }
  if(id === numStages-1) {
        content +=
              '                  <div class="row">'
            + '                    <div class="col-xs-6">Fairing Sep</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Stages[' + id + '].Core.fairing_sep" value="" class="form-control" type="text"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>';
  }

  content +=
            '                  <div class="bmargin2 row">'
          + '                  </div>'
          + '                </div>'
          + '                <div id="burns-'+id+'" class="col-sm-4 rborder_large">'
          + '                  <div class="header col-xs-12">'
          + '                    <div class="col-xs-9">Burns</div>'
          + '                    <div class="addbutton col-xs-3"><span class="fa fa-plus"></span></div>'
          + '                  </div>'
          + '                  <hr>'
          + '                  <nav class="col-xs-12">'
          + '                    <ul class="slideList nav nav-pills nav-stacked">'
          + '                    </ul>'
          + '                  </nav>'
          + '                </div>'
          + '                <div id="course-'+id+'" class="col-sm-4">'
          + '                  <div class="header col-xs-12">'
          + '                    <div class="col-xs-9">Corrections</div>'
          + '                    <div class="addbutton col-xs-3"><span class="fa fa-plus"></span></div>'
          + '                  </div>'
          + '                  <hr>'
          + '                  <nav class="col-xs-12">'
          + '                    <ul class="slideList nav nav-pills nav-stacked">'
          + '                    </ul>'
          + '                  </nav>'
          + '                </div>'
          + '              </div>'
          + '            </div>';

  parent.append(content);

}

function addBurnItem(parent, pre, tag)
{
  var content =
           '<li class="col-xs-12">'
           +'  <span class="col-xs-10 slideTag">'+tag+'</span><span class="removebutton fa fa-minus"></span>'
           +'  <ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">Tag</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'tag" value="" class="form-control" type="text" maxlength="14"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">Engines</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'engines" value="" class="form-control" type="text"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">Start</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'start" value="" class="form-control" type="text"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">End</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'end" value="" class="form-control" type="text"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'  </ul>'
           +'</li>';
   
   parent.append(content);
}

function addCourseItem(parent, pre, tag)
{
  var content =
           '<li class="col-xs-12">'
           +'  <span class="col-xs-10 slideTag">'+tag+'</span><span class="removebutton fa fa-minus"></span>'
           +'  <ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">Tag</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'tag" value="" class="form-control" type="text" maxlength="14"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'    <li>'
           +'      <div class="row">'
           +'        <span class="col-xs-5">Start</span>'
           +'        <div class="col-xs-7"><div class="input-group"><input name="'+pre+'start" value="" class="form-control" type="text"/></div></div>'
           +'      </div>'
           +'    </li>'
           +'    <li>'
           +'      <ul class="nav nav-pills nav-stacked">'
           +'        <li>'
           +'          <div class="row">'
           +'            <span class="col-xs-5">Pitch (°)</span>'
           +'            <div class="col-xs-7"><div class="input-group"><input name="'+pre+'Attitude.pitch" value="" class="form-control" type="text"/></div></div>'
           +'          </div>'
           +'        </li>'
           +'        <li>'
           +'          <div class="row">'
           +'            <span class="col-xs-5">Yaw (°)</span>'
           +'            <div class="col-xs-7"><div class="input-group"><input name="'+pre+'Attitude.yaw" value="" class="form-control" type="text"/></div></div>'
           +'          </div>'
           +'        </li>'
           +'        <li>'
           +'          <div class="row">'
           +'            <span class="col-xs-5">GravTurn</span>'
           +'            <div class="col-xs-7"><div class="input-group"><select name="'+pre+'Attitude.gt" class="form-control"><option value=""></option><option value="fgt">Forward</option><option value="rgt">Reverse</option></select></div></div>'
           +'          </div>'
           +'        </li>'
           +'        <li>'
           +'          <div class="row">'
           +'            <span class="col-xs-5">Throttle</span>'
           +'            <div class="col-xs-7"><div class="input-group"><input name="'+pre+'Attitude.throttle" value="" class="form-control" type="text"/></div></div>'
           +'          </div>'
           +'        </li>'
           +'      </ul>'
           +'    </li>'
           +'  </ul>'
           +'</li>';
   
   parent.append(content);
}
