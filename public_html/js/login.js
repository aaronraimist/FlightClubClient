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

$("#login").ready(function()
{
  $(this).on('click', 'button[type=submit]', function(e)
  {
    e.preventDefault();
    var formAsJSON_object = form2js('loginForm', '.', true);
    var formAsJSON_string = JSON.stringify(formAsJSON_object, null, 2);    
    httpRequest(api_url+'/login', 'POST', formAsJSON_string, goHome, updateError);
  });
});