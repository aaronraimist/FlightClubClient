angular.module('FlightClub').controller('HomeCtrl', function ($scope, $mdDialog, $mdSidenav, $cookies, $interval, $timeout, $location) {

    $scope.$emit('viewBroadcast', 'home');

    $scope.missionLoading = true;
    $scope.loadSuccess = false;
    
    $scope.export_icon = 'content_copy';
    $scope.exportStyle = false;
    $scope.import_icon = 'content_paste';
    $scope.importStyle = false;
    $scope.save_icon = 'save';
    $scope.saveStyle = false;
    $scope.saving = false;
    $scope.loadingMission = false;
    
    $scope.serverErrorMessage = 'The flightclub.io server has undergone a rapid unscheduled disassembly :/\n'
            + 'You\'ll need to wait until I wake up and see this...\n\n';
    $scope.messageArray = [
        // p is probability of update being skipped until next interval
        { p: 0.7, message: 'Getting data from /r/SpaceX...' },
        { p: 0.5, message: 'Killing Church...' },
        { p: 0.7, message: 'Rebuilding Amos-6...' },
        { p: 0.2, message: 'Turtling FoxhoundBat...' },
        { p: 0.2, message: 'YVAN EHT NIOJ' },
        { p: 0.2, message: 'Impersonating Benjamin Klein...' },
        { p: 0.9, message: '<a href="https://www.patreon.com/flightclub">Click here to support me on Patreon!</a>'},
        { p: 0.6, message: 'Wake up, John...' },
        { p: 0.1, message: 'SUBLIMINAL MESSAGES' },
        { p: 0.8, message: 'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.' },
        { p: 0.8, message: '☠☠☠ Give it up jiggy make it feel like foreplay / Yo my cardio is infinite / Ha ha / Big willie style\'s all in it / Gettin jiggy wit it / Na na na na na na na nana ☠☠☠'}
    ];
    
    var i = Math.floor(Math.random()*$scope.messageArray.length);
    var roller = $interval(function() {
        $scope.missionLoadingMessage = $scope.messageArray[i].message;
        if (Math.random() > $scope.messageArray[i].p) {
            i = (i+1)%$scope.messageArray.length;
        }
        if(!$scope.missionLoading) {
            $interval.cancel(roller);
        }
    }, 350);
    
    $scope.httpRequest('/missions', 'GET', null, function (data) {
        fillMissions(data);
    }, function(data, statusText) {
        $scope.missionLoading = false;
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.serverErrorMessage += 'Missions: ' + statusText + '\n';
    });
    $scope.httpRequest('/launchsites', 'GET', null, function (data) {
        $scope.launchSites = fill(data);
    }, function(data, statusText) {
        $scope.missionLoading = false;
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.serverErrorMessage += 'LaunchSites: ' + statusText + '\n';
    });
    $scope.httpRequest('/stages?engineDetail=true', 'GET', null, function (data) {
        $scope.stageTypes = fillStages(data);
    }, function(data, statusText) {
        $scope.missionLoading = false;
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.serverErrorMessage += 'Stages: ' + statusText + '\n';
    });
    $scope.httpRequest('/engines', 'GET', null, function (data) {
        $scope.engineTypes = fillStages(data);
    }, function(data, statusText) {
        $scope.missionLoading = false;
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.serverErrorMessage += 'Engines: ' + statusText + '\n';
    });
    $scope.httpRequest('/companies', 'GET', null, function (data) {
        $scope.companies = fill(data);
    }, function(data, statusText) {
        $scope.missionLoading = false;
        $scope.$parent.toolbarTitle = 'It usually works, I swear';
        $scope.serverErrorMessage += 'Companies: ' + statusText + '\n';
    });

    $scope.gravTurnSelect = [
        {code: 'NONE', name: null},
        {code: 'FORWARD', name: 'Forward'},
        {code: 'REVERSE', name: 'Reverse'}
    ];

    $scope.type = [
        {code: 'IGNITION', name: 'Ignition'},
        {code: 'CUTOFF', name: 'Cutoff'},
        {code: 'GUIDANCE', name: 'Guidance'},
        {code: 'LAUNCH', name: 'Launch'},
        {code: 'SEPARATION', name: 'Stage Separation'},
        {code: 'FAIRING_SEP', name: 'Fairing Separation'},
        {code: 'PAYLOAD_SEP', name: 'Payload Separation'}
    ];

    var fillMissions = function (data) {
        var list = data.data;

        $scope.allMissions = [];
        $scope.upcoming = [];
        $scope.past = [];

        for (var i = list.length; i > 0; i--) {
            var mission = list[i - 1];
            var missionObj = {code: mission.code, name: mission.description, display: mission.display};
            var tempDate = Date.parse(mission.date.replace(/-/g, "/") + ' ' + mission.time + ' UTC');

            if (tempDate > new Date()) {
                $scope.allMissions.push(missionObj);
                $scope.upcoming.push(missionObj);
            } else {
                $scope.allMissions.push(missionObj);
                $scope.past.push(missionObj);
            }
        }

        var missionObj;
        if ($scope.upcoming.length > 0) {
            missionObj = $scope.upcoming[$scope.upcoming.length - 1];
        } else {
            missionObj = $scope.past[0];
        }
        $scope.selectedMission = missionObj;
        $scope.loadSuccess = true;
        $scope.missionLoading = false;
        
        var formHash = $location.hash();
        if (formHash) {
            var formData = window.atob(formHash);
            $scope.form = JSON.parse(formData);
            setNewMission($scope.form.Mission.code);
        } else {
            $scope.form = data.next;
            setNewMission(missionObj.code);
        }

    };

    var fill = function (data) {
        var list = data.data;
        var array = {};
        for (var i = list.length; i > 0; i--) {
            array[list[i - 1].code] = {code: list[i - 1].code, name: list[i - 1].description};
        }
        return array;
    };

    var fillStages = function (data) {
        var list = data.data;
        var array = {};
        for (var i = list.length; i > 0; i--) {
            array[list[i - 1].id] = list[i - 1];
        }
        return array;
    };
    
    $scope.updateUrl = function() {
        if($scope.form) {
            var formAsJSON_string = JSON.stringify($scope.form);

            var formHash = window.btoa(formAsJSON_string);
            $location.hash(formHash);
            return formHash;
        }
    };
    
    $scope.$watch('form', function() {
        $scope.updateUrl();
    }, true);

    $scope.selectMission = function (mission) {
        $scope.selectedMission = mission;
        $scope.loadingMission = true;
        $scope.httpRequest('/missions/' + mission.code, 'GET', null, function (data) {
            $mdSidenav("sidenav").close();
            $scope.loadingMission = false;
            $scope.form = JSON.parse(data);
            setNewMission(mission.code);
        }, null);
    };
    
    var setNewMission = function (code) {
        $scope.sortEvents();
        $scope.$parent.toolbarTitle = $scope.form.Mission.description;
        $scope.selectedEvent = null;
        $scope.builderType = 'previous';
        $scope.selectedVeh = code;
        $scope.recalcDV();
    };

    $scope.selectMissionVehicle = function (code) {
        $scope.httpRequest('/missions/' + code, 'GET', null, function (data) {
            var tempForm = JSON.parse(data);
            
            var currentStages = $scope.form.Mission.Vehicle.Stages.length;
            var newStages = tempForm.Mission.Vehicle.Stages.length;
            
            $scope.form.Mission.Vehicle = tempForm.Mission.Vehicle;
            $scope.recalcDV();
            
            if(currentStages > newStages) {
                for (var i = $scope.form.Mission.Events.length - 1; i >= 0; i--) {
                    if($scope.form.Mission.Events[i].stage > newStages-1)
                        $scope.form.Mission.Events.splice(i, 1);
                }
            }
            $scope.$apply();
        }, null);
    };

    // this handles moving back to homepage
    if ($scope.$parent.selectedMission !== undefined) {
        $scope.selectMission($scope.$parent.selectedMission);
    }

    $scope.selectSite = function (site) {
        $scope.form.Mission.launchsite = site.code;
    };
    $scope.selectEvent = function (event) {
        $scope.selectedEvent = $scope.selectedEvent === event ? null : event;
    };
    $scope.getStageByNumber = function(numArray) {
        if(!$scope.form || numArray === undefined)
            return null;
        var arr = [];
        for(var k=0;k<numArray.length;k++) {
            var num = numArray[k];
            for (var i = 0; i < $scope.form.Mission.Vehicle.Stages.length; i++) {
                if ($scope.form.Mission.Vehicle.Stages[i].stageNumber === num) {
                    arr.push($scope.form.Mission.Vehicle.Stages[i]);
                    continue;
                }

                for (var j = 0; j < $scope.form.Mission.Vehicle.Stages[i].Boosters.length; j++) {
                    if ($scope.form.Mission.Vehicle.Stages[i].Boosters[j].stageNumber === num) {
                        arr.push($scope.form.Mission.Vehicle.Stages[i].Boosters[j]);
                        continue;
                    }
                }
            }
        }
        return arr.sort(function(a, b){return a.stageNumber-b.stageNumber;});
    };

    $scope.openStageEditDialog = function ($event, $stageIndex, stage) {

        $mdDialog.show({
            controller: function ($scope, lParent, lForm, lStage, $mdDialog) {

                $scope.parentScope = lParent;

                $scope.selectedStage = jQuery.extend(true, {}, lStage);
                $scope.tempEvents = jQuery.extend(true, [], lForm.Mission.Events);
                $scope.stageTypes = $scope.parentScope.stageTypes;
                $scope.engineTypes = $scope.parentScope.engineTypes;

                $scope.selectStageType = function (newStage) {
                    
                    newStage.Engines = $scope.selectedStage.Engines;
                    newStage.Boosters = $scope.selectedStage.Boosters;
                    $scope.selectedStage = jQuery.extend(true, {}, newStage);
                    $scope.selectedStage.stageName = newStage.name;
                    
                };
                $scope.removeEngine = function ($index) {
                    
                    $scope.selectedStage.Engines.splice($index, 1);
                    $scope.selectedStage.Engines.forEach(function (obj, i) {
                        obj.engineId = i;
                    });
                    $scope.tempEvents.forEach(function(event) {
                        
                        if(event.stage === $scope.selectedStage.stageNumber) {
                            for (var i = event.Engines.length - 1; i >= 0; i--) {
                                if(event.Engines[i].engineId === $index) {
                                    event.Engines.splice(event.Engines[i], 1);
                                } else if (event.Engines[i].engineId > $index) {
                                    event.Engines[i].engineId--;
                                }
                            }
                        }
                    });
                    $scope.parentScope.recalcDV();

                };
                $scope.incrementEngines = function ($event) {
                    $scope.selectedStage.Engines.push({
                        engineId: $scope.selectedStage.Engines.length
                    });
                    
                    $scope.openEngineEditDialog($event, $scope.selectedStage.Engines.length-1, $scope.selectedStage.Engines[$scope.selectedStage.Engines.length-1]);
                };

                $scope.openEngineEditDialog = function ($event, $engineIndex, engineConfig) {

                    var obj = {
                        controller: function ($scope, lEngineTypes, lEngineConfig, $mdDialog, lStage) {

                            $scope.selectedEngineConfig = jQuery.extend(true, {}, lEngineConfig);
                            $scope.engineTypes = lEngineTypes;
                            $scope.stage = lStage;

                            $scope.selectEngineType = function (newEngine) {
                                $scope.selectedEngineConfig.Engine = newEngine;
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.finish = function () {
                                $mdDialog.hide();
                            };
                            $scope.save = function () {
                                $scope.stage.Engines[$engineIndex] = $scope.selectedEngineConfig;
                                $mdDialog.hide();
                            };
                        },
                        templateUrl: '/pages/editEngine.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: true,
                        //preserveScope: true,
                        autoWrap: true,
                        skipHide: true,
                        locals: {
                            lStage: $scope.selectedStage,
                            lEngineTypes: $scope.engineTypes,
                            lEngineConfig: engineConfig
                        }
                    };
                    $mdDialog.show(obj);
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.finish = function () {
                    $mdDialog.hide();
                };
                $scope.save = function () {                    
                    lForm.Mission.Vehicle.Stages[$stageIndex] = $scope.selectedStage;
                    lForm.Mission.Events = $scope.tempEvents;
                    resetstageNumbersAndEvents();
                    lParent.recalcDV();
                    $mdDialog.hide();
                };
            },
            templateUrl: '/pages/editStage.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            locals: {
                lParent: $scope,
                lForm: $scope.form,
                lStage: stage
            }
        });
    };

    $scope.openBoosterEditDialog = function ($event, stage, $boosterIndex, booster) {

        $mdDialog.show({
            controller: function ($scope, lParent, lForm, lStage, lBooster, $mdDialog) {

                $scope.parentScope = lParent;

                $scope.selectedStage = jQuery.extend(true, {}, lBooster);
                $scope.tempEvents = jQuery.extend(true, [], lForm.Mission.Events);
                $scope.stageTypes = $scope.parentScope.stageTypes;
                $scope.engineTypes = $scope.parentScope.engineTypes;

                $scope.selectStageType = function (newStage) {
                    
                    newStage.Engines = $scope.selectedStage.Engines;
                    newStage.Boosters = $scope.selectedStage.Boosters;
                    $scope.selectedStage = jQuery.extend(true, {}, newStage);
                    $scope.selectedStage.stageName = newStage.name;
                    
                };
                $scope.removeEngine = function ($index) {
                    
                    $scope.selectedStage.Engines.splice($index, 1);
                    $scope.selectedStage.Engines.forEach(function (obj, i) {
                        obj.engineId = i;
                    });
                    $scope.tempEvents.forEach(function(event) {
                        
                        if(event.stage === $scope.selectedStage.stageNumber) {
                            for (var i = event.Engines.length - 1; i >= 0; i--) {
                                if(event.Engines[i].engineId === $index) {
                                    event.Engines.splice(event.Engines[i], 1);
                                } else if (event.Engines[i].engineId > $index) {
                                    event.Engines[i].engineId--;
                                }
                            }
                        }
                    });
                    $scope.parentScope.recalcDV();

                };
                $scope.incrementEngines = function ($event) {
                    $scope.selectedStage.Engines.push({
                        engineId: $scope.selectedStage.Engines.length
                    });

                    $scope.openEngineEditDialog($event, $scope.selectedStage.Engines.length-1, $scope.selectedStage.Engines[$scope.selectedStage.Engines.length-1]);
                };

                $scope.openEngineEditDialog = function ($event, $engineIndex, engineConfig) {

                    var obj = {
                        controller: function ($scope, lEngineTypes, lEngineConfig, $mdDialog, lStage) {

                            $scope.selectedEngineConfig = jQuery.extend(true, {}, lEngineConfig);
                            $scope.engineTypes = lEngineTypes;
                            $scope.stage = lStage;

                            $scope.selectEngineType = function (newEngine) {
                                $scope.selectedEngineConfig.Engine = newEngine;
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.finish = function () {
                                $mdDialog.hide();
                            };
                            $scope.save = function () {
                                $scope.stage.Engines[$engineIndex] = $scope.selectedEngineConfig;
                                $mdDialog.hide();
                            };
                        },
                        templateUrl: '/pages/editEngine.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: true,
                        //preserveScope: true,
                        autoWrap: true,
                        skipHide: true,
                        locals: {
                            lStage: $scope.selectedStage,
                            lEngineTypes: $scope.engineTypes,
                            lEngineConfig: engineConfig
                        }
                    };
                    $mdDialog.show(obj);
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.finish = function () {
                    $mdDialog.hide();
                };
                $scope.save = function () {
                    lStage.Boosters[$boosterIndex] = $scope.selectedStage;
                    lForm.Mission.Events = $scope.tempEvents;
                    resetstageNumbersAndEvents();
                    lParent.recalcDV();
                    $mdDialog.hide();
                };
            },
            templateUrl: '/pages/editStage.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            locals: {
                lParent: $scope,
                lForm: $scope.form,
                lBooster: booster,
                lStage: stage
            }
        });
    };

    $scope.openEventEditDialog = function ($trigger, $eventIndex, event) {

        $mdDialog.show({
            controller: function ($scope, lParent, lForm, lEvent, $mdDialog) {

                $scope.parentScope = lParent;
                $scope.selectedEvent = jQuery.extend(true, {}, lEvent);
                $scope.type = $scope.parentScope.type;
                $scope.stages = $scope.parentScope.form.Mission.Vehicle.Stages;
                $scope.stageEngines = $scope.parentScope.form.Mission.Vehicle.Stages[$scope.selectedEvent.stage].Engines;
                $scope.gravTurnSelect = $scope.parentScope.gravTurnSelect;
                
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.finish = function () {
                    $mdDialog.hide();
                };
                $scope.save = function () {
                    lForm.Mission.Events[$eventIndex] = $scope.selectedEvent;
                    lParent.recalcDV();
                    $mdDialog.hide();
                };
            },
            templateUrl: '/pages/editEvent.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: $trigger,
            clickOutsideToClose: true,
            locals: {
                lParent: $scope,
                lForm: $scope.form,
                lEvent: event
            }
        });
    };

    $scope.openAdminEditDialog = function ($trigger) {

        $mdDialog.show({
            controller: function ($scope, lParent, lForm, $mdDialog) {

                $scope.parentScope = jQuery.extend(true, {}, lParent);
                $scope.companies = lParent.companies;
                
                // offset stuff necessary if client is not UTC. Date() returns time in local TZ >:|
                var today = new Date();
                var offset = -(today.getTimezoneOffset()/60);
                var tempDate = new Date($scope.parentScope.form.Mission.date);
                $scope.parentScope.form.Mission.date = new Date(tempDate.getTime() - offset*60*60*1000);
                
                Date.prototype.yyyymmdd = function () {
                    var mm = this.getMonth() + 1; // getMonth() is zero-based
                    var dd = this.getDate();

                    return [this.getFullYear(),
                        (mm > 9 ? '' : '0') + mm,
                        (dd > 9 ? '' : '0') + dd
                    ].join('-');
                };
                
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.finish = function () {
                    $mdDialog.hide();
                };
                $scope.save = function () {
                    lForm.Mission.code = $scope.parentScope.form.Mission.code;
                    lForm.Mission.description = $scope.parentScope.form.Mission.description;
                    lForm.Mission.date = $scope.parentScope.form.Mission.date.yyyymmdd();
                    lForm.Mission.time = $scope.parentScope.form.Mission.time;
                    lForm.Mission.company = $scope.parentScope.form.Mission.company;
                    lForm.Mission.orbits = $scope.parentScope.form.Mission.orbits;
                    lForm.Mission.display = $scope.parentScope.form.Mission.display;
                    $mdDialog.hide();
                };
            },
            templateUrl: '/pages/editAdmin.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: $trigger,
            clickOutsideToClose: true,
            locals: {
                lParent: $scope,
                lForm: $scope.form
            }
        });
    };
    
    var resetstageNumbersAndEvents = function() {
        
        //var stageNumberMap = []; // maps old stageNumber to new stageNumber for updating Events
        
        var i = 0;
        for(var index=0;index<$scope.form.Mission.Vehicle.Stages.length;index++) {
            
            var obj = $scope.form.Mission.Vehicle.Stages[index];
            //stageNumberMap[obj.stageNumber] = i;
            obj.stageNumber = i++;
            
            $scope.form.Mission.Vehicle.Stages[index].Boosters.forEach(function (obj) {
                //stageNumberMap[obj.stageNumber] = i;
                obj.stageNumber = i++;
            });
        }
        /*
         
         I've decided not to do this. The user should get a warning if there are
         unmatched events when they hit submit instead!

        // make list of events belonging to that entity to remove
        // decrement 'stage' property of all events for higher entities
        var list = [];
        $scope.form.Mission.Events.forEach(function(event, i) {
            if(stageNumberMap[event.stage] === undefined) 
                list.push(i);
            event.stage = stageNumberMap[event.stage];
        });
                
        for(var i=list.length-1;i>=0;i--) {
            $scope.form.Mission.Events.splice(list[i], 1);
        }
        */
    };
    
    $scope.removeEntity = function (parentStage, $index) {

        // remove entity by stageNumber
        if(parentStage) {
            parentStage.Boosters.splice($index, 1);
        } else {
            $scope.form.Mission.Vehicle.Stages.splice($index, 1);
        }

        resetstageNumbersAndEvents();
        $scope.recalcDV();
    };
    
    $scope.incrementEntity = function(parentStage) {
        if(parentStage) {
            parentStage.Boosters[parentStage.Boosters.length] = {
                Engines: [],
                Boosters: []
            };
        } else {
            $scope.form.Mission.Vehicle.Stages[$scope.form.Mission.Vehicle.Stages.length] = {
                Engines: [],
                Boosters: []
            };
        }        
        resetstageNumbersAndEvents();
    };
    
    $scope.recalcDV = function() {
        
        var totalDV = 0;
        var stages = $scope.form.Mission.Vehicle.Stages;
        
        for(var i=0;i<stages.length;i++) {
            
            if(stages[i].Engines[0] === undefined)
                continue;
            
            // Use Vac ISP of first engine by default
            var isp = stages[i].Engines[0].Engine.ispVac;
            
            if(i===0) {
                // for lower stages, take midpoint of SL and Vac ISP
                isp = 0.5*(stages[i].Engines[0].Engine.ispSL+stages[i].Engines[0].Engine.ispVac);
            } else if (stages[i].Engines.length>1) {
                // for upper stages, specifically look for Vac engines and use them
                for(var e=0;e<stages[i].Engines.length;e++) {
                    if(stages[i].Engines[e].Engine.ispSL === null) {
                        isp = stages[i].Engines[e].Engine.ispVac;
                        break;
                    }
                }
            }
            
            var aboveMass = 0;
            for(var j=i+1;j<stages.length;j++) {
                aboveMass += stages[j].dryMass + stages[j].propMass;
                for (var k = 0; k < stages[j].Boosters.length; k++) {
                    aboveMass += stages[j].Boosters[k].dryMass + stages[j].Boosters[k].propMass;
                }
                if (stages[j].fairingMass)
                    aboveMass += stages[j].fairingMass;
            }
            aboveMass += parseFloat($scope.form.Mission.Payload.mass);
            
            var m0 = aboveMass + stages[i].dryMass + stages[i].propMass;
            var m1 = aboveMass + stages[i].dryMass;
            for (var j = 0; j < stages[i].Boosters.length; j++) {
                m0 += stages[i].Boosters[j].dryMass + stages[i].Boosters[j].propMass;
                m1 += stages[i].Boosters[j].dryMass;
            }
            var mf = m0 / m1;
            
            totalDV += 9.81*isp*Math.log(mf);
        }
        $scope.payloadDV = (totalDV/1000.0).toPrecision(3);
    };
    
    $scope.addEvent = function () {
        var newEvent = {
            type: null,
            stage: null,
            name: null,
            time: null,
            dynamic: null,
            Attitude: {
                pitch: null,
                yaw: null,
                gt: null,
                throttle: null
            },
            Engines: []
        };
        $scope.form.Mission.Events.push(newEvent);
        $scope.sortEvents();
        $scope.selectedEvent = newEvent;
    };
    $scope.removeEvent = function (index) {
        if($scope.selectedEvent === $scope.form.Mission.Events[index])
            $scope.selectedEvent = null;
        $scope.form.Mission.Events.splice(index, 1);
    };

    $scope.sortEvents = function () {
        $scope.form.Mission.Events.sort(function (a, b) {
            if(a.time === null || a.time === undefined)
                return 1;
            if(b.time === null || b.time === undefined)
                return -1;
            return parseFloat(a.time) - parseFloat(b.time);
        });
    };
    
    $scope.export = function (ev) {       
        
        $scope.form.auth = {token: $scope.$parent.token};
        var formAsJSON_string = JSON.stringify($scope.form);
        $scope.form.auth = {token: null};
        var formHash = window.btoa(formAsJSON_string);
       
        
        $scope.exportStyle = true;
        if($scope.supports_html5_storage()) {
            window['localStorage']['fc_profile'] = formHash;
            $scope.exportStatusColor = '#82CA9D';
            $scope.export_icon = 'check';
            $timeout(function() {
                $scope.export_icon = 'content_copy';
                $scope.exportStyle = false;
            }, 4000);
        } else {
            $scope.exportStatusColor = '#F7977A';
            $scope.export_icon = 'close';
            $timeout(function() {
                $scope.export_icon = 'content_copy';
                $scope.exportStyle = false;
            }, 4000);
            $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Not supported!')
                    .textContent('Your browser doesn\'t support local storage! Upgrade, fool!')
                    .ariaLabel('export failure')
                    .ok(':(')
                    .targetEvent(ev)
                    );            
        }
    };
    
    $scope.import = function (ev) {
        
        $scope.importStyle = true;
        if($scope.supports_html5_storage()) {
            var formHash = window['localStorage']['fc_profile'];
            try {
                var formData = window.atob(formHash);
                $scope.form = JSON.parse(formData);
                setNewMission($scope.form.Mission.code);
                $scope.importStatusColor = '#82CA9D';
                $scope.import_icon = 'check';
                $timeout(function () {
                    $scope.import_icon = 'content_paste';
                    $scope.importStyle = false;
                }, 4000);
            } catch (err) {
                $scope.importStatusColor = '#F7977A';
                $scope.import_icon = 'close';
                $timeout(function () {
                    $scope.import_icon = 'content_paste';
                    $scope.importStyle = false;
                }, 4000);
                $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Import error!')
                        .textContent(err)
                        .ariaLabel('import failure')
                        .ok('Ok!')
                        .targetEvent(ev)
                        );
            }
        } else {
            $scope.importStatusColor = '#F7977A';
            $scope.import_icon = 'close';
            $timeout(function () {
                $scope.import_icon = 'content_paste';
                $scope.importStyle = false;
            }, 4000);
            $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Not supported!')
                    .textContent('Your browser doesn\'t support local storage! Upgrade, fool!')
                    .ariaLabel('import failure')
                    .ok('Ok!')
                    .targetEvent(ev)
                    );
        }

    };
    
    var validateEventswithStages = function() {
        
        var returnObj = {
            isValid: true,
            invalidEvents: [],
            unusedStages: []
        };
        
        var stagesReferencedInEvents = [];
        var maxStageNumber = -1;
        $scope.form.Mission.Vehicle.Stages.forEach(function(stage) {
            maxStageNumber++;
            stage.Boosters.forEach(function() {maxStageNumber++;});
        });
        
        // check for events that reference non-existent stages
        $scope.form.Mission.Events.forEach(function(event) {
            if(event.stageNumbers === undefined)
                returnObj.invalidEvents.push(event);
            else {
                for(var i=0;i<event.stageNumbers.length;i++) {
                    stagesReferencedInEvents.push(event.stageNumbers[i]);
                    if(event.stageNumbers[i] > maxStageNumber)
                        returnObj.invalidEvents.push(event);
                }
            }
        });
        
        // check for stages that have no attached events
        $scope.form.Mission.Vehicle.Stages.forEach(function(stage) {
           if(stagesReferencedInEvents.indexOf(stage.stageNumber)===-1)
               returnObj.unusedStages.push(stage);
            stage.Boosters.forEach(function(booster) {
                if (stagesReferencedInEvents.indexOf(booster.stageNumber)===-1)
                    returnObj.unusedStages.push(booster);
            });
        });
        
        returnObj.isValid = returnObj.invalidEvents.length===0 && returnObj.unusedStages.length===0;
        return returnObj;
    };

    $scope.submit = function () {
        
        var validation = validateEventswithStages();
        if(!validation.isValid) {
            
            var stageList = '<ul>';
            validation.unusedStages.forEach(function(stage) {
                stageList += '<li>'+stage.stageName + '</li>';
            });
            stageList += '</ul>';
            
            var eventList = '<ul>';
            validation.invalidEvents.forEach(function(event) {
                eventList += '<li>'+event.name + '</li>';
            });
            eventList += '</ul>';
            
            var confirm = $mdDialog.confirm()
                    .title("Warning! Possible invalid profile")
                    .htmlContent(
                        (validation.unusedStages.length===0?'':('There were no events assigned to the following stages:'+stageList))
                        +(validation.invalidEvents.length===0?'':('The following events don\'t reference a valid stage:'+eventList))
                        +'Do you want to continue? Simulation may fail.'
                    )
                    .ariaLabel('Update Confirmation')
                    .targetEvent(event)
                    .ok('Ok')
                    .cancel('Go back');
            $mdDialog.show(confirm).then(function () {
                processSubmit();
            }, null);
        } else {
            processSubmit();
        }
    };
    
    var processSubmit = function() {
        
        $scope.form.auth = {token: $scope.$parent.token};
        var formHash = $scope.updateUrl();
        $scope.form.auth = {token: null};
        
        var simCount = parseInt($cookies.get('simCount'));
        $cookies.put('simCount', simCount ? simCount+1 : 1);
        
        window.open($scope.$parent.client + '/results/#' + formHash, '_blank');
    };

    $scope.save = function (event)
    {
        $scope.httpRequest('/missions/' + $scope.form.Mission.code, 'GET', null,
                function (data) {
                    var exists = false;
                    if (data.error === undefined)
                        exists = true;
                    $scope.form.auth = {token: $scope.$parent.token};
                    var formAsJSON_string = JSON.stringify($scope.form);
                    if (exists)
                    {
                        var confirm = $mdDialog.confirm()
                                .title("Update " + $scope.form.Mission.code)
                                .textContent('This will update ' + $scope.form.Mission.description)
                                .ariaLabel('Update Confirmation')
                                .targetEvent(event)
                                .ok('Ok')
                                .cancel('Cancel');
                        $mdDialog.show(confirm).then(function () {
                            $scope.saving = true;
                            $scope.httpRequest('/missions/' + $scope.form.Mission.code, 'PUT', formAsJSON_string, saveSuccess, saveError);
                        }, null);
                    } else
                    {
                        var confirm = $mdDialog.confirm()
                                .title($scope.form.Mission.code + " doesn't exist yet")
                                .textContent("This will create a new mission called '" + $scope.form.Mission.description + "'")
                                .ariaLabel('Create Confirmation')
                                .targetEvent(event)
                                .ok('Ok')
                                .cancel('Cancel');
                        $mdDialog.show(confirm).then(function () {
                            $scope.saving = true;
                            $scope.httpRequest('/missions/', 'POST', formAsJSON_string, saveSuccess, saveError);
                        }, null);
                    }
                }, null);

    };

    var saveSuccess = function () {
        $scope.saving = false;
        $scope.saveStatusColor = '#82CA9D';
        $scope.save_icon = 'check';
        $scope.saveStyle = true;
        $scope.$apply();
        $timeout(function () {
            $scope.save_icon = 'save';
            $scope.saveStyle = false;
        }, 4000);
    };

    var saveError = function () {
        $scope.saving = false;
        $scope.saveStatusColor = '#F7977A';
        $scope.save_icon = 'close';
        $scope.saveStyle = true;
        $scope.$apply();
        $timeout(function () {
            $scope.save_icon = 'save';
            $scope.saveStyle = false;
        }, 4000);
    };

});