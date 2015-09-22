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
/*
var domain = 'http://www.decmurphy.com';
var port = ':8080';
var server = '/FlightSchool';
*/
var domain = 'http://localhost';
var port = ':8080';
var server = '/FlightClub';

var version = '/api/v1';
var home = domain + server;
var api_url = domain + port + server + version;

var calculating = false;

var mobile_query = window.matchMedia( "(max-width: 767px)" );
var large_query = window.matchMedia( "(min-width: 768px)" );

$(document).ready(function () 
{
  httpRequest(api_url+'/missions?display=1', 'GET', null, fillMissions);
  httpRequest(api_url+'/launchsites', 'GET', null, fillLaunchSites);
  httpRequest(api_url+'/launchvehicles', 'GET', null, fillLaunchVehicles); 

  $("#tabs ul").on('click', 'li[id="update"]', function (e) 
  {
    $("#copyInfo").fadeOut(500);
    $("#saveInfo").fadeToggle(500);
  });
  
  $('#saveInfo').on('click', 'span', function(e)
  {
    e.preventDefault();
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions', 'PUT', formAsJSON_string, updateSuccess);
  });
  
  $("#tabs ul").on('click', 'li[id="copy"]', function (e) 
  {
    $("#saveInfo").fadeOut(500);
    $("#copyInfo").fadeToggle(500);
  });
  
  $('#copyInfo').on('click', 'span', function(e)
  {
    e.preventDefault();
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions/new', 'PUT', formAsJSON_string, updateSuccess);
  });
  
  $('#tabs ul').on('click', 'li[id="logout"]', function(e)
  {
    $.removeCookie('authToken');
    location.reload();
  });
  
  $("#tabs ul").on('click', 'li[id="remove"]', function (e) 
  {
    e.preventDefault();
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions', 'DELETE', formAsJSON_string, updateSuccess);
  });
  
  $("#tabs ul").on('click', 'li[id="launch"]', function (e) 
  {
    e.preventDefault();
    $("#saveInfo").fadeOut(100);
    $("#copyInfo").fadeOut(100);
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/simulator/new', 'POST', formAsJSON_string, completeSim);
    calculating = true;
    animate_rocket(30);
  });
  
  $("#head ul").on('click', 'li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    httpRequest(api_url+'/missions/'+$(this).attr('id'), 'GET', null, fillProfile);
  });
  
  $("#login").on('click', 'button[type=submit]', function(e)
  {
    e.preventDefault();
    var formAsJSON_object = form2js('login', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/login', 'POST', formAsJSON_string, goHome);
  });
  
  $("#sites ul").on('click', '.slideItem li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $("select[name='Mission.launchsite']").val($(this).attr('id'));
  });
  
  $("#vehicles ul").on('click', '.slideItem li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass("active");
    $("select[name='Mission.launchvehicle']").val($(this).attr('id'));
  });
  
  $("#tab-content").on('click', 'button', function(e)
  {
    // All buttons in tab content. Need to be able to distinguish though
    e.preventDefault();
  });

  $(document).on('click', 'div[id^=burns] .addbutton', function(e)
  {
    var burnsTab = $(this).closest('div[id^=burns]');
    var parent = burnsTab.find('.slideList').first();
    var count = parent.children().length;
    var id = burnsTab.attr('id');
    var key = id.substr(id.length - 1);    
    var burnPre = 'Mission.Profile.Stages['+key+'].Burns['+count+'].';
    
    e.preventDefault();
    addBurnItem(parent, burnPre, 'newBurn');
  });

  $(document).on('click', 'div[id^=course] .addbutton', function(e)
  {
    var courseTab = $(this).closest('div[id^=course]');
    var parent = courseTab.find('.slideList').first();
    var count = parent.children().length;
    var id = courseTab.attr('id');
    var key = id.substr(id.length - 1);    
    var coursePre = 'Mission.Profile.Stages['+key+'].Course['+count+'].';
    
    e.preventDefault();
    addCourseItem(parent, coursePre, 'newCourse');
  });
  
  $(document).on('click', '.removebutton', function(e) {
    e.preventDefault();
    $(this).closest('li').remove();
  });
  
  $("[data-toggle='offcanvas']").click(function () {
    $('.row-offcanvas').toggleClass('active');
  });

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

  if (mobile_query.matches) {
    $("#core").find('.slideItem').hide();
  }

  $(document).on('keyup', 'input[name$=tag]', function() {
    var elem = $(this);
    elem.closest('.slideItem').siblings('span').first().text(elem.val());
  });

});

function httpRequest(dest, method, data, fn) 
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
      success: fn,
      error: function () {
      }
    });
}

function animate_rocket(w) {
  
  if(calculating) {
    $(".bg").css('z-index', 2500);
    $(".progress-container").css('z-index', 3000);
  }
  
  var windowWidth = $(document).width();
  if (w <= 99.5 && calculating) {
    $("#rocket").animate(
            {marginLeft: 0.01 * w * (windowWidth - 125) + 'px'},
    1500, "linear", function () {
      animate_rocket(50 + 0.5 * w);
    }
    );
  }
};

function resetRocket() {
  
  calculating = false;
  $(".bg").css('z-index', -1000);
  $(".progress-container").css('z-index', -2000);
  var rocketWidth = $("#rocket").width();
  $("#rocket").css('marginLeft', rocketWidth/2 + 'px');
  
}

/////////////////////////////////////////////////
//                                             //
//    Functions to deal with AJAX responses    //
//                                             //
/////////////////////////////////////////////////

function completeSim(data) 
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  var queryString = obj.Mission.url.split('?')[1];
  
  var map = new Object();
  var arr = queryString.split('&');
  
  for(var i=0;i<arr.length;i++) 
  {
    var pair = arr[i].split('=');
    map[pair[0]] = pair[1];
  }
  
  resetRocket();
  window.open(domain+port+server+'/DisplayResults?id=' + map['id'] + '&pl=' + map['pl'], '_blank');
}

function updateSuccess() 
{
  window.location = domain+server+'Success';
}

function goHome(data)
{
  var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
  $.cookie("authToken", obj.Success.authToken, { expires : obj.Success.maxAge });
  
  window.location = home;
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
  
  var item = $('#sites li[id="'+mission.launchsite+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
  item = $('#vehicles li[id="'+mission.launchvehicle+'"]');
  item.siblings().removeClass("active");
  item.addClass("active");
  
  var profile = mission.Profile;
  
  // Add Core tab before stages
  $("#tabs ul.nav li[id^='tab'").remove();
  $("#tab-content").children("[id^='stage']").remove();

  var stages = profile.Stages;
  $.each(stages, function(key,val)
  {
    // Just make sure key has the right value
    key = val.Core.id;
    
    // Tab for this stage
    $("#tabs ul.nav li[id='info']").before('<li id="tab-'+key+'"><a href="#stage-'+key+'" role="tab" data-toggle="tab">'+(key+1)+'</a></li>');
    
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
  
  var content = '<!-- Stage ' + id + ' -->'

          + '            <div class="tab-pane fade in" id="stage-' + id + '">'
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
          + '                    <div class="col-xs-3"><span class="addbutton fa fa-plus"></span></div>'
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
          + '                    <div class="col-xs-3"><span class="addbutton fa fa-plus"></span></div>'
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