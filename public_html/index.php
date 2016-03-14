<!doctype html>
<html>
  <head>
    <title>Flight Club | Mission Builder</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.5/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand:400' rel='stylesheet' type='text/css'>

    <script src="js/core.js"></script>     
    <script src="js/index.js"></script> 
    <link rel="stylesheet" href="css/style.css" />

    <meta property="og:title" content="Flight Club" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="http://www.flightclub.io" />
    <meta property="og:description" content="Flight Club is a rocket launch + landing simulator 
          and trajectory visualiser. Based on SpaceX's launch vehicles, it serves as a tool for
          checking how likely it is that a booster can return to the launch pad for upcoming missions." />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="http://www.flightclub.io/images/og_image.png" />   

    <link rel="apple-touch-icon" sizes="57x57" href="images/favicon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="images/favicon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/favicon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="images/favicon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/favicon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="images/favicon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="images/favicon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="images/favicon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="images/favicon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192"  href="images/favicon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="images/favicon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon/favicon-16x16.png">
    <link rel="manifest" href="images/favicon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="images/favicon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
  </head>
  <body id="home" ng-app="FlightClub" data-ng-element-ready="">
    <div ng-controller="IndexCtrl" layout="column" flex layout-fill ng-cloak>
      <section layout="row" flex>

        <md-content flex layout="column" layout-align='space-around center'>
          <md-toolbar>
            <div class="md-toolbar-tools">
              <md-menu md-offset="0 50">
                <md-button class="md-icon-button" aria-label="Menu" ng-click='openMenu($mdOpenMenu, $event)'>
                  <md-icon class="material-icons">menu</md-icon>
                </md-button>
                <md-menu-content width="4">
                  <md-menu-item ng-click="toggleLogin($event)">
                    <md-button>
                      <md-icon class="material-icons">person</md-icon>
                      <span>{{loginLabel}}</span>
                    </md-button>
                  </md-menu-item>
                  <md-menu-item>
                    <md-button ng-click="goToDocs()">
                      <md-icon class="material-icons">description</md-icon>
                      <span>Flight Club API Docs</span>
                    </md-button>
                  </md-menu-item>
                  <!--
                  <md-menu-item>
                    <md-button ng-click="goToDocs()">
                      <md-icon class="material-icons">description</md-icon>
                      <span>Flight Club API Docs</span>
                    </md-button>
                  </md-menu-item>
                  -->
                </md-menu-content>
              </md-menu>
              <h2>
                <span>{{'Flight Club | Mission Builder | ' + missionName}}</span>
              </h2>
              <span flex></span>
              <md-button class="md-icon-button" aria-label="sidenav" ng-click="toggleNav('sidenav')">
                <md-icon class="material-icons">more_vert</md-icon>
              </md-button>
            </div>
          </md-toolbar>

          <form layout-fill layout="row" flex name="profileForm">
            <md-tabs flex md-selected="3" md-border-bottom md-autoselect>
              <md-tab label='{{launchSites[form.Mission.launchsite].name}}'>
                <md-tab-content>
                  <md-content layout-fill flex layout-padding layout-margin layout="row" layout-align="space-around center">
                    <md-grid-list layout-padding layout-margin layout-fill
                                  md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                                  md-row-height-gt-md="1:1" md-row-height="2:2"
                                  md-gutter="12px" md-gutter-gt-sm="8px">
                      <md-grid-tile ng-repeat="site in launchSites"
                                    md-rowspan="1"
                                    md-colspan="1"
                                    md-colspan-gt-sm="2">
                        <md-button ng-class="{'md-primary':launchSites[form.Mission.launchsite] === site}" layout-fill class="bolder md-raised" ng-click='selectSite($event, site)'>
                          <md-icon flex style="height:96px;width:96px" md-svg-src="{{'images/' + site.code + '.svg'}}"></md-icon>
                          <div flex>{{site.name}}</div>
                        </md-button>
                      </md-grid-tile>
                    </md-grid-list>
                  </md-content>
                </md-tab-content>
              </md-tab>
              <md-tab label='{{launchVehicles[form.Mission.launchvehicle].name}}'>
                <md-tab-content>
                  <md-content layout-fill flex layout-padding layout-margin layout="row" layout-align="space-around center">
                    <md-grid-list layout-padding layout-margin layout-fill
                                  md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                                  md-row-height-gt-md="1:1" md-row-height="2:2"
                                  md-gutter="12px" md-gutter-gt-sm="8px">
                      <md-grid-tile ng-repeat="veh in launchVehicles"
                                    md-rowspan="1"
                                    md-colspan="1"
                                    md-colspan-gt-sm="2">
                        <md-button ng-class="{'md-primary':launchVehicles[form.Mission.launchvehicle] === veh}" layout-fill class="bolder md-raised" ng-click='selectVehicle($event, veh)'>
                          <md-icon flex style="height:96px;width:96px" md-svg-src="{{'images/' + veh.code + '.svg'}}"></md-icon>
                          <div flex>{{veh.name}}</div>
                        </md-button>
                      </md-grid-tile>
                    </md-grid-list>
                  </md-content>
                </md-tab-content>
              </md-tab>
              <md-tab label='{{payloads[form.Mission.Payload.code].name}}'>
                <md-tab-content>
                  <md-content layout-fill flex layout-padding layout-margin layout="row" layout-align="space-around center">
                    <md-grid-list layout-padding layout-margin layout-fill
                                  md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                                  md-row-height-gt-md="1:1" md-row-height="2:2"
                                  md-gutter="12px" md-gutter-gt-sm="8px">
                      <md-grid-tile ng-repeat="payload in payloads"
                                    md-rowspan="1"
                                    md-colspan="1"
                                    md-colspan-gt-sm="2">
                        <md-button ng-class="{'md-primary':payloads[form.Mission.Payload.code] === payload}" layout-fill class="bolder md-raised" ng-click='selectPayload($event, payload)'>
                          <md-icon flex style="height:96px;width:96px" md-svg-src="{{'images/' + payload.code + '.svg'}}"></md-icon>
                          <div flex>{{payload.name}}</div>
                        </md-button>
                      </md-grid-tile>
                    </md-grid-list>
                  </md-content>
                </md-tab-content>
              </md-tab>
              <md-tab label='Flight Profile'>
                <md-tab-content>
                  <md-content layout-padding layout-fill flex layout='column' layout-gt-sm='row' layout-align='space-between start'>

                    <md-content class="perfectHeight" style="background-color:#eee" flex layout-fill>
                      <md-list layout='column'>
                        <md-content style="background-color:#eee" layout="row" layout-align="space-between center">
                          <md-subheader style="background-color:#eee" class="md-no-sticky">Events</md-subheader>
                          <md-button class="md-raised md-secondary" ng-click="addEvent()">Add</md-button>
                        </md-content>
                        <md-divider></md-divider>
                        <md-list-item layout='row' layout-align='space-between center' ng-repeat="event in form.Mission.Events" ng-click="selectEvent($event, event)">
                          <div flex class="md-secondary eventLabel">{{"T" + (event.time < 0 ? '' : '+') + event.time}}</div>
                          <div class="md-secondary eventLabel">{{event.name}}</div>
                          <md-divider></md-divider>
                        </md-list-item>
                      </md-list>
                    </md-content>

                    <md-content flex layout-fill>
                      <md-content ng-show="selectedEvent !== undefined">
                        <md-content layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Event Type</label>
                            <md-select ng-model="selectedEvent.type" name="type" required>
                              <md-option ng-repeat="obj in type" value="{{obj.code}}" 
                                         ng-disabled="obj.code === 'FAIRING_SEP' && form.Mission.Payload.code !== 'SATL'">{{obj.name}}</md-option>
                            </md-select>
                            <div ng-messages="profileForm.type.$error" multiple md-auto-hide="true">
                              <div ng-message="required">
                                What type of event do you want to create?
                              </div>
                            </div>
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Name</label>
                            <input ng-model="selectedEvent.name" name="name" required>
                            <div ng-messages="profileForm.name.$error" multiple md-auto-hide="true">
                              <div ng-message="required">
                                This can be whatever you want, but make it descriptive!
                              </div>
                            </div>
                          </md-input-container>
                        </md-content>
                        <md-content layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Stage</label>
                            <md-select ng-model="selectedEvent.stage" name="stage" required>
                              <md-option ng-repeat="obj in form.Mission.Stages" value="{{obj.id}}">{{obj.name}}</md-option>
                            </md-select>
                            <div ng-messages="profileForm.stage.$error" multiple md-auto-hide="true">
                              <div ng-message="required">
                                The event has to apply to one stage in particular
                              </div>
                            </div>
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Time (seconds from T-0)</label>
                            <input ng-model="selectedEvent.time" ng-change="sortEvents()" name="time" required>
                            <div ng-messages="profileForm.time.$error" multiple md-auto-hide="true">
                              <div ng-message="required">
                                What time should this event take place?
                              </div>
                            </div>
                          </md-input-container>
                        </md-content>
                        <md-content ng-show="selectedEvent.type === 'IGNITION'"
                                    layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Engines</label>
                            <input ng-model="selectedEvent.engines" name="engines" required/>
                            <div ng-messages="profileForm.engines.$error" multiple md-auto-hide="true">
                              <div ng-message="required">
                                You can't do a burn with no engines...
                              </div>
                            </div>
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Dynamic Burn</label>
                            <md-switch ng-model="selectedEvent.dynamic" aria-label="Hoverslam"></md-switch>
                          </md-input-container>
                        </md-content>
                        <md-content ng-show="selectedEvent.type === 'IGNITION' || selectedEvent.type === 'GUIDANCE'"
                                    layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Pitch</label>
                            <input ng-model="selectedEvent.Attitude.pitch">
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Yaw</label>
                            <input ng-model="selectedEvent.Attitude.yaw">
                          </md-input-container>
                        </md-content>
                        <md-content ng-show="selectedEvent.type === 'IGNITION' || selectedEvent.type === 'GUIDANCE'"
                                    layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Throttle</label>
                            <input ng-model="selectedEvent.Attitude.throttle">
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Gravity Turn</label>
                            <md-select ng-model="selectedEvent.Attitude.gt">
                              <md-option ng-repeat="obj in gravTurnSelect" value="{{obj.code}}">{{obj.name}}</md-option>
                            </md-select>
                          </md-input-container>
                        </md-content>
                        <md-content layout="row" layout-align="space-between center">
                          <md-button class="md-raised md-secondary" ng-disabled="selectedEvent === null" ng-click="removeEvent()">Remove</md-button>
                        </md-content>
                      </md-content>
                    </md-content>

                    <md-content flex layout-fill>
                      <md-content layout="row" layout-align="space-around center">
                        <md-input-container flex class="md-block">
                          <label>Payload Mass (kg)</label>
                          <input ng-model="form.Mission.Payload.mass">
                        </md-input-container>
                        <md-button flex class="md-raised" type="submit" ng-click="submit()">Submit</md-button>
                      </md-content>
                      <md-content layout="row" layout-align="space-around center">
                        <md-input-container flex class="md-block">
                          <label>{{form.Mission.Stages[0].name}} Legs</label>
                          <md-switch ng-model="form.Mission.Stages[0].legs" aria-label="{{form.Mission.Stages[0].name}} legs"></md-switch>
                        </md-input-container>
                        <md-input-container flex class="md-block" flex ng-show="form.Mission.Stages.length === 3">
                          <label>{{form.Mission.Stages[1].name}} Legs</label>
                          <md-switch ng-model="form.Mission.Stages[1].legs" aria-label="{{form.Mission.Stages[1].name}} legs"></md-switch>
                        </md-input-container>
                      </md-content>
                      <md-content ng-show="authorised">
                        <md-divider></md-divider>
                        <md-content layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Code</label>
                            <input ng-model="form.Mission.code">
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Description</label>
                            <input ng-model="form.Mission.description">
                          </md-input-container>
                        </md-content>
                        <md-content layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Date</label>
                            <input ng-model="form.Mission.date">
                          </md-input-container>
                          <md-input-container flex class="md-block">
                            <label>Time</label>
                            <input ng-model="form.Mission.time">
                          </md-input-container>
                        </md-content>
                        <md-content layout="row" layout-align="space-around center">
                          <md-input-container flex class="md-block">
                            <label>Display</label>
                            <md-switch ng-model="form.Mission.display" aria-label="Display"></md-switch>
                          </md-input-container>
                          <md-button flex class="md-raised" type="submit" ng-click="save($event)">Save</md-button>
                        </md-content>
                      </md-content>

                    </md-content>
                </md-tab-content>
              </md-tab>
            </md-tabs>
          </form>

          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="sidenav" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>Stock Profiles</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('sidenav')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
            <md-divider></md-divider>
            <md-list>
              <md-subheader class="md-no-sticky">Upcoming Missions</md-subheader>
              <md-list-item ng-repeat="mission in upcoming" ng-click="selectMission(mission.code)">
                <span class="md-secondary">{{mission.name}}</span>
              </md-list-item>
              <md-subheader class="md-no-sticky">Past Missions</md-subheader>
              <md-list-item ng-repeat="mission in past" ng-click="selectMission(mission.code)">
                <span class="md-secondary">{{mission.name}}</span>
              </md-list-item>
            </md-list>
          </md-sidenav>

        </md-content>

      </section>
    </div>    
  </body>
</html>
