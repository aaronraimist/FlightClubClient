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

  // Open "extra info" dialog box on click of "save" button
  $("#tabs ul").on('click', 'li[id="update"]', function (e) 
  {
    $("#copyInfo").fadeOut(500);
    $("#saveInfo").fadeToggle(500);
  });
  
  // Commit "save" dialog box
  $('#saveInfo').on('click', 'span', function(e)
  {
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions', 'PUT', formAsJSON_string, updateSuccess, updateError);
  });
  
  // Open "extra info" dialog box on click of "copy" button
  $("#tabs ul").on('click', 'li[id="copy"]', function (e) 
  {
    $("#saveInfo").fadeOut(500);
    $("#copyInfo").fadeToggle(500);
  });
  
  // Commit "copy" dialog box
  $('#copyInfo').on('click', 'span', function(e)
  {
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/missions/new', 'PUT', formAsJSON_string, updateSuccess, updateError);
  });
  
  // Log out user, remove authToken cookie
  $('#tabs ul').on('click', 'li[id="logout"]', function(e)
  {
    $.removeCookie('authToken');
    location.reload();
  });
  
  // Run launch profile on the Simulator, show the loading screen
  $("#tabs ul").on('click', 'li[id="launch"]', function (e) 
  {
    $("#saveInfo").fadeOut(100);
    $("#copyInfo").fadeOut(100);
    $('.row-offcanvas').removeClass('active');
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);
    console.log(formAsJSON_string);
    httpRequest(api_url+'/simulator/new', 'POST', formAsJSON_string, completeSim, errorSim);
    calculating = true;
    resetRocket();
    animate_rocket(30);
  });
  
  // Load mission profile when a mission is chosen by user
  $("#head ul").on('click', 'li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    httpRequest(api_url+'/missions/'+$(this).attr('id'), 'GET', null, fillProfile, null);
  });
  
  // select launchsite manually on click
  // - doesn't happen automatically because of custom list
  $("#sites ul").on('click', '.slideItem li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $("select[name='Mission.launchsite']").val($(this).attr('id'));
  });
  
  // select launchvehicle manually on click
  // - doesn't happen automatically because of custom list
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

  // add new burn item
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

  // add new course correction item
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
  
  // remove button for burn and course correction items
  $(document).on('click', '.removebutton', function(e) {
    e.preventDefault();
    $(this).closest('li').remove();
  });
  
  // off canvas menu for mobile. button not visible on desktop
  $("[data-toggle='offcanvas']").click(function () {
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

  // initially hide launchsite and launchvehicle lists on mobile
  // maybe should only show one at a time like above?
  if (mobile_query.matches) {
    $("#core").find('.slideItem').hide();
  }

  // fill burn and course correction item names when tag field is filled in
  $(document).on('keyup', 'input[name$=tag]', function() {
    var elem = $(this);
    elem.closest('.slideItem').siblings('span').first().text(elem.val());
  });

  // blur out course correction fields depending on which ones are filled in
  $(document).on('click', 'div[id^=course] .slideItem ul .input-group', function() {
    $(this).trigger('keyup');
  });

  // blur out course correction fields depending on which ones are filled in
  $(document).on('keyup', 'div[id^=course] .slideItem ul .input-group', function() {
    var focus = $(this).children().first();
    var list = $(this).closest('ul');

    var text = focus.val();
    if(text === '') {
      text = $(list).find(":selected").text();
    }
    
    if(text === '')
    {
      $(list).find('select').prop('disabled', false);
      $(list).find('input').each(function() {
        $(this).prop('disabled', false);
      });
    }
    else
    {
      var name = focus.attr('name');
      if(name.match('pitch$') || name.match('yaw')) {
        $(list).find('select[name$=gt]').prop('disabled', true);
        $(list).find('input[name$=throttle]').prop('disabled', true);
      } else if(name.match('gt$')) {
        $(list).find('input[name$=pitch]').prop('disabled', true);
        $(list).find('input[name$=yaw]').prop('disabled', true);
        $(list).find('input[name$=throttle]').prop('disabled', true);        
      } else if(name.match('throttle$')) {
        $(list).find('input[name$=pitch]').prop('disabled', true);
        $(list).find('input[name$=yaw]').prop('disabled', true);
        $(list).find('select[name$=gt]').prop('disabled', true);  
      }
    }
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