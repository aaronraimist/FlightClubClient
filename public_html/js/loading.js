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

$("#load").ready(function () 
{
  var formHash = window.location.hash.substring(1);
  var formData = window.atob(formHash);
  
  httpRequest(api_url + '/simulator/new', 'POST', formData, completeSim, errorSim);
  animate_rocket(30);
});

function animate_rocket(w) {
  
  var windowWidth = $(document).width();
  if (w <= 99.5) {
    $("#rocket").animate(
            {marginLeft: 0.01 * w * (windowWidth - 125) + 'px'},
    1500, "linear", function () {
      animate_rocket(50 + 0.5 * w);
    }
    );
  }
};