
/* global Cesium */

function world() {

  this.getViewer = function () {
    return viewer;
  };

  this.getLaunchTime = function () {
    return w.getProp('launchTime');
  };

  this.setCameraLookingAt = function (site) {
    viewer.camera.flyTo(launchPadViews[site]);
  };

  this.getStageName = function (stageNum) {
    switch (stageNum) {
      case 0:
        return "Booster";
      case 1:
        return w.getProp('vehicle') === "FNH" ? "Core" : "UpperStage";
      case 2:
        return w.getProp('vehicle') === "FNH" ? "UpperStage" : undefined;
      default:
        return undefined;
    }
  };

  var trackedStage = 0;
  this.trackEntity = function (stage) {
    if(viewer.trackedEntity !== entities[stage]) {
      trackedStage = stage;
      viewer.trackedEntity = entities[stage];
      viewer.camera.zoomOut();
    }
  };

  this.loadDataAndPlot = function () {

    for (var i = 0; i < w.getProp('numStages'); i++) {

      fullData[i] = [];

      if (alt[i] === undefined)
        alt[i] = [];
      alt[i][0] = [];
      alt[i][1] = [];

      if (vel[i] === undefined)
        vel[i] = [];
      vel[i][0] = [];
      vel[i][1] = [];
  
      future[i] = {};
      future[i]["alt"] = [];
      future[i]["vel"] = [];

      max[i] = {};
    }

    var launchDate = new Date(w.getProp('launchTime'));
    var end = new Date(w.getProp('launchTime') + 600e3);
    var now;
    if(w.getProp('watch')==='1')
      now = new Date();
    else
      now = new Date(w.getProp('launchTime') - 30e3);

    viewer = new Cesium.Viewer('cesiumContainer', {
      timeline: true,
      animation: false,
      scene3DOnly: true,
      fullscreenButton: false,
      homeButton: false,
      geocoder: false,
      baseLayerPicker: false,
      creditContainer: document.getElementById("creditContainer"),
      clock: new Cesium.Clock({
        startTime: Cesium.JulianDate.fromDate(launchDate),
        currentTime: Cesium.JulianDate.fromDate(now),
        stopTime: Cesium.JulianDate.fromDate(end),
        clockRange: Cesium.ClockRange.UNBOUNDED,
        clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER
      })

    });

    viewer.scene.globe.enableLighting = true;
    var terrainProvider = new Cesium.CesiumTerrainProvider({
      url: '//assets.agi.com/stk-terrain/world',
      requestWaterMask: true,
      requestVertexNormals: true
    });
    viewer.terrainProvider = terrainProvider;

    viewer.timeline.updateFromClock();
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);

    getHazardMap();
  };
  
  function getHazardMap() {
    
    var url = server + '/resource/' + w.getProp('code') + '.hazard.txt';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {

      var lines = data.split("\n");
      var array = [];
      for (var i = 0; i < lines.length; i++) {

        var x = lines[i];
        var y = array.length;
        if (lines[i].indexOf(";")===-1) {
          if (array.length > 0) {
            viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(array),
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.RED
              }
            });
            array = [];
          }
        }

        if(lines[i].indexOf(";")>-1) {
          var data = lines[i].split(";");
          array.push(data[0], data[1]);
        }
      }

      getEventsFile(0);
    }

    function errorfn(data) {
      console.log(data);
      getEventsFile(0);
    }
  }

  function getDataFile(stage) {

    var url = base + '/output/' + w.getProp('id') + '_' + w.getStageName(stage) + '.dat';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {

      var lines = data.split("\n");

      var p_stage = new Cesium.SampledPositionProperty();
      var trajectory = new Cesium.SampledPositionProperty();

      var launchDate = new Date(w.getProp('launchTime'));

      var start = Cesium.JulianDate.fromDate(launchDate);
      var stop = Cesium.JulianDate.addSeconds(start, 7200, new Cesium.JulianDate());

      var t = 0, throttle = 0;
      for (var i = 1; i < lines.length; i++) {

        if (lines[i] === "")
          continue;

        var data = lines[i].split("\t");
        fullData[stage][parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]);

        if (t < 600 && parseFloat(data[4]) > max[stage]["altitude"] || max[stage]["altitude"] === undefined)
          max[stage]["altitude"] = Math.ceil(parseFloat(data[4]) / 100) * 100;
        if (t < 600 && parseFloat(data[5]) > max[stage]["velocity"] || max[stage]["velocity"] === undefined)
          max[stage]["velocity"] = Math.ceil(parseFloat(data[5]) / 500) * 500;

        var focus = false;
        for (var j = 0; j < focusPoints.length; j++) {
          if (Math.abs(data[0] - focusPoints[j]) <= 0.5) {
            focus = true;
            break;
          }
        }

        t = parseInt(data[0]);
        var x = parseFloat(data[1]);
        var y = parseFloat(data[2]);
        var z = parseFloat(data[3]);
        var h = parseFloat(data[4]) * 1e3;

        var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
        var lon = 180 * Math.atan2(y, x) / Math.PI;

        var time = Cesium.JulianDate.addSeconds(start, t, new Cesium.JulianDate());
        var position = Cesium.Cartesian3.fromDegrees(lon, lat, h);
        trajectory.addSample(time, position);
        p_stage.addSample(time, position);

        if (focus) {
          var e = viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
            position: trajectory,
            path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: throttle >= 0.5 ? Cesium.Color.RED : Cesium.Color.YELLOW}), width: 8}
          });
          e.position.setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
          });

          trajectory = new Cesium.SampledPositionProperty();
          trajectory.addSample(time, position);
        }
        throttle = parseFloat(data[12]);

      }

      var e = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
        position: trajectory,
        path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: throttle >= 0.5 ? Cesium.Color.RED : Cesium.Color.YELLOW}), width: 8}
      });
      e.position.setInterpolationOptions({
        interpolationDegree: 5,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      });

      if (w.getProp('watch') !== undefined) {
        var pinBuilder = new Cesium.PinBuilder();
        entities[stage] = viewer.entities.add({
          position: p_stage,
          path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: Cesium.Color.TRANSPARENT}), width: 1},
          billboard : {
            image: pinBuilder.fromText(stage+1, Cesium.Color.ROYALBLUE, 32).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
        entities[stage].position.setInterpolationOptions({
          interpolationDegree: 5,
          interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        });
      }

      getEventsFile(stage + 1);
    }

    function errorfn(data) {
      console.log(data);
    }
  }

  function getEventsFile(stage) {
    if (w.getStageName(stage) === undefined) {
      start();        
    }
    else {
      var url = base + '/output/' + w.getProp('id') + '_' + w.getStageName(stage) + '_events.dat';
      $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
        xhrFields: {withCredentials: false},
        success: successfn,
        error: errorfn
      });
    }

    function successfn(data) {
      var lines = data.split("\n");
      eventsData[stage] = [];

      focusPoints = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");

        if (data.length === 1)
          continue;

        eventsData[stage][parseInt(data[0])] = parseFloat(data[12]); // eventsData[time] = throttle
        focusPoints.push(parseFloat(data[0]));

        var x = parseFloat(data[1]);
        var y = parseFloat(data[2]);
        var z = parseFloat(data[3]);
        var h = parseFloat(data[4]) * 1e3;

        var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
        var lon = 180 * Math.atan2(y, x) / Math.PI;

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, h),
          point: {pixelSize: 5, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.RED, outlineWidth: 1}
        });
      }

      getDataFile(stage);
    }

    function errorfn(data) {
      console.log(data);
    }
  }

  function start() {

    if (w.getProp('watch') !== undefined) {

      displayClock(false);

      fillFutureArray();
      update();
    }

  }
  
  this.plotResize = function(considerSidebar) {
      
    setTimeout(function () {
      for (var stage = 0; stage < 2; stage++) {
        var width = $("md-sidenav")[0].clientWidth;
        $("#altitudePlot").width(width);
        $("#velocityPlot").width(width);
        $("#altitudePlot").height(width / 1.6);
        $("#velocityPlot").height(width / 1.6);
      }
      var w;
      if(considerSidebar) {
        w.initialisePlot("altitude", getTrackedStage());
        w.initialisePlot("velocity", getTrackedStage());
        w = $(document.body)[0].clientWidth - $("md-sidenav")[0].clientWidth;
      } else {
        w = $(document.body)[0].clientWidth;
      }
      $("#cesiumContainer").width(w);
    }, 500);
  };

  $(window).resize(function () {
    w.plotResize($(document.body)[0].clientWidth >= 960);
  });

  this.initialisePlot = function(element, stage) {

    var width = $("md-sidenav")[0].clientWidth;
    if(width===0) // sidenav is collapsed on mobile, but width is 320 when expanded
      width = 320;

    var placeholder = $("#" + element + "Plot");
    placeholder.width(width);
    placeholder.height(width / 1.6);

    if (placeholder.length > 0) {
      plot[element] = $.plot(placeholder, [[], []], {
        series: {
          shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
          min: 0,
          max: max[stage][element]
        },
        xaxis: {
          min: -2,
          max: 600
        }
      });
    }
  };

//////////////////////////////////////
//              CLOCK               //
//////////////////////////////////////

  function displayClock(waiting)
  {
    refreshClock(waiting);
    setInterval(function () {
      refreshClock(waiting);
    }, 1000);
  }

  function refreshClock(waiting)
  {
    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;

    var now = Cesium.JulianDate.toDate(viewer.clock.currentTime);
    var distance = (w.getProp('launchTime') - now);
    var sign = distance > 0 ? '-' : '+';
    var days = Math.floor(distance / _day);
    var hours = Math.abs(Math.floor((distance % _day) / _hour));
    var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
    var seconds = Math.abs(Math.floor((distance % _minute) / _second));

    if (waiting) {
      document.getElementById('days').innerHTML = days + ' day' + ((days !== 1) ? 's' : '');
      document.getElementById('hours').innerHTML = hours + ' hour' + ((hours !== 1) ? 's' : '');
      document.getElementById('minutes').innerHTML = minutes + ' minute' + ((minutes !== 1) ? 's' : '');
      document.getElementById('seconds').innerHTML = seconds + ' second' + ((seconds !== 1) ? 's' : '');

      if (Math.abs((59 * _minute - rand5) - distance) < 1000) // clock -> plots limit between T-59 -> T-54
        window.location.reload(true);
    }
    else {
      if (sign === '+') {
        hours -= 1;
        minutes -= 1;
        seconds -= 1;
      }
      if (hours < 10)
        hours = '0' + hours;
      if (minutes < 10)
        minutes = '0' + minutes;
      if (seconds < 10)
        seconds = '0' + seconds;
      $('#clock').html('T' + sign + hours + ':' + minutes + ':' + seconds);

      if (Math.abs((5 * _minute - rand5) - distance) < 1000)  // polls for aborts between T-5 -> T-0
        pollLaunchTime();
      if (Math.abs(rand5 + distance) < 1000 && w.getProp('watch') !== '2') // poll for aborts between T-0 -> T+5
        pollLaunchTime();
      if (Math.abs((15 * _minute + 2 * rand5) + distance) < 1000 && w.getProp('watch') !== '2') // plots -> over limit between T+15 -> T+25
        window.location.reload(true);
    }
  }

  this.pollLaunchTime = function() {
    httpRequest(api_url + '/missions/' + w.getProp('code'), 'GET', null,
            function (data) {
              var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
              var newTime = Date.parse(tempDate);

              if (newTime !== w.getProp('launchTime'))
                window.location.reload(true);
            },
            null);
  };
  
  function fillFutureArray() {
    
    for (var stage = 0; stage < w.getProp('numStages'); stage++) {

      for (var i=-5; i<fullData[stage].length;i++) {
        
        if(fullData[stage][i]===undefined)
          continue;
        
        var tel = fullData[stage][i].split(":");
        future[stage]["alt"].push([i, tel[1]]);
        future[stage]["vel"].push([i, tel[2]]);
      }
    }
    for (var stage = 0; stage < w.getProp('numStages'); stage++) { 
      
      $("#altitudeTel").html('ALTITUDE: 0 KM');
      $("#velocityTel").html('VELOCITY: 0 M/S');   

    }
  }
  
  function getTrackedStage() {
    return trackedStage;
  }

  function update() {

    var currentTime = Cesium.JulianDate.toDate(viewer.clock.currentTime);
    var time = (currentTime - w.getProp('launchTime')) / 1000;
    time = parseInt(time);
    
    if (time >= -10) { // only execute this code after T-00:00:10
      
      if(time===-10) {
        w.trackEntity(0);
      }

      var stage = getTrackedStage();
      for(var i=0;i<w.getProp('numStages');i++) {
        vel[i][0] = [];
        vel[i][1] = [];
        alt[i][0] = [];
        alt[i][1] = [];
      }
      for (var i = -5; i <= time; i++) {

        if (fullData[stage][i] === undefined) {
          if (fullData[stage - 1] !== undefined)
          {
            if (eventsData[stage - 1][i] !== undefined)
            {
              var tel = fullData[stage - 1][i].split(":");
              vel[stage][0].push([i, tel[2]]);
              vel[stage][1].push([i, tel[2]]);
              alt[stage][0].push([i, tel[1]]);
              alt[stage][1].push([i, tel[1]]);
            }
            else if (fullData[stage - 1][i] !== undefined)
            {
              var tel = fullData[stage - 1][i].split(":");
              vel[stage][0].push([i, tel[2]]);
              alt[stage][0].push([i, tel[1]]);
            }
          }
        }
        else if (eventsData[stage][i] !== undefined)
        {
          var tel = fullData[stage][i].split(":");
          vel[stage][0].push([i, tel[2]]);
          vel[stage][1].push([i, tel[2]]);
          alt[stage][0].push([i, tel[1]]);
          alt[stage][1].push([i, tel[1]]);
        }
        else
        {
          var tel = fullData[stage][i].split(":");
          vel[stage][0].push([i, tel[2]]);
          alt[stage][0].push([i, tel[1]]);
        }
      }
      
      if(fullData[stage] !== undefined && fullData[stage][time] !== undefined) 
      {
        var tel = fullData[stage][time].split(":");
        $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
        $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
      } 
      else if (fullData[stage - 1] !== undefined && fullData[stage - 1][time] !== undefined) 
      {
        var tel = fullData[stage - 1][time].split(":");
        $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
        $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
      } 
      else 
      {
        $("#altitudeTel").html('ALTITUDE: 0 KM');
        $("#velocityTel").html('VELOCITY: 0 M/S');
      }

      plot["altitude"].setData([
        {data: future[0]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: alt[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
        {data: alt[0][1], lines: {show: false}, points: {show: true}},
        {data: future[1]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: alt[1][0], lineWidth: 1, lines: {show: true, fill: stage===1}},
        {data: alt[1][1], color: '#ff0000', lines: {show: false}, points: {show: true}}
      ]);
      plot["altitude"].draw();

      plot["velocity"].setData([
        {data: future[0]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: vel[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
        {data: vel[0][1], lines: {show: false}, points: {show: true}},
        {data: future[1]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: vel[1][0], lineWidth: 1, lines: {show: true, fill: stage===1}},
        {data: vel[1][1], color: '#ff0000', lines: {show: false}, points: {show: true}}
      ]);
      plot["velocity"].draw();

    }

    setTimeout(update, 500);
  }

  /*
   * 
   *  Variables
   *  Viewers
   *  Views
   * 
   */

  var w = this;

  var fullData = []; // all data from output files - filled at start
  var eventsData = []; // all data from events files - filled at start
  var vel = []; // vel vs. time - grows in real time
  var alt = []; // alt v. time - grows in real time
  var future = []; // full alt and vel data
  var focusPoints = []; // timestamps for specific points of interest. everything is plotted at these times

  var entities = {}; // map of Cesium stage entities
  var plot = {};
  var max = [];

  var rand5 = 5 * 60 * 1000 * Math.random(); // 5 minute range

  var props = {};
  this.setProps = function (p) {
    props = p;
  };
  this.setProp = function (name, value) {
    props[name] = value;
  };
  this.getProp = function (name) {
    return props[name];
  };

  var viewer;

  var launchPadViews = {};

  /*
   setInterval(function() {
   var heading = 180.0*viewer.camera.heading/Math.PI;
   var pitch = 180.0*viewer.camera.pitch/Math.PI;
   var roll = 180.0*viewer.camera.roll/Math.PI;
   var matrix = viewer.camera.inverseViewMatrix;
   var pos1 = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]);
   var pos2 = matrix[14];
   var lat = 180.0*Math.atan(pos2/pos1)/Math.PI;
   var lon = 180.0*Math.atan(matrix[12]/matrix[13])/Math.PI;
   var radius = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]+matrix[14]*matrix[14]);
   var height = radius - 6378137;
   var x = 1;
   }, 10000);  
   */

  launchPadViews['LC4E'] = {
    destination: Cesium.Cartesian3.fromDegrees(-128.654, 27.955, 772000.0),
    orientation: {
      heading: Cesium.Math.toRadians(67.776),
      pitch: Cesium.Math.toRadians(-36.982),
      roll: Cesium.Math.toRadians(359.873)
    }
  };
  launchPadViews['LC40'] = {
    destination: Cesium.Cartesian3.fromDegrees(-76.162, 19.863, 480000.0),
    orientation: {
      heading: Cesium.Math.toRadians(356.939),
      pitch: Cesium.Math.toRadians(-26.816),
      roll: Cesium.Math.toRadians(359.795)
    }
  };
  launchPadViews['BOCA'] = {
    destination: Cesium.Cartesian3.fromDegrees(-93.885, 15.088, 882000.0),
    orientation: {
      heading: Cesium.Math.toRadians(326.332),
      pitch: Cesium.Math.toRadians(-36.270),
      roll: Cesium.Math.toRadians(359.831)
    }
  };

};