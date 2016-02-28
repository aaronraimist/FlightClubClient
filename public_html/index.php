<!doctype html>
<html>
  <head>
    <title>Flight Club</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
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
              <md-button class="md-icon-button" aria-label="Home" ng-click="goHome()">
                <i class="material-icons">home</i>
              </md-button>
              <h2>
                <span>{{'Mission Builder: ' + selected.mission.name}}</span>
              </h2>
              <span flex></span>
              <md-button class="md-icon-button" aria-label="Save" ng-show="authorised" ng-click="save()">
                <i class="material-icons">save</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Copy" ng-show="authorised" ng-click="copy()">
                <i class="material-icons">content_copy</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Login" ng-click="toggleLogin()">
                <i class="material-icons">person</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Docs" ng-click="goToDocs()">
                <i class="material-icons">description</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('sidenav')">
                <i class="material-icons">menu</i>
              </md-button>
            </div>
          </md-toolbar>

          <md-content layout-fill layout="row" flex>
            <md-tabs flex md-selected="selectedIndex" md-border-bottom md-autoselect>
              <md-tab label='{{selected.vehicle.name}}'>
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="veh in launchVehicles"
                                  ng-click='selectVehicle(veh)'
                                  md-rowspan="1"
                                  md-colspan="2"
                                  md-colspan-sm="1" >
                      <div>{{veh.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab label="{{selected.site.name}}">
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="site in launchSites"
                                  ng-click='selectSite(site)'
                                  md-rowspan="1"
                                  md-colspan="2"
                                  md-colspan-sm="1" >
                      <div>{{site.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab label='{{selected.payload.name}}'>
                <md-content>
                  <md-grid-list
                    md-cols-xs="1" md-cols-sm="2" md-cols-md="4" md-cols-gt-md="6"
                    md-row-height-gt-md="1:1" md-row-height="2:2"
                    md-gutter="12px" md-gutter-gt-sm="8px">
                    <md-grid-tile ng-repeat="payload in payloads"
                                  ng-click='selectPayload(payload)'
                                  md-rowspan="1"
                                  md-colspan="2"
                                  md-colspan-sm="1" >
                      <div>{{payload.name}}</div>
                    </md-grid-tile>
                  </md-grid-list>
                </md-content>
              </md-tab>
              <md-tab ng-repeat="stage in stages" label="{{stage.name}}">
              </md-tab>
            </md-tabs>
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
            <md-list flex="none">
              <md-subheader class="md-no-sticky">Upcoming Missions</md-subheader>
              <md-list-item ng-repeat="mission in upcoming" ng-click="selectMission(mission.code)">
                <span class="md-secondary">{{mission.name}}</span>
              </md-list-item>
              <md-subheader class="md-no-sticky">Past Missions</md-subheader>
              <md-list-item ng-repeat="mission in past" ng-click="selectMission(mission.code)">
                <span class="md-secondary">{{mission.name}}</span>
              </md-list-item>
              <md-divider></md-divider>
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
