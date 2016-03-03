<!doctype html>
<html>
  <head>
    <title>Flight Club | Mission Builder</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.5/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />

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
    <link rel="manifest" href="images/favicon-round/manifest.json">
  </head>
  <body ng-app="FlightClub" data-ng-element-ready="">
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

          <md-content layout-fill layout="row" flex>
            <!--<form flex>-->
            <md-tabs flex md-selected="3" md-border-bottom md-autoselect>
              <md-tab label='{{launchSites[form.Mission.launchsite].name}}'>
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="site in launchSites"
                                  ng-click='selectSite(site)'
                                  md-rowspan="1"
                                  md-colspan="1"
                                  md-colspan-gt-sm="2">
                      <div>{{site.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab label='{{launchVehicles[form.Mission.launchvehicle].name}}'>
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="veh in launchVehicles"
                                  ng-click='selectVehicle(veh)'
                                  md-rowspan="1"
                                  md-colspan="1"
                                  md-colspan-gt-sm="2">
                      <div>{{veh.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab label='{{payloads[form.Mission.Profile.Payload.code].name}}'>
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="payload in payloads"
                                  ng-click='selectPayload(payload)'
                                  md-rowspan="1"
                                  md-colspan="1"
                                  md-colspan-gt-sm="2">
                      <div>{{payload.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab label='Flight Profile'>
                <md-tab-content>
                  <md-tabs md-border-bottom md-autoselect layout-fill>
                    <md-tab layout-fill selected ng-repeat="stage in form.Mission.Profile.Stages" label="{{stage.Core.name}}">
                      <md-tab-content flex layout='column' layout-align="space-between center">

                        <md-content flex></md-content>
                        <md-content flex layout-fill layout='row'>
                          <md-chips flex layout-fill ng-model="stage.Burns" md-transform-chip="newBurn($chip)">
                            <md-chip-template>
                              <md-menu md-offset="0 50">
                                <div ng-click="$mdOpenMenu($event)">
                                  <strong>{{$chip.tag}}</strong>
                                  <em>(Burn)</em>
                                </div>
                                <md-menu-content width="6">
                                  <md-menu-item>
                                    <label>Tag</label><input ng-model="$chip.tag">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Engines</label><input ng-model="$chip.engines">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Start</label><input ng-model="$chip.start">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>End</label><input ng-model="$chip.end">
                                  </md-menu-item>
                                </md-menu-content>
                              </md-menu>
                            </md-chip-template>
                          </md-chips>
                        </md-content>

                        <md-content flex layout-fill layout='row'>
                          <md-chips flex layout-fill ng-model="stage.Course" md-transform-chip="newCourse($chip)">
                            <md-chip-template>
                              <md-menu md-offset="0 50">
                                <div ng-click="$mdOpenMenu($event)">
                                  <strong>{{$chip.tag}}</strong>
                                  <em>(Course Correction)</em>
                                </div>
                                <md-menu-content width="4">
                                  <md-menu-item>
                                    <label>Tag</label><input ng-model="$chip.tag">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Start</label><input ng-model="$chip.start">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Pitch</label><input ng-model="$chip.Attitude.pitch">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Yaw</label><input ng-model="$chip.Attitude.yaw">
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Gravity Turn</label>
                                    <md-select flex ng-model="gravTurnSelect[selectedCourse.Attitude.gt]">
                                      <md-option ng-repeat="gt in gravTurnSelect" value="{{gt.code}}">
                                        {{gt.name}}
                                      </md-option>
                                    </md-select>
                                  </md-menu-item>
                                  <md-menu-item>
                                    <label>Throttle</label><input ng-model="$chip.Attitude.throttle">
                                  </md-menu-item>
                                </md-menu-content>
                              </md-menu>
                            </md-chip-template>
                          </md-chips>
                        </md-content>

                        <md-content flex layout-fill layout='row'>
                          <md-input-container>
                            <label>Stage Separation</label>
                            <input ng-model="stage.release">
                          </md-input-container>
                          <md-switch ng-model="stage.Core.legs">Legs</md-switch>
                        </md-content>
                        <md-content flex layout='row'>
                          <md-input-container>
                            <label>Fairing Separation</label>
                            <input ng-model="stage.Core.fairing_sep">
                          </md-input-container>
                          <md-button class="md-raised" type='submit' ng-click='submit()'>Submit</md-button>
                        </md-content>
                        <md-content flex layout='row' ng-show="authorised">
                          <md-content flex layout-fill layout='column' layout-align='space-between center' layout-gt-sm='row'>
                            <md-input-container>
                              <label>Code</label>
                              <input ng-model="form.Mission.code">
                            </md-input-container>
                            <md-switch ng-model="form.Mission.display">Display</md-switch>
                          </md-content>
                          <md-content flex layout-fill layout='column' layout-align='space-between center' layout-gt-sm='row'>
                            <md-input-container>
                              <label>Date</label>
                              <input ng-model="form.Mission.date">
                            </md-input-container>
                            <md-button class="md-raised" type='submit' ng-click='save()'>Save</md-button>
                          </md-content>
                          <md-content flex layout-fill layout='column' layout-align='space-between center' layout-gt-sm='row'>
                            <md-input-container>
                              <label>Time</label>
                              <input ng-model="form.Mission.time">
                            </md-input-container>
                            <md-button class="md-raised" type='submit' ng-click='copy()'>Copy</md-button>
                          </md-content>
                        </md-content>
                        <md-content flex></md-content>
                      </md-tab-content>
                    </md-tab>
                  </md-tabs>
                </md-tab-content>
              </md-tab>
            </md-tabs>
            <!--</form>-->
          </md-content>

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
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="js/core.js"></script>     
    <script src="js/index.js"></script>     
  </body>
</html>
