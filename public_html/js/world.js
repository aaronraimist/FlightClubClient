/* global Cesium */

angular.module('FlightClub').controller('WorldCtrl', function ($scope, $mdDialog, $location, $interval) {
    
    $scope.$emit('viewBroadcast', 'world');

    $scope.worldLoading = true;
    $scope.messageArray = [
        // p is probability of update being skipped until next interval
        { p: 0.8, message: 'Getting data from /r/SpaceX...'},
        { p: 0.4, message: 'Killing Church...'},
        { p: 0.3, message: 'YVAN EHT NIOJ'},
        { p: 0.8, message: 'Literally downloading the entire planet.'},
        { p: 0.2, message: 'Have some patience, dammit'},
        { p: 0.8, message: 'Downloading trajectory data files...'},
        { p: 0.2, message: 'Damn your internet is slow, man'},
        { p: 0.2, message: 'I hope your browser can handle this'},
        { p: 0.9, message: '<a href="https://www.patreon.com/flightclub">Click here to support me on Patreon!</a>'},
        { p: 0.0, message: 'Follow me on Twitter: <a href="https://www.twitter.com/decmurphy_">@decmurphy_</a>'}
    ];
        
    var startRoller = function () {
        var i = 0;
        $scope.missionLoadingMessage = $scope.messageArray[i++].message;
        var roller = $interval(function () {
            if (i === $scope.messageArray.length || !$scope.worldLoading)
                $interval.cancel(roller);
            else if (Math.random() > $scope.messageArray[i - 1].p)
                $scope.missionLoadingMessage = $scope.messageArray[i++].message;
        }, 350);
    };
    startRoller();

    $scope.$parent.toolbarTitle = "Flight Club | Live";
    var w;

    var stageColours = [];
    var fullData = []; // all data from output files - filled at start
    var eventsData = []; // all data from events files - filled at start
    var vel = []; // vel vs. time - grows in real time
    var alt = []; // alt v. time - grows in real time
    var future = []; // full alt and vel data
    var focusPoints = []; // timestamps for specific points of interest. everything is plotted at these times

    var plot = {};
    var max = [];

    var offset;
    var rand5 = 1 * 60 * 1000 * Math.random(); // 1 minute range

    $scope.countdown = $scope.finished = false;
    $scope.cesiumShow = $scope.sidebarShow = false;

    $scope.clickStage = function (stage) {
        w.trackEntity(stage);
        plot["altitude"].getOptions().yaxes[0].max = max[stage]["altitude"];
        plot["altitude"].setupGrid();
        plot["velocity"].getOptions().yaxes[0].max = max[stage]["velocity"];
        plot["velocity"].setupGrid();
    };

    $scope.changeView = function () {

        switch (w.getProp('view')) {
            case 'space':
                w.setProp('view', 'earth');
                $location.search('view', 'earth');
                offset = 0;
                break;
            case 'earth':
            default:
                w.setProp('view', 'space');
                $location.search('view', 'space');
                offset = 17;
                break;
        }
        w.viewer.entities.removeAll();
        $scope.loadDataAndPlot();

    };

    $scope.setClock = function (world) {

        var _second = 1000;
        var _minute = _second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;

        if ($scope.cesiumShow && world !== undefined) {
            if (world.viewer !== undefined) {
                var now = Cesium.JulianDate.toDate(world.viewer.clock.currentTime);
                var distance = $scope.launchTime - now;
                var sign = distance > 0 ? '-' : '+';
                var days = Math.floor(distance / _day);
                var hours = Math.abs(Math.floor((distance % _day) / _hour));
                var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
                var seconds = Math.abs(Math.floor((distance % _minute) / _second));

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

                if (world.getProp('w') !== '2') {
                    if (Math.abs((_minute - rand5) - distance) < 1000)  // polls for aborts between T-5 -> T-0
                        $scope.pollLaunchTime();
                    if (Math.abs(rand5 + distance) < 1000) // poll for aborts between T-0 -> T+5
                        $scope.pollLaunchTime();
                    if (Math.abs((90 * _minute) + distance) < 1000) // plots -> over at T+1:30
                        loadVars(true);
                }

                $scope.clock = 'T' + sign + hours + ':' + minutes + ':' + seconds;
            }

        } else if ($scope.countdown) {

            var now = new Date();
            var distance = $scope.launchTime - now;
            var sign = distance > 0 ? '-' : '+';
            var days = Math.floor(distance / _day);
            var hours = Math.abs(Math.floor((distance % _day) / _hour));
            var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
            var seconds = Math.abs(Math.floor((distance % _minute) / _second));

            $scope.days = days + ' day' + ((days !== 1) ? 's' : '');
            $scope.hours = hours + ' hour' + ((hours !== 1) ? 's' : '');
            $scope.minutes = minutes + ' minute' + ((minutes !== 1) ? 's' : '');
            $scope.seconds = seconds + ' second' + ((seconds !== 1) ? 's' : '');

            //if (Math.abs((59 * _minute - rand5) - distance) < 1000) // clock -> plots limit between T-59 -> T-54
            if (Math.abs((60 * _minute) - distance) < 1000) // clock -> plots limit at T-60
                loadVars(true);

        }
    };

    $scope.pollLaunchTime = function () {
        $scope.$parent.httpRequest('/missions/' + w.getProp('code'), 'GET', null,
                function (data) {

                    data = JSON.parse(data);

                    var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
                    var newTime = Date.parse(tempDate);

                    if (newTime !== $scope.launchTime) {
                        // if scrubbed until tomorrow, full reset. else just reset clock
                        if (newTime - $scope.launchTime > 24 * 60 * 60 * 1000)
                            $scope.fillData(data);
                        else {
                            $scope.launchTime = newTime;
                            $scope.getHazardMap();
                        }
                    }
                },
                null);
    };

    angular.element(document).ready(function () {

        var queryString = window.location.search.substring(1);
        if (queryString.indexOf('&amp;') !== -1) {
            window.location = window.location.href.split('&amp;').join('&');
        }
        $scope.queryParams = $scope.$parent.parseQueryString(queryString);
        loadVars();

        // world object doesn't need to be created unless using Cesium. can put launchtime as its own variable
        // then can move these getScript+new world() calls later in the code to only execute if showing Cesium.

        switch ($scope.queryParams['view']) {
            case 'space':
                offset = 17;
                break;
            case 'earth':
            default:
                offset = 0;
                break;
        }

        $interval(function () {
            $scope.setClock(w);
        }, 500);
        
    });
    
    var loadVars = function(reload) {

        $scope.$parent.httpRequest('/missions/' + $scope.queryParams['code'], 'GET', null,
                function (res) {
                    var data = JSON.parse(res);
                    if (data.Mission !== undefined && $scope.queryParams['id'] === undefined) {
                        $scope.queryParams['id'] = data.Mission.livelaunch;
                    }
                    if (reload) {
                        $scope.worldLoading = true;
                        startRoller();
                    }
                    
                    $scope.fillData(data);
                }
        );
        
    };

    $scope.fillData = function (data) {

        $scope.missionName = data.Mission.description;
        $scope.missionCode = $scope.queryParams['code'];
        $scope.numStages = data.Mission.Vehicle.Stages.length;

        var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
        $scope.launchTime = Date.parse(tempDate);

        var now = new Date();
        var timeUntilLaunch = $scope.launchTime - now;

        $scope.cesiumShow = $scope.countdown = $scope.finished = $scope.sidebarShow = false;
        if ($scope.queryParams['w'] === '2') {

            $scope.loadCesium(function () {
                $scope.loadDataAndPlot();
            });

        } else if ($scope.queryParams['w'] === '1') {
            
            if (timeUntilLaunch > 1 * 60 * 60 * 1000) {
                $scope.countdown = true;
                $scope.worldLoading = false;
            } else if (timeUntilLaunch < -14 * 60 * 1000) {
                $scope.finished = true;
                $scope.worldLoading = false;
            } else {
                $scope.loadCesium(function () {
                    
                    var animation = document.getElementsByClassName("cesium-viewer-animationContainer")[0];
                    animation.className += " hide";
                    var timeline = document.getElementsByClassName("cesium-viewer-timelineContainer")[0];
                    timeline.className += " hide";

                    w.setCameraLookingAt(data.Mission.launchsite);
                    $scope.loadDataAndPlot();
                });
            }
        } else if ($scope.queryParams['id'] !== undefined) {

            $scope.loadCesium(function () {

                var animation = document.getElementsByClassName("cesium-viewer-animationContainer")[0];
                animation.className += " hide";
                var timeline = document.getElementsByClassName("cesium-viewer-timelineContainer")[0];
                timeline.className += " hide";
                
                $scope.loadDataAndPlot();
                if ($scope.queryParams['view'] !== 'space')
                    w.setCameraLookingAt(data.Mission.launchsite);
            });

        } else {
            $scope.loadCesium();
        }
    };

    $scope.loadFlot = function (otherFunction) {
        $.getScript("js/flot.min.js", function () {
            
            var fullWidth = $(document.body)[0].clientWidth;
            var width = fullWidth <= 456 ? fullWidth - 56 : fullWidth >= 960 ? 400 : 320;

            $("#cesiumContainer").width((fullWidth - width) + 'px');

            for (var stage = 0; stage < 2; stage++) {
                $scope.initialisePlot("altitude", stage);
                $scope.initialisePlot("velocity", stage);
            }

            if (otherFunction)
                otherFunction();
        });
        $scope.sidebarShow = true;
    };

    $scope.initialisePlot = function (element, stage) {

        var fullWidth = $(document.body)[0].clientWidth;
        var width = fullWidth <= 456 ? fullWidth - 56 : fullWidth >= 960 ? 400 : 320;
        width -= 32; // to account for layout-padding

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

    $scope.loadCesium = function (otherFunction) {

        window.CESIUM_BASE_URL = '//cesiumjs.org/releases/1.28/Build/Cesium/';
        $.getScript("//cesiumjs.org/releases/1.28/Build/Cesium/Cesium.js", function ()
        {
            $scope.worldLoading = false;
            Cesium.BingMapsApi.defaultKey = 'Atr1lJvbFdMUnJ6fw4qGKDcZuEjzVRh-6WLmrRZDcCggpZIPH9sdEyUWGWXO1kPc';

            w = new world();
            w.plottedTime = -5;

            w.setProps($scope.queryParams);

            $scope.cesiumShow = true;
            $scope.$parent.toolbarClass = "hide";

            var launchDate = new Date($scope.launchTime);
            var end = new Date($scope.launchTime + 600e3);
            var now;
            if (w.getProp('w') === '1')
                now = new Date();
            else
                now = new Date($scope.launchTime - 30e3);

            w.entities = [];
            w.viewer = new Cesium.Viewer('cesiumContainer', {
                timeline: true,
                animation: true,
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
                }),
                terrainProvider: new Cesium.CesiumTerrainProvider({
                    url: '//assets.agi.com/stk-terrain/world',
                    requestWaterMask: false,
                    requestVertexNormals: false
                })

            });

            /* add to revert to old (include sun) */
            w.viewer.scene.globe.enableLighting = true;
            /**/

            w.viewer.timeline.updateFromClock();
            w.viewer.timeline.zoomTo(w.viewer.clock.startTime, w.viewer.clock.stopTime);

            if (otherFunction)
                otherFunction();
        });
    };

    $scope.loadDataAndPlot = function () {

        $scope.stageMap = {};
        for (var i = 0; i < $scope.numStages; i++) {

            $scope.stageMap[i] = {id: i};
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

            max[i] = {};
        }

        stageColours[0] = '#ff0000';
        stageColours[1] = '#8B8BE5';
        stageColours[2] = '#00ff00';

        $scope.getHazardMap();
    };

    $scope.getHazardMap = function () {

        w.entities = [];
        w.viewer.entities.removeAll();

        var url = $scope.$parent.server + '/resource/' + $scope.queryParams['code'] + '.hazard.txt';
        $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
            xhrFields: {withCredentials: false},
            success: successfn,
            error: errorfn
        });

        function successfn(data) {

            var lines = data.split("\n");
            var array = [];
            for (var i = 0; i < lines.length; i++) {

                if (lines[i].indexOf(";") === -1) {
                    if (array.length > 0) {
                        w.viewer.entities.add({
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

                if (lines[i].indexOf(";") > -1) {
                    var data = lines[i].split(";");
                    array.push(data[0], data[1]);
                }
            }

            $scope.getEventsFile(0);
        }

        function errorfn(data) {
            $scope.getEventsFile(0);
        }
    };

    $scope.getDataFile = function (stage) {

        var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + stage + '.dat';
        $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
            xhrFields: {withCredentials: false},
            success: successfn,
            error: errorfn
        });

        function successfn(data) {

            var lines = data.split("\n");

            var p_stage = new Cesium.SampledPositionProperty();
            var trajectory = new Cesium.SampledPositionProperty();

            var launchDate = new Date($scope.launchTime);

            var start = Cesium.JulianDate.fromDate(launchDate);
            var stop = Cesium.JulianDate.addSeconds(start, 600000, new Cesium.JulianDate());

            var t = 0;
            fullData[stage] = [];
            max[stage] = [];
            for (var i = 2; i < lines.length; i++) {

                if (lines[i] === "")
                    continue;

                var data = lines[i].split(";");
                if(data.length === 1)
                    data = lines[i].split("\t");
                fullData[stage][parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]) + ":" + parseFloat(data[21]) * Math.PI / 180 + ":" + (parseFloat(data[16]) - 90) * Math.PI / 180;

                var focus = false;
                var ign = false;
                for (var j = 1; j < focusPoints.length; j++) {
                    if (Math.abs(data[0] - focusPoints[j][0]) <= 0.5) {
                        focus = true;
                        ign = focusPoints[j - 1][1] > 0.1;
                        break;
                    }
                }

                if (!focus && data[0] > 1000 && i % 100 !== 0)
                    continue;

                if (t < 600 && parseFloat(data[4]) > max[stage]["altitude"] || max[stage]["altitude"] === undefined)
                    max[stage]["altitude"] = Math.ceil(parseFloat(data[4]) / 100) * 100;
                if (t < 600 && parseFloat(data[5]) > max[stage]["velocity"] || max[stage]["velocity"] === undefined)
                    max[stage]["velocity"] = Math.ceil(parseFloat(data[5]) / 500) * 500;

                t = parseInt(data[0]);
                var x = parseFloat(data[1 + offset]);
                var y = parseFloat(data[2 + offset]);
                var z = parseFloat(data[3 + offset]);
                var h = parseFloat(data[4]) * 1e3;

                var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
                var lon = 180 * Math.atan2(y, x) / Math.PI;

                var time = Cesium.JulianDate.addSeconds(start, t, new Cesium.JulianDate());
                var position = Cesium.Cartesian3.fromDegrees(lon, lat, h);
                trajectory.addSample(time, position);
                p_stage.addSample(time, position);

                if (focus) {
                    var e = w.viewer.entities.add({
                        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
                        position: trajectory,
                        path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: ign ? Cesium.Color.RED : Cesium.Color.YELLOW}), width: 8}
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

            var ign = focusPoints[focusPoints.length - 1][1] > 0.1;
            var e = w.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
                position: trajectory,
                path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: ign ? Cesium.Color.RED : Cesium.Color.YELLOW}), width: 8}
            });
            e.position.setInterpolationOptions({
                interpolationDegree: 5,
                interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
            });

            if (w.getProp('w') !== undefined) {
                var pinBuilder = new Cesium.PinBuilder();
                w.entities[stage] = w.viewer.entities.add({
                    position: p_stage,
                    path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: Cesium.Color.TRANSPARENT}), width: 1},
                    billboard: {
                        image: pinBuilder.fromText(stage + 1, Cesium.Color.ROYALBLUE, 32).toDataURL(),
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                    }
                });
                w.entities[stage].position.setInterpolationOptions({
                    interpolationDegree: 5,
                    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
                });
            }

            $scope.getEventsFile(stage + 1);
        }

        function errorfn(data) {
            console.log(data);
        }
    };

    $scope.getEventsFile = function (stage) {
        var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + stage + '_events.dat';
        $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
            xhrFields: {withCredentials: false},
            success: successfn,
            error: errorfn
        });

        function successfn(data) {

            if (data.indexOf("html") !== -1) {
                $scope.start();
            } else {
                
                var lines = data.split("\n");
                eventsData[stage] = [];

                focusPoints = [];
                for (var i = 1; i < lines.length; i++) {
                    var data = lines[i].split(";");
                    if(data.length === 1)
                        data = lines[i].split("\t");

                    if (data.length === 1)
                        continue;

                    eventsData[stage][parseInt(data[0])] = parseFloat(data[12]); // eventsData[time] = throttle
                    focusPoints.push([parseFloat(data[0]), parseFloat(data[12])]);

                    var x = parseFloat(data[1 + offset]); //offset=17
                    var y = parseFloat(data[2 + offset]);
                    var z = parseFloat(data[3 + offset]);
                    var h = parseFloat(data[4]) * 1e3;

                    var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
                    var lon = 180 * Math.atan2(y, x) / Math.PI;

                    w.viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(lon, lat, h),
                        point: {pixelSize: 5, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.RED, outlineWidth: 1}
                    });
                }

                $scope.getDataFile(stage);
            }
        }

        function errorfn(data) {
            console.log(data);
        }
    };

    $scope.start = function () {

        if ($scope.queryParams['w'] !== undefined) {
            $scope.fillFutureArray();

            // just load up the futures
            $scope.loadFlot(function () {
                var altData = [], velData = [];
                for (var s = 0; s < $scope.numStages; s++) {
                    altData.push({data: future[s]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}});
                    velData.push({data: future[s]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}});
                }

                plot["altitude"].setData(altData);
                plot["altitude"].draw();

                plot["velocity"].setData(velData);
                plot["velocity"].draw();
            });

            // track entity here so plot resize doesn't throw any errors before T-10s
            w.trackEntity(0);
            $interval(function() {
                $scope.update();
            }, 1000);
        }
        /*
         setInterval(function () {
         var heading = 180.0 * w.viewer.camera.heading / Math.PI;
         var pitch = 180.0 * w.viewer.camera.pitch / Math.PI;
         var roll = 180.0 * w.viewer.camera.roll / Math.PI;
         var matrix = w.viewer.camera.inverseViewMatrix;
         var pos1 = Math.sqrt(matrix[12] * matrix[12] + matrix[13] * matrix[13]);
         var pos2 = matrix[14];
         var lat = 180.0 * Math.atan(pos2 / pos1) / Math.PI;
         var lon = -90.0-(180.0 * Math.atan(matrix[12] / matrix[13]) / Math.PI);
         var radius = Math.sqrt(matrix[12] * matrix[12] + matrix[13] * matrix[13] + matrix[14] * matrix[14]);
         var height = radius - 6378137;
         console.log("long/lat/height =    " + lon + "/" + lat + "/" + height);
         console.log("heading/pitch/roll = " + heading + "/" + pitch + "/" + roll);
         }, 5000);
         */
    };

    $scope.update = function () {

        var currentTime = Cesium.JulianDate.toDate(w.viewer.clock.currentTime);
        var time = (currentTime - $scope.launchTime) / 1000;
        time = parseInt(time);

        if (time >= -10) { // only execute this code after T-00:00:10

            if (w.getTrackedStage() === undefined) {
                $scope.clickStage(0);
            }

            var stage = w.getTrackedStage();

            if (fullData[stage] !== undefined && fullData[stage][time] !== undefined)
            {
                var tel = fullData[stage][time].split(":");
                $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
                $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
            } else if (fullData[stage - 1] !== undefined && fullData[stage - 1][time] !== undefined)
            {
                var tel = fullData[stage - 1][time].split(":");
                $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
                $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
            } else
            {
                $("#altitudeTel").html('ALTITUDE: 0 KM');
                $("#velocityTel").html('VELOCITY: 0 M/S');
            }

            if (time <= 600) {

                var altData = [];
                var velData = [];
                for (var s = 0; s < $scope.numStages; s++) {
                    for (var i = w.plottedTime; i <= time; i++) {

                        if (fullData[s][i] === undefined) {
                            if (fullData[s - 1] !== undefined && fullData[s - 1][i] !== undefined)
                            {
                                var tel = fullData[s - 1][i].split(":");
                                w.entities[s].orientation = Cesium.Transforms.headingPitchRollQuaternion(w.entities[s].position.getValue(time), tel[3], tel[4], 0);
                                vel[s][0].push([i, tel[2]]);
                                alt[s][0].push([i, tel[1]]);

                                if (eventsData[s - 1][i] !== undefined)
                                {
                                    vel[s][1].push([i, tel[2]]);
                                    alt[s][1].push([i, tel[1]]);
                                }
                            }
                        } else
                        {
                            var tel = fullData[s][i].split(":");
                            w.entities[s].orientation = Cesium.Transforms.headingPitchRollQuaternion(w.entities[s].position.getValue(time), tel[3], tel[4], 0);
                            vel[s][0].push([i, tel[2]]);
                            alt[s][0].push([i, tel[1]]);

                            if (eventsData[s][i] !== undefined)
                            {
                                vel[s][1].push([i, tel[2]]);
                                alt[s][1].push([i, tel[1]]);
                            }
                        }
                    }

                    altData.push({data: future[s]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}});
                    altData.push({data: alt[s][0], color: stageColours[s], lineWidth: 1, lines: {show: true, fill: stage === s}});
                    altData.push({data: alt[s][1], lines: {show: false}, points: {show: true}});

                    velData.push({data: future[s]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}});
                    velData.push({data: vel[s][0], color: stageColours[s], lineWidth: 1, lines: {show: true, fill: stage === s}});
                    velData.push({data: vel[s][1], lines: {show: false}, points: {show: true}});

                }
                w.plottedTime = time + 1;

                plot["altitude"].setData(altData);
                plot["altitude"].draw();

                plot["velocity"].setData(velData);
                plot["velocity"].draw();
            }
        }

    };


    $scope.fillFutureArray = function () {

        for (var stage = 0; stage < $scope.numStages; stage++) {
            future[stage] = [];
            future[stage]["alt"] = [];
            future[stage]["vel"] = [];
            for (var i = -5; i < 600; i++) {

                if (fullData[stage][i] === undefined)
                    continue;

                var tel = fullData[stage][i].split(":");
                future[stage]["alt"].push([i, tel[1]]);
                future[stage]["vel"].push([i, tel[2]]);
            }
        }
        for (var stage = 0; stage < $scope.numStages; stage++) {

            $("#altitudeTel").html('ALTITUDE: 0 KM');
            $("#velocityTel").html('VELOCITY: 0 M/S');

        }
    };

    $scope.plotResize = function (considerSidebar) {

        for (var stage = 0; stage < 2; stage++) {
            var width = fullWidth <= 456 ? fullWidth - 56 : fullWidth >= 960 ? 400 : 320;
            $("#altitudePlot").width(width);
            $("#velocityPlot").width(width);
            $("#altitudePlot").height(width / 1.6);
            $("#velocityPlot").height(width / 1.6);
        }
        var w2;
        var fullWidth = $(document.body)[0].clientWidth;
        if (considerSidebar) {
            $scope.initialisePlot("altitude", w.getTrackedStage());
            $scope.initialisePlot("velocity", w.getTrackedStage());
            var width = fullWidth < 456 ? fullWidth - 56 : fullWidth > 960 ? 400 : 320;
            w2 = fullWidth - width;
        } else {
            w2 = fullWidth;
        }
        $("#cesiumContainer").width(w2);
        
    };

    $(window).resize(function () {
        $scope.plotResize($(document.body)[0].clientWidth >= 960);
    });

    ////////////////////////////////////////////////////////////////////////////

    function world() {

        this.setCameraLookingAt = function (site) {
            w.viewer.camera.flyTo(launchPadViews[site]);
        };

        var trackedStage = 0;
        this.trackEntity = function (stage) {
            if (w.viewer.trackedEntity !== w.entities[stage]) {
                w.trackedStage = stage;
                w.viewer.trackedEntity = w.entities[stage];
                w.viewer.camera.zoomOut();
            }
        };

        this.getTrackedStage = function () {
            return w.trackedStage;
        };

        var w = this;
        var entities; // map of Cesium stage entities

        var props = {};
        this.setProps = function (p) {
            w.props = p;
        };
        this.setProp = function (name, value) {
            w.props[name] = value;
        };
        this.getProp = function (key) {
            if (w.props.hasOwnProperty(key)) {
                return w.props[key];
            }
            return undefined;
        };
        this.getProps = function () {
            return w.props;
        };

        var viewer;

        var launchPadViews = {};

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
        launchPadViews['K39A'] = launchPadViews['LC40'];
        launchPadViews['BOCA'] = {
            destination: Cesium.Cartesian3.fromDegrees(-94.706, 15.725, 1108500.0),
            orientation: {
                heading: Cesium.Math.toRadians(355.6),
                pitch: Cesium.Math.toRadians(-43.032),
                roll: Cesium.Math.toRadians(359.8)
            }
        };
        launchPadViews['BOWT'] = {
            destination: Cesium.Cartesian3.fromDegrees(-103.824, 21.348, 450395.0),
            orientation: {
                heading: Cesium.Math.toRadians(357.51),
                pitch: Cesium.Math.toRadians(-21.66),
                roll: Cesium.Math.toRadians(359.93)
            }
        };

    }
    
    $scope.openCesiumCreditsDialog = function ($event) {
        $mdDialog.show({
            controller: function () {
                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };
            },
            contentElement: '#myDialog',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true
        });
    };
});
