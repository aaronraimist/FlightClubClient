/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function ()
{

  var fullData = {}, eventsData = {};
  var d1 = [], d2 = [], d3 = [];
  var launchTime = new Date();
  var i = -5;
  var throttle = 1;
  
  var queryString = window.location.search.substring(1);
  params = parseQueryString(queryString);

  var plot;

  getDataFile(params['id'], 'Booster');
  getEventsFile(params['id'], 'Booster');
  start();

  function getDataFile(id, stage) {
    var url = 'http://www.flightclub.io/output/' + id + '_' + stage + '.dat';
    $.ajax({type: 'GET', url: url, async: false, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {
      var lines = data.split("\n");
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        fullData[parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]);
      }
    }

    function errorfn(data) {
      alert(data);
    }
  }
  
  function getEventsFile(id, stage) {
    var url = 'http://www.flightclub.io/output/' + id + '_' + stage + '_events.dat';
    $.ajax({type: 'GET', url: url, async: false, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {
      var lines = data.split("\n");
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        eventsData[parseInt(data[0])] = parseInt(data[12]);
      }
    }

    function errorfn(data) {
      alert(data);
    }
  }

  function start() {
    var placeholder = $("#placeholder");
    plot = $.plot(placeholder, [d1, d2, d3], {
      series: {
        shadowSize: 0	// Drawing is faster without shadows
      },
      yaxis: {
        min: 0,
        max: 200
      },
      xaxis: {
        min: 0,
        max: 100
      }
    });
    
		placeholder.bind("plotpan", function (event, plot) {
      /*
			var axes = plot.getAxes();
			$(".message").html("Panning to x: "  + axes.xaxis.min.toFixed(2)
			+ " &ndash; " + axes.xaxis.max.toFixed(2)
			+ " and y: " + axes.yaxis.min.toFixed(2)
			+ " &ndash; " + axes.yaxis.max.toFixed(2));
      */
		});

		placeholder.bind("plotzoom", function (event, plot) {
      /*
			var axes = plot.getAxes();
			$(".message").html("Zooming to x: "  + axes.xaxis.min.toFixed(2)
			+ " &ndash; " + axes.xaxis.max.toFixed(2)
			+ " and y: " + axes.yaxis.min.toFixed(2)
			+ " &ndash; " + axes.yaxis.max.toFixed(2));
      */
		});

		// add zoom out button 

		$("<div class='button fa fa-minus' style='right:20px;top:20px'></div>")
			.appendTo(placeholder)
			.click(function (event) {
				event.preventDefault();
				plot.zoomOut();
			});

		// and add panning buttons

		// little helper for taking the repetitive work out of placing
		// panning arrows

		function addArrow(dir, right, top, offset) {
			$("<span class='button fa fa-chevron-" + dir + "' style='right:" + right + "px;top:" + top + "px'></span>")
				.appendTo(placeholder)
				.click(function (e) {
					e.preventDefault();
					plot.pan(offset);
				});
		}

		addArrow("left", 55, 60, { left: -100 });
		addArrow("right", 25, 60, { left: 100 });
		addArrow("up", 40, 45, { top: -100 });
		addArrow("down", 40, 75, { top: 100 });

    update();

  }

  function update() {

    var finished = false;
    var currentTime = new Date();
    var time = (currentTime - launchTime) / 1000;

    while (true) {

      if (i <= time) {

        // Main curve
        if (fullData[i] === undefined) {
          finished = true;
          break;
        } else {
          var tel = fullData[i].split(":");

          // Burn curves
          if (throttle === 0)
            d1.push([tel[0], tel[1]]);
          else
            d2.push([tel[0], tel[1]]);
        }

        if (eventsData[i] !== undefined) {
          throttle = eventsData[i];

          // Separator for burns curves
          if (throttle === 0)
            d2.push(null);
          else
            d1.push(null);
          
          // Burn start/end points
          var tel = fullData[i].split(":");
          d3.push([tel[0], tel[1]]);
        }

        i++;
      }
      else
        break;

    }

    plot.setData([{
        data: d1,
        lineWidth: 1,
        lines: {show: true}
      }, {
        data: d2,
        lineWidth: 10,
        color: '#ff0000',
        lines: {show: true}
      }, {
        data: d3,
        color: '#ff0000',
        lines: {show: false},
        points: {show: true}
      }]);
    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.draw();

    if (!finished)
      setTimeout(update, 1000);
  }

});
