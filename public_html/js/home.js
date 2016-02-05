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
  httpRequest(api_url+'/payloads', 'GET', null, fillPayloads, null);

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
    e.preventDefault();    
    
    $("#saveInfo").fadeOut(100);
    $("#copyInfo").fadeOut(100);
    $('.row-offcanvas').removeClass('active');
    
    var formAsJSON_object = form2js('submitForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);
    
    var formHash = window.btoa(formAsJSON_string);
    window.open(client + '/loading.php#' + formHash, '_blank');
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
  
  // select payload manually on click
  // - doesn't happen automatically because of custom list
  $("#payloads ul").on('click', '.slideItem li', function(e) 
  {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $("select[name='Mission.Profile.Payload.code']").val($(this).attr('id'));
    
    $("input[name$='Core.fairing_sep']").prop('disabled', $(this).attr('id') !== 'SATL');
    
  });
  
  // select launchvehicle manually on click
  // - doesn't happen automatically because of custom list
  $("#vehicles ul").on('click', '.slideItem li', function(e) 
  {
    var oldCode = $(this).parent().find('li.active').attr('id');

    $(this).siblings().removeClass('active');
    $(this).addClass("active");
    $("select[name='Mission.launchvehicle']").val($(this).attr('id'));
    
    var newCode = $(this).attr('id');
    correctTabsForVehicle(oldCode, newCode);
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
    
    var burnPre;
    var id = burnsTab.attr('id');
    var key = id.substr(id.length - 1);  
    for(var i=0;i<=count;i++) {
      burnPre = "Mission.Profile.Stages["+key+"].Burns["+i+"].";
      var x = $('input[name^="'+burnPre+'"]');
      if(x.length===0) {
        break;
      }
    }  
    
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
    var coursePre;
    for(var i=0;i<=count;i++) {
      coursePre = "Mission.Profile.Stages["+key+"].Course["+i+"].";
      var x = $('input[name^="'+coursePre+'"]');
      if(x.length===0) {
        break;
      }
    }  
    
    e.preventDefault();
    addCourseItem(parent, coursePre, 'newCourse');
  });
  
  // remove button for burn and course correction items
  $(document).on('click', '.removebutton', function(e) {
    e.preventDefault();
    $(this).closest('li').remove();
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
    
    var name = focus.attr('name');
    if(text === '')
    {
      if(name.match('gt$')
          || (name.match('pitch$') && $(list).find('input[name$=yaw]').val() === '')
          || (name.match('yaw') && $(list).find('input[name$=pitch]').val() === '')
        ) {
        $(list).find('select').prop('disabled', false);
        $(list).find('input').each(function() {
          $(this).prop('disabled', false);
        });
      }
    }
    else
    {
      if(name.match('pitch$') || name.match('yaw')) {
        $(list).find('select[name$=gt]').prop('disabled', true);
      } else if(name.match('gt$')) {
        $(list).find('input[name$=pitch]').prop('disabled', true);
        $(list).find('input[name$=yaw]').prop('disabled', true);
      }
    }
  });

});

function numStagesPerVehicle(vehicle) {
  
  switch (vehicle) {
    case 'FNH':
      return 3;
    case 'F1A':
    case 'F1C':
    case 'FN9':
    case 'F91':
    case 'F92':
      return 2;
    default:
      return -1;
  }
}

function correctTabsForVehicle(oldCode, newCode) {
  
  var newNumStages = numStagesPerVehicle(newCode);
  var oldNumStages = numStagesPerVehicle(oldCode);
  
  if (newNumStages !== oldNumStages) {
    // remove old tab list
    for (var i = 1; i <= oldNumStages; i++) {
      $("#tabs").find("#tab-" + i).first().remove();
    }

    // build new tab list
    for (var stage = 1; stage <= newNumStages; stage++)
    {
      var name = getStageName(stage, newNumStages);
      $("#tabs ul.nav li[id='info']").before('<li id="tab-' + stage + '"><a href="#stage-' + (stage-1) + '" role="tab" data-toggle="tab">' + name + '</a></li>');
    }

    if (newNumStages > oldNumStages)
    {
      // add new tabs
      for (var i = 0; i < newNumStages - oldNumStages; i++) {
        var key = oldNumStages + i;
        var tab = $("#tab-content").find("#stage-" + key);
        
        // tab will be created first time we go from 2stage -> 3stage
        // won't be destroyed going back to 2stage
        // so no need to recreate in future
        if(tab.length === 0) {
          addStageTabPane($("#tab-content"), key);
        }
      }
    }
    
    $("#tab-content").find("div[id^=\"burns\"]").find(".slideList").find("li").remove();
    $("#tab-content").find("div[id^=\"course\"]").find(".slideList").find("li").remove();
    $("#tab-content").find("input").val('');
    
  }
  
}

function getStageName(stage, numStages) {
  
  if (mobile_query.matches) {
    return stage;
  }
  
  return numStages === 2 ? (stage === 1 ? 'Core Stage' : 'Upper Stage') // 2 stage rockets
         : (stage === 1 ? 'Boosters' : stage === 2 ? 'Core Stage' : 'UpperStage'); // 3 stage rockets (FH)
}