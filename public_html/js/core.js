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

var domain = 'http://www.decmurphy.com';
//var domain = 'http://localhost';
var port = ':8080';
var server = '/FlightClub';

var version = '/api/v1';
var home = domain + server;
var api_url = domain + port + server + version;

var calculating = false;

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

var popupBlockerChecker = {
        check: function(popup_window, dest){
            var _scope = this;
            if (popup_window) {
                if(/chrome/.test(navigator.userAgent.toLowerCase())){
                    setTimeout(function () {
                        _scope._is_popup_blocked(_scope, popup_window, dest);
                     },200);
                }else{
                    popup_window.onload = function () {
                        _scope._is_popup_blocked(_scope, popup_window, dest);
                    };
                }
            }else{
                _scope._displayError(dest);
            }
        },
        _is_popup_blocked: function(scope, popup_window, dest){
            if ((popup_window.innerHeight > 0)===false){ scope._displayError(dest); }
        },
        _displayError: function(dest){
          if(large_query.matches) {
            alert("You've blocked pop-ups! :(\n\nYou'll enjoy FlightClub more if you allow them. I promise :)");
          }
          window.location = dest;
        }
    };

/////////////////////////////////////////////////
//                                             //
//    Functions to deal with AJAX responses    //
//                                             //
/////////////////////////////////////////////////

function completeSim(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var queryString = obj.Mission.output.split('?')[1];
    
  calculating = false;
  $(".bg").css('z-index', -1000);
  $(".progress-container").css('z-index', -2000);
  
  var dest = home+'/results.php?' + queryString;
  var popup = window.open(dest, '_blank');
  popupBlockerChecker.check(popup, dest);
  
}

function errorSim(data)
{
  var errors = data.responseJSON.Mission.errors;
  var errorsHash = window.btoa(errors);
  
  calculating = false;
  $(".bg").css('z-index', -1000);
  $(".progress-container").css('z-index', -2000);
  
  var dest = home+'/error.php#'+errorsHash;
  var popup = window.open(dest, '_blank');
  popupBlockerChecker.check(popup, dest);
}

function updateSuccess() 
{
  window.location = home;
}

function updateError() 
{
  window.location = home+'/error.php';
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
  var dataString = JSON.stringify(data, null, 2);
  var title = data.Mission.desc + ' Results';
  $(document).prop('title', title);
  $("#missionTag").append(title);
  
  var imageMap = new Object();
  var images = data.Mission.Output.Images;
  $.each(images, function(key,val)
  {
    imageMap[val.desc] = val.url;
  });
  
  var fileMap = new Object();
  var files = data.Mission.Output.Files;
  $.each(files, function(key,val)
  {
    fileMap[val.desc] = val.url;
  });
    
  var content = 
          '<div class="row">\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['globe']+'" alt="globe"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['ground-track']+'" alt="ground-track"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['altitude1']+'" alt="altitude1"/></div>\n'+
          '</div>\n'+
          '<div class="row">\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['landing']+'" alt="landing"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['landing2']+'" alt="landing2"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['altitude2']+'" alt="altitude2"/></div>\n'+
          '</div>\n'+
          '<div class="row">\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['profile1']+'" alt="profile1"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['total-delta-v']+'" alt="total-delta-v"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['velocity1']+'" alt="velocity1"/></div>\n'+
          '</div>\n'+
          '<div class="row">\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['velocity2']+'" alt="velocity2"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['prop']+'" alt="prop"/></div>\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['phase1']+'" alt="phase1"/></div>\n'+
          '</div>\n'+
          '<div class="row">\n'+
          '  <div class="col-sm-4"><img src="'+imageMap['q']+'" alt="q"/></div>\n'+
          '</div>\n';
  
  $('.resultGrid').append(content);
  
  var warningsFile = fileMap['warnings'];
  $.get(warningsFile, function (txt) {
    var warnings = txt.split(";");

    content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
    for (var i = 0; i < warnings.length; i++) {
      content += '<li><div class="row nopadding text_half"><div class="col-xs-12">' + warnings[i] + '</div></li>';
    }
    content += '</ul>';

    $('.warnings').append(content);
    $('.warnings .slideTag').append(' ('+(warnings.length-1)+')');
  });
  
  var telemetryFile = fileMap['telemetry'];
  $.get(telemetryFile, function (txt) {

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
            content += '<li><div class="row nopadding text_half"><div class="col-xs-4 col-sm-3 textright">' + pair[0] + '</div><div class="col-xs-8 col-xs-9 textleft">' + pair[1] + '</div></div></li>';
          }
        }
        content += '</ul>';
        $('.events').append(content);
      } else {
        // landing info
        var map = lines[i].split(':');
        var infoMap = map[1].split(';');
        if (map[0] === 'Landing') {
          content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
          for (var j = 0; j < infoMap.length; j++) {
            var pair = infoMap[j].split('=');
            if (pair[0] !== undefined && pair[1] !== undefined) {
              content += '<li><div class="row nopadding text_half"><div class="col-xs-6 textright">' + pair[0] + '</div><div class="col-xs-6 textleft">' + pair[1] + '</div></div></li>';
            }
          }
          content += '</ul>';
          $('.landing').append(content);
        }
        // orbit info
        else if (map[0] === 'Orbit') {
          content = '<ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none">';
          for (var j = 0; j < infoMap.length; j++) {
            var pair = infoMap[j].split('=');
            if (pair[0] !== undefined && pair[1] !== undefined) {
              content += '<li><div class="row nopadding text_half"><div class="col-xs-6 textright">' + pair[0] + '</div><div class="col-xs-6 textleft">' + pair[1] + '</div></div></li>';
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
  
  var item = $('#sites li[id="'+mission.launchsite+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
  item = $('#vehicles li[id="'+mission.launchvehicle+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
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
    
    addStageTabPane($("#tab-content"), key);

    var pre = 'Mission.Profile.Stages['+key+'].';
    
    $("input[name='"+pre+"Core.id']").val(val.Core.id);
    $("select[name='"+pre+"Core.legs']").val(val.Core.legs+'');
    $("input[name='"+pre+"release']").val(val.release);
    if (typeof val.PitchKick !== "undefined") {
      $("input[name='" + pre + "PitchKick.start']").val(val.PitchKick.start);
      $("input[name='" + pre + "PitchKick.pitch']").val(val.PitchKick.pitch);
      $("input[name='" + pre + "PitchKick.yaw']").val(val.PitchKick.yaw);
    }
    
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

  $("input[name='Mission.Profile.Payload.code']").val(profile.Payload.code);
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

/////////////////////////////////////////////////
//                                             //
//    Functions to add stage tab-pane HTML     //
//                                             //
/////////////////////////////////////////////////

function addStageTabPane(parent, id)
{
  
  var content = '        <div class="tab-pane fade in" id="stage-' + id + '">'
          + '              <input name="Mission.Profile.Stages[' + id + '].Core.id" value="" type="hidden"/>'
          + '              <div class="row">'
          + '                <div class="col-xs-12 col-sm-4 rborder_large">'
          + '                  <div class="row">'
          + '                    <div class="col-xs-6">Release</div>'
          + '                    <div class="col-xs-6">'
          + '                      <div class="input-group">'
          + '                        <input name="Mission.Profile.Stages[' + id + '].release" value="" class="form-control" type="text"/>'
          + '                      </div>'
          + '                    </div>'
          + '                  </div>'
          + '                  <div class="row">'
          + '                    <div class="col-xs-6">Legs</div>'
          + '                    <div class="col-xs-6">'
          + '                      <div class="input-group">'
          + '                        <select name="Mission.Profile.Stages[' + id + '].Core.legs" class="form-control"><option value="true">Yes</option><option value="false">No</option></select>'
          + '                      </div>'
          + '                    </div>'
          + '                  </div>';

  if (id === 0) {
    content +=
              '                  <div class="tmargin2 row">'
            + '                    <div class="col-xs-12">PitchKick</div>'
            + '                  </div>'
            + '                  <div class="row">'
            + '                    <div class="col-xs-offset-1 col-xs-5">Start</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Stages[' + id + '].PitchKick.start" value="" class="form-control" type="text"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>'
            + '                  <div class="row">'
            + '                    <div class="col-xs-offset-1 col-xs-5">Pitch</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Stages[' + id + '].PitchKick.pitch" value="" class="form-control" type="text"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>'
            + '                  <div class="row">'
            + '                    <div class="col-xs-offset-1 col-xs-5">Yaw</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Stages[' + id + '].PitchKick.yaw" value="" class="form-control" type="text"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>'
            + '                  <div class="row">'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Payload.code" value="" class="form-control" type="hidden"/>'
            + '                      </div>'
            + '                    </div>'
            + '                  </div>'
            + '                  <div class="tmargin2 row">'
            + '                    <div class="col-xs-6">Payload Mass</div>'
            + '                    <div class="col-xs-6">'
            + '                      <div class="input-group">'
            + '                        <input name="Mission.Profile.Payload.mass" value="" class="form-control" type="text"/>'
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
           +'            <span class="col-xs-5">Pitch</span>'
           +'            <div class="col-xs-7"><div class="input-group"><input name="'+pre+'Attitude.pitch" value="" class="form-control" type="text"/></div></div>'
           +'          </div>'
           +'        </li>'
           +'        <li>'
           +'          <div class="row">'
           +'            <span class="col-xs-5">Yaw</span>'
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
