angular.module('FlightClub').controller('HomeCtrl', function ($scope, $mdDialog, $mdSidenav, $interval) {

    $scope.missionLoading = true;
    $scope.loadSuccess = false;
    
    $scope.export_icon = 'content_copy';
    $scope.exportStyle = false;
    $scope.import_icon = 'content_paste';
    $scope.importStyle = false;
    
    $scope.serverErrorMessage = 'The flightclub.io server has undergone a rapid unscheduled disassembly :/\n'
            + 'You\'ll need to wake until I wake up and see this...\n\n';
    $scope.messageArray = [
        // p is probability of update being skipped until next interval
        { p: 0.7, message: 'Getting data from /r/SpaceX...' },
        { p: 0.5, message: 'Killing Church...' },
        { p: 0.7, message: 'Rebuilding Amos-6...' },
        { p: 0.2, message: 'Turtling FoxhoundBat...' },
        { p: 0.2, message: 'YVAN EHT NIOJ' },
        { p: 0.2, message: 'Impersonating Benjamin Klein...' },
        { p: 0.6, message: 'Donate to flightclub.io!' },
        { p: 0.6, message: 'Wake up, John...' },
        { p: 0.1, message: 'SUBLIMINAL MESSAGES' },
        { p: 0.8, message: 'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.' },
        { p: 0.8, message: '☠☠☠ Give it up jiggy make it feel like foreplay / Yo my cardio is infinite / Ha ha / Big willie style\'s all in it / Gettin jiggy wit it / Na na na na na na na nana ☠☠☠'}
    ];
    
    var i = Math.floor(Math.random()*$scope.messageArray.length);
    $interval(function() {
        $scope.missionLoadingMessage = $scope.messageArray[i].message;
        if (Math.random() > $scope.messageArray[i].p) {
            i = (i+1)%$scope.messageArray.length;
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

    $scope.$parent.toolbarClass = "";
    $scope.gravTurnSelect = [
        {code: 'NONE', name: null},
        {code: 'FORWARD', name: 'Forward'},
        {code: 'REVERSE', name: 'Reverse'}
    ];

    $scope.type = [
        {code: 'IGNITION', name: 'Ignition'},
        {code: 'CUTOFF', name: 'Cutoff'},
        {code: 'GUIDANCE', name: 'Guidance'},
        {code: 'SEPARATION', name: 'Launch/Separation'},
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
        
        var formHash = window.location.hash.substring(1);
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

    $scope.selectMission = function (code) {
        $scope.httpRequest('/missions/' + code, 'GET', null, function (data) {
            $mdSidenav("sidenav").close();
            $scope.form = JSON.parse(data);
            setNewMission(code);
            $scope.$apply();
        }, null);
    };
    
    var setNewMission = function (code) {
        $scope.sortEvents();
        $scope.missionName = $scope.form.Mission.description;
        $scope.$parent.toolbarTitle = "Mission Builder | " + $scope.missionName;
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
        $scope.selectMission($scope.$parent.selectedMission.code);
    }

    $scope.selectSite = function (site) {
        $scope.form.Mission.launchsite = site.code;
    };
    $scope.selectEvent = function (trigger, event) {
        
        if ($scope.selectedEvent === event) {
            $scope.selectedEvent = null; 
            uniqueClass(trigger.currentTarget, 'md-content', 'button', 'md-primary', false);
        } else {
            $scope.selectedEvent = event;
            if(event.stage !== undefined)
                $scope.form.Mission.Vehicle.Stages[event.stage].stageNum = event.stage;
            uniqueClass(trigger.currentTarget, 'md-content', 'button', 'md-primary', true);
        }
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
                    $scope.selectedStage = newStage;
                };
                $scope.removeEngine = function ($index) {
                    
                    $scope.selectedStage.Engines.splice($index, 1);
                    $scope.selectedStage.Engines.forEach(function (obj, i) {
                        obj.engineId = i;
                    });
                    $scope.tempEvents.forEach(function(event) {
                        
                        if(event.stage === $scope.selectedStage.stageNum) {
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
                $scope.incrementEngines = function () {
                    if (!$scope.selectedStage.Engines)
                        $scope.selectedStage.Engines = [];
                    $scope.selectedStage.Engines.push({
                        engineId: $scope.selectedStage.Engines.length
                    });
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
                
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.finish = function () {
                    $mdDialog.hide();
                };
                $scope.save = function () {
                    lForm.Mission.code = $scope.parentScope.form.Mission.code;
                    lForm.Mission.description = $scope.parentScope.form.Mission.description;
                    lForm.Mission.date = $scope.parentScope.form.Mission.date;
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
    
    $scope.removeStage = function ($index) {
        var stageNum = $scope.form.Mission.Vehicle.Stages[$index].stageNum;
        var list = [];
        $scope.form.Mission.Vehicle.Stages.splice($index, 1);
        $scope.form.Mission.Events.forEach(function(event, i) {
            if(event.stage === stageNum) {
                list.push(i);
            } else if (event.stage > stageNum) {
                event.stage--;
            }
        });
        $scope.form.Mission.Vehicle.Stages.forEach(function(obj, i) {
            obj.stageNum = i;
        });
        for(var i=list.length-1;i>=0;i--) {
            $scope.form.Mission.Events.splice(list[i], 1);
        }
        $scope.recalcDV();
    };
    $scope.incrementStages = function () {
        $scope.form.Mission.Vehicle.Stages[$scope.form.Mission.Vehicle.Stages.length] = {};
    };
    
    $scope.recalcDV = function() {
        
        var totalDV = 0;
        var stages = $scope.form.Mission.Vehicle.Stages;
        
        for(var i=0;i<stages.length;i++) {
            
            if(stages[i] === undefined || stages[i].Engines === undefined)
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
                if(stages[j].fairingMass)
                    aboveMass += stages[j].fairingMass;
            }
            aboveMass += parseFloat($scope.form.Mission.Payload.mass);
            
            var m0 = aboveMass + stages[i].dryMass + stages[i].propMass;
            var m1 = aboveMass + stages[i].dryMass;
            var mf = m0/m1;
            
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
        var formHash = window.btoa(formAsJSON_string);
       
        
        $scope.exportStyle = true;
        if($scope.supports_html5_storage()) {
            window['localStorage']['fc_profile'] = formHash;
            $scope.exportStatusColor = '#82CA9D';
            $scope.export_icon = 'check';
            setTimeout(function() {
                $scope.export_icon = 'content_copy';
                $scope.exportStyle = false;
            }, 4000);
        } else {
            $scope.exportStatusColor = '#F7977A';
            $scope.export_icon = 'close';
            setTimeout(function() {
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
                setTimeout(function () {
                    $scope.import_icon = 'content_paste';
                    $scope.importStyle = false;
                }, 4000);
            } catch (err) {
                $scope.importStatusColor = '#F7977A';
                $scope.import_icon = 'close';
                setTimeout(function () {
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
            setTimeout(function () {
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

    $scope.submit = function () {
        $scope.form.auth = {token: $scope.$parent.token};
        var formAsJSON_string = JSON.stringify($scope.form);

        var formHash = window.btoa(formAsJSON_string);
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
                            $scope.httpRequest('/missions/' + $scope.form.Mission.code, 'PUT', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
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
                            $scope.httpRequest('/missions/', 'POST', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
                        }, null);
                    }
                }, null);

    };

    var saveSuccess = function (mdDialog) {
        return function (data) {
            mdDialog.show(
                    mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title("That's a bingo!")
                    .textContent('Mission was updated successfully')
                    .ariaLabel('Update Success')
                    .ok('Ok')
                    );
        };
    };

    var saveError = function (mdDialog) {
        return function (data) {
            mdDialog.show(
                    mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title("I always hated you the most")
                    .textContent('There was an error updating.')
                    .ariaLabel('Update Failure')
                    .ok('Ok')
                    );
        };
    };

    var uniqueClass = function (target, parentType, targetType, className, add) {

        var parent = target.closest(parentType);
        var targets = parent.getElementsByTagName(targetType);
        for (var i = 0; i < targets.length; i++) {
            targets[i].classList.remove(className);
        }
        if(add)
            target.classList.add(className);
    };

});