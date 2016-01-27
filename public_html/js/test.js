/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function() {
  
  var x = 0;
  $("#res_button").on('click', function() {
        
    x = (x+1)%$('.pane').length;  
    $('.pane').each(function(index) {      
      if(index===x) {
        $(this).animate({
          marginLeft: '112.5%'
        }, 500);
      } else {
        $(this).animate({
          marginLeft: '0%'
        }, 500);
      }
    });
  });
  
  var winH = $(".container").height();
  var navH = $("nav").height();
  var workH = winH - navH;
  $(".pane").css({marginTop: 0.05*workH+'px'});
  $(".pane img").height(0.9*workH);
  
});