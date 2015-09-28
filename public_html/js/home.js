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

$("#home").ready(function () 
{
  var token = $.cookie('authToken');
  var display = token===undefined ? '?display=1' : '';
  httpRequest(api_url+'/missions'+display, 'GET', null, fillMissions, null);
  httpRequest(api_url+'/launchsites', 'GET', null, fillLaunchSites, null);
  httpRequest(api_url+'/launchvehicles', 'GET', null, fillLaunchVehicles, null);

  $("#tabs ul").on('click', 'li[id="update"]', function (e) 
  {
    $("#copyInfo").fadeOut(500);
    $("#saveInfo").fadeToggle(500);
  });
  
  $('#saveInfo').on('click', 'span', function(e)
  {
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions', 'PUT', formAsJSON_string, updateSuccess, updateError);
  });
  
  $("#tabs ul").on('click', 'li[id="copy"]', function (e) 
  {
    $("#saveInfo").fadeOut(500);
    $("#copyInfo").fadeToggle(500);
  });
  
  $('#copyInfo').on('click', 'span', function(e)
  {
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions/new', 'PUT', formAsJSON_string, updateSuccess, updateError);
  });
  
  $('#tabs ul').on('click', 'li[id="logout"]', function(e)
  {
    $.removeCookie('authToken');
    location.reload();
  });
  
  $("#tabs ul").on('click', 'li[id="launch"]', function (e) 
  {
    $("#saveInfo").fadeOut(100);
    $("#copyInfo").fadeOut(100);
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);
    httpRequest(api_url+'/simulator/new', 'POST', formAsJSON_string, completeSim, null);
    calculating = true;
    resetRocket();
    animate_rocket(30);
  });
  
  $("#head ul").on('click', 'li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    httpRequest(api_url+'/missions/'+$(this).attr('id'), 'GET', null, fillProfile, null);
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
  
  var rocketWidth = $("#rocket").width();
  var newW = -1*rocketWidth/2.0;
  $("#rocket").removeAttr('style');
  $("#rocket").css('marginLeft', newW + 'px');
  
}