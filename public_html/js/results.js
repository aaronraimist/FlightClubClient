/* global Plotly */

angular.module('FlightClub').controller('ResultsCtrl', function ($scope, $mdDialog, $cookies, $interval) {

    $scope.$emit('viewBroadcast', 'results');

    $scope.$parent.toolbarTitle = 'Flight Club | Results';
    $scope.loadPos = 30;
    $scope.loadMessage = "Building plots...";    

    $scope.messageArray = [
        // p is probability of update being skipped until next interval
        { p: 0.2, message: 'Engine Chill'},
        { p: 0.2, message: 'Terminal Count'},
        { p: 0.2, message: 'Main Engine Start'},
        { p: 0.5, message: 'Liftoff!'},
        { p: 0.3, message: 'Vehicle is supersonic'},
        { p: 0.3, message: 'Vehicle is passing through Max Q'},
        { p: 0.6, message: 'MECO!'},
        { p: 0.3, message: 'Stage separation. Good luck Stage 1...'},
        { p: 0.5, message: 'Upper stage ignition'},
        { p: 0.5, message: 'Boostback looks good'},
        { p: 0.4, message: 'Entry burn is complete'},
        { p: 0.3, message: 'Landing burn has begun'},
        { p: 0.6, message: 'LZ-1, The Falcon has landed'},
        { p: 0.5, message: 'We have SECO!'},
        { p: 0.9, message: '<a href="https://www.patreon.com/flightclub">Click here to support me on Patreon!</a>'},
        { p: 0.0, message: 'Follow me on Twitter: <a href="https://www.twitter.com/decmurphy_">@decmurphy_</a>'}        
    ];
    
    var i = 0;
    $scope.missionLoadingMessage = $scope.messageArray[i++].message;
    var roller = $interval(function() {
        if (i === $scope.messageArray.length || !$scope.isLoading)
            $interval.cancel(roller);
        else if (Math.random() > $scope.messageArray[i-1].p)
            $scope.loadMessageSecondary = $scope.messageArray[i++].message;
    }, 350);
    
    $scope.animate_rocket = function () {

        var windowWidth = $(document).width();
        var margin = 0.01 * $scope.loadPos * windowWidth + 'px';
        if ($scope.loadPos < 99.5) {
            $scope.loadPos += 0.5 * (100 - $scope.loadPos);
            $("#rocket").animate(
                    {marginLeft: margin},
                    1500,
                    "linear",
                    $scope.animate_rocket
                    );
        } else {
            $scope.loadPos = 30;
        }

    };

    $scope.load = function (queryString) {

        if (queryString.indexOf('&amp;') !== -1) {
            window.location = window.location.href.split('&amp;').join('&');
        }
        $scope.queryString = queryString;
        $scope.queryParams = $scope.$parent.parseQueryString(queryString);
        $scope.$parent.httpRequest('/simulator/results?' + queryString, 'GET', null,
                function (data) {
                    
                    var fileMap = new Object();
                    var files = data.Mission.Output.Files;
                    $.each(files, function (key, val)
                    {
                        fileMap[val.desc] = $scope.$parent.client + val.url;
                    });

                    var warningsFile = fileMap['warnings'];
                    $.get(warningsFile, function (txt) {
                        var warnings = txt.split(";");

                        $scope.warnings = [];
                        for (var i = 0; i < warnings.length; i++) {
                            if (warnings[i].length > 0)
                                $scope.warnings.push(warnings[i]);
                        }

                    });

                    var telemetryFile = fileMap['telemetry'];
                    $.get(telemetryFile, function (txt) {

                        var lines = txt.split("\n");
                        $scope.landing = [];
                        for (var i = 0; i < lines.length; i++)
                        {
                            // time-event map
                            if (i === 0) {
                                $scope.events = [];
                                var event = lines[i].split(';');
                                for (var j = 0; j < event.length; j++) {
                                    var pair = event[j].split(':');
                                    if (pair[0] !== undefined && pair[1] !== undefined) {
                                        $scope.events.push({when: pair[0], what: pair[1]});
                                    }
                                }
                            } else {
                                var map = lines[i].split(':');
                                var infoMap = map[1].split(';');

                                switch (map[0]) {
                                    case 'Landing':
                                        for (var j = 0; j < infoMap.length; j++) {
                                            var pair = infoMap[j].split('=');
                                            if (pair[0] !== undefined && pair[1] !== undefined) {
                                                $scope.landing.push({when: pair[0], what: pair[1]});
                                            }
                                        }
                                        break;
                                    case 'Orbit':
                                        $scope.orbit = [];
                                        for (var j = 0; j < infoMap.length; j++) {
                                            var pair = infoMap[j].split('=');
                                            if (pair[0] !== undefined && pair[1] !== undefined) {
                                                $scope.orbit.push({when: pair[0], what: pair[1]});
                                            }
                                        }
                                        break;
                                }
                            }
                        }
                    });
                }
        );
        $scope.$parent.httpRequest('/missions/' + $scope.queryParams['code'], 'GET', null,
                function (res) {
                    var data = JSON.parse(res);
                    if (data.Mission !== undefined) {
                        if ($scope.queryParams['id'] === undefined) {
                            $scope.queryParams['id'] = data.Mission.livelaunch;
                        }
                    }
                    $scope.missionName = data.Mission.description;
                    $scope.getDataFile(0);

                }
        );
    };

    $scope.animate_rocket();
    var formHash = window.location.hash.substring(1);
    var queryString = window.location.search.substring(1);

    if (formHash) {
        $scope.loadMessage = "Calculating trajectory...";    
        var formData = window.atob(formHash);

        $scope.$parent.httpRequest('/simulator/new', 'POST', formData,
                function (data) {
                    if (data.Mission.success === true) {
                        var queryString = data.Mission.output.split('?')[1];
                        $scope.failureMode = data.Mission.failureMode;
                        $scope.loadMessage = "Building plots...";
                        window.history.pushState({}, "", '/results/?' + queryString);
                        $scope.load(queryString);
                        $scope.$apply();
                    } else {
                        var errorsHash = window.btoa(JSON.stringify(data));
                        window.location = $scope.$parent.client + '/error/#' + errorsHash;
                    }
                },
                function (data) {
                    var errors, errorsHash = '';
                    if (data.responseJSON !== undefined) {
                        errors = data.responseJSON.Mission.errors;
                        errorsHash = window.btoa(errors);
                    }

                    window.location = $scope.$parent.client + '/error/#' + errorsHash;
                });    
    } else if (queryString) {
        $scope.load(queryString);
    }

    var PLOTS = ['altitude1', 'profile1', 'inclination', 
        'velocity1', 'prop', 'phase1',
         'throttle', 'accel1', 'q',
        'aoa', 'aov', 'aop', 
        'total-dv', 'drag', 'thrust-coeff'];
    $scope.plotTiles = (function () {
        var tiles = [];
        for (var i = 0; i < PLOTS.length; i++) {
            tiles.push({title: PLOTS[i]});
        }
        return tiles;
    })();

    $scope.isLoading = true;
    $scope.fullData = [];
    $scope.eventsData = [];
    $scope.stageMap = [];
    $scope.numCols = 23;
    $scope.overrideAttempted = false;

    //////////////////////////////////////

    $scope.goToWorld = function () {
        window.location = "/world?view=earth&" + window.location.search.substring(1);
    };

    $scope.goToLive = function () {
        $scope.$parent.redirect("/world?w=1&code=" + $scope.queryParams['code']);
    };

    $scope.overrideLive = function () {
        if ($cookies.get('authToken') === undefined)
            return;

        var queryString = window.location.search.substring(1);
        queryString += '&auth=' + $cookies.get('authToken');
        $scope.$parent.httpRequest('/live/init?' + queryString, 'GET', null,
                function (data) {
                    $scope.overrideStatus = data.Success ? "check" : "close";
                    $scope.overrideAttempted = true;
                    $scope.$apply();
                },
                function (data) {
                    $scope.overrideStatus = "close";
                    $scope.overrideAttempted = true;
                    $scope.$apply();
                });
    };

    $scope.getDataFile = function (stage) {
        var url = $scope.$parent.client + '/output/' + $scope.queryParams['id'] + '_' + stage + '.dat';
        $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
            xhrFields: {withCredentials: false},
            success: successfn,
            error: errorfn
        });

        function successfn(data) {
            
            if(data.indexOf("html") !== -1) {
                $scope.initialisePlots();
            } else {
                var lines = data.split("\n");
                $scope.stageMap.push({id: stage, name: lines[0].split("#")[1]});

                $scope.fullData[stage] = [];
                for (var j = 0; j <= $scope.numCols; j++) {
                    $scope.fullData[stage][j] = [];
                    for (var i = 2; i < lines.length; i++) {
                        var data = lines[i].split(";");
                        if(data.length === 1)
                            data = lines[i].split("\t");
                        $scope.fullData[stage][j][i] = parseFloat(data[j]);
                    }
                }
                $scope.getEventsFile(stage);
            }
        }

        function errorfn(data) {
            console.log(data);
        }
    };

    $scope.getEventsFile = function (stage) {
        var url = $scope.$parent.client + '/output/' + $scope.queryParams['id'] + '_' + stage + '_events.dat';
        $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
            xhrFields: {withCredentials: false},
            success: successfn,
            error: errorfn
        });

        function successfn(data) {
            var lines = data.split("\n");

            $scope.eventsData[stage] = [];
            for (var j = 0; j <= $scope.numCols; j++) {
                $scope.eventsData[stage][j] = [];
                for (var i = 1; i < lines.length; i++) {
                    var data = lines[i].split(";");
                    if(data.length === 1)
                        data = lines[i].split("\t");
                    $scope.eventsData[stage][j][i] = parseFloat(data[j]);
                }
            }
            $scope.getDataFile(stage + 1);
        }

        function errorfn(data) {
            console.log(data);
        }
    };

    $scope.plotMap = [];
    $scope.initialisePlots = function () {
        
        var allStages = [], lowerStages = [];
        $scope.stageMap.forEach(function(el, i) {
            allStages.push(i);
            if(i !== $scope.stageMap.length-1)
                lowerStages.push(i);
        });

        $scope.plotMap.push({id: 'altitude1', stages: allStages, title: "Altitude", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear"},
            y: {axis: 4, label: "Altitude (km)", type: "linear"}});
        $scope.plotMap.push({id: 'profile1', stages: allStages, title: "Profile", events: true,
            x: {axis: 6, label: "Downrange (km)", type: "linear"},
            y: {axis: 4, label: "Altitude (km)", type: "linear"}});
        $scope.plotMap.push({id: 'velocity1', stages: allStages, title: "Velocity", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear"},
            y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
        $scope.plotMap.push({id: 'prop', stages: allStages, title: "Propellant Mass", events: false,
            x: {axis: 0, label: "Time (s)", type: "log"},
            y: {axis: 8, label: "Mass (t)", type: "log"}});
        $scope.plotMap.push({id: 'phase1', stages: lowerStages, title: "Booster Phasespace", events: true,
            x: {axis: 4, label: "Altitude (km)", type: "linear"},
            y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
        $scope.plotMap.push({id: 'total-dv', stages: allStages, title: "Total dV Expended", events: false,
            x: {axis: 0, label: "Time (s)", type: "log"},
            y: {axis: 9, label: "dV (m/s)", type: "log"}});
        $scope.plotMap.push({id: 'q', stages: lowerStages, title: "Aerodynamic Pressure", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear"},
            y: {axis: 7, label: "Pressure (kN/m^2)", type: "linear"}});
        $scope.plotMap.push({id: 'throttle', stages: allStages, title: "Throttle", events: false,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 12, label: "Throttle", type: "linear"}});
        $scope.plotMap.push({id: 'accel1', stages: allStages, title: "Acceleration", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 13, label: "Acceleration (g)", type: "linear"}});
        $scope.plotMap.push({id: 'aoa', stages: allStages, title: "Angle of Attack", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 14, label: "Angle (degrees)", type: "linear", range: [-180, 180]}});
        $scope.plotMap.push({id: 'aov', stages: allStages, title: "Velocity Angle", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 15, label: "Angle (degrees)", type: "linear", range: [-180, 180]}});
        $scope.plotMap.push({id: 'aop', stages: allStages, title: "Pitch Angle", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 16, label: "Angle (degrees)", type: "linear", range: [-180, 180]}});
        $scope.plotMap.push({id: 'drag', stages: lowerStages, title: "Drag Coefficient", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 17, label: "Cd", type: "linear"}});
        $scope.plotMap.push({id: 'thrust-coeff', stages: lowerStages, title: "Thrust Coefficient", events: true,
            x: {axis: 0, label: "Time (s)", type: "linear", range: [0, 1000]},
            y: {axis: 22, label: "Ct", type: "linear"}});
        $scope.plotMap.push({id: 'inclination', stages: allStages, title: "Inclination", events: false,
            x: {axis: 0, label: "Time (s)", type: "linear"},
            y: {axis: 23, label: "Incl (degrees)", type: "linear", range: [-180, 180]}});

        $scope.isLoading = false;        
        $scope.$apply(); // removing this fucks up the plot sizes in initialiePlot2()
        
        for (var i = 0; i < $scope.plotMap.length; i++) {
            $scope.initialisePlot2($scope.plotMap[i]);
        }
        
        if(!$scope.failureMode)
            setTimeout(askForSupport, 1000);
        else {
            $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Mission Failure!')
                    .textContent($scope.failureMode)
                    .ariaLabel('mission failure reason')
                    .ok('Ok')
                );
        }
        
    };

    $scope.initialisePlot2 = function (plot) {

        var data = [];
        for (var i = 0; i < plot.stages.length; i++) {
            var s = plot.stages[i];
            if ($scope.fullData[s] !== undefined) {
                data.push({
                    x: $scope.fullData[s][plot.x.axis],
                    y: $scope.fullData[s][plot.y.axis],
                    mode: 'lines',
                    name: $scope.stageMap[s].name
                });
            }
        }
        if(plot.events) {
            for (var i = 0; i < plot.stages.length; i++) {
                var s = plot.stages[i];
                if ($scope.fullData[s] !== undefined) {
                    data.push({
                        x: $scope.eventsData[s][plot.x.axis],
                        y: $scope.eventsData[s][plot.y.axis],
                        mode: 'markers',
                        showlegend: false,
                        name: $scope.stageMap[s].name + ' Event'
                    });
                }
            }
        }

        var fontColor = $scope.$parent.theme==='fc_dark' ? '#fafafa' : '#181c1f';
        var bgColor = $scope.$parent.theme==='fc_dark' ? '#303030' : '#fafafa';
        var layout = {
            title: plot.title,
            showlegend: false,
            font: {
                family: 'Brandon Grotesque',
                size: 15,
                color: fontColor
            },
            xaxis: {
                color: fontColor,
                type: plot.x.type, 
                title: plot.x.label, 
                range: plot.x.range
            },
            yaxis: {
                color: fontColor,
                type: plot.y.type, 
                title: plot.y.label,
                range: plot.y.range
            },
            paper_bgcolor: bgColor,
            plot_bgcolor: bgColor
        };
        
        Plotly.newPlot(plot.id, data, layout);

    };
    
    $scope.$parent.$watch('theme', function() {
        
        if($scope.plotMap) {
            for (var i = 0; i < $scope.plotMap.length; i++) {
                $scope.initialisePlot2($scope.plotMap[i]);
            }
        }
        
    });
    
    var askForSupport = function() {
         
        if ($scope.supports_html5_storage()) {
            var donateRequest = window['localStorage']['fc_donateRequest'];
            if (donateRequest === undefined && $cookies.get('simCount') >= 3) {
                
                var confirm = $mdDialog.confirm()
                        .title('Support me on Patreon!')
                        .textContent('Hi, I\'m really sorry and I hate myself for annoying you with popups, but if you like Flight Club, I\'d really appreciate it if you considered supporting me on Patreon! I promise you\'ll never see this message again either way :)')
                        .ariaLabel('support request')
                        .ok('I love this site!')
                        .cancel('This site sucks');

                $mdDialog.show(confirm).then(
                        function () {
                            window['localStorage']['fc_donateRequest'] = 1;
                            window.open('https://www.patreon.com/flightclub', '_blank');
                        },
                        function () {
                            window['localStorage']['fc_donateRequest'] = 1;
                        }
                );
            }
        }
    };
    
});