<!doctype html>
<html>
  <head>
    <title>Flight Club</title>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script src="js/core.js"></script>     
    <script src="js/results.js"></script>
    <link rel='stylesheet' href='css/style.css' />
    
    <meta property="og:title" content="Simulation Results" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="//www.flightclub.io" />
    <meta property="og:description" content="Flight Club is a rocket launch + landing simulator 
          and trajectory visualiser. Based on SpaceX's launch vehicles, it serves as a tool for
          checking how likely it is that a booster can return to the launch pad for upcoming missions." />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="//www.flightclub.io/images/og_image.png" />   

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
  <body id="results" ng-app="FCResults" data-ng-element-ready="">
    <div ng-controller="ResultsCtrl" ng-cloak>
      <section layout="row" flex>

        <md-content flex>
          <md-toolbar>
            <div class="md-toolbar-tools">
              <md-button class="md-icon-button" aria-label="Home" ng-click="goHome()">
                <i class="material-icons">home</i>
              </md-button>
              <h2>
                <span>{{"Flight Club | Results | " + missionName}}</span>
              </h2>
              <span flex></span>
              <md-button class="md-icon-button" aria-label="Home" ng-click="goToWorld()">
                <i class="material-icons">language</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('sidenav')">
                <i class="material-icons">menu</i>
              </md-button>
            </div>
          </md-toolbar>

          <div ng-show="isLoading" layout="row" layout-fill layout-align="center center">
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
          </div>

          <md-content style="overflow:hidden">
            <md-grid-list
              md-cols="3" md-cols-md="6" md-cols-gt-md="9"
              md-row-height="1:1"
              md-gutter-gt-md="16px" md-gutter="8px">
              <md-grid-tile
                ng-repeat="plot in plotTiles"
                id="{{plot.title}}"
                md-colspan="3"
                md-rowspan="3">
              </md-grid-tile>
            </md-grid-list>
          </md-content>

          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="sidenav" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>{{missionName}}</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('sidenav')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
            <md-divider></md-divider>
            <md-list>
              <md-subheader class="md-no-sticky">Options</md-subheader>
              <md-list-item ng-click="goToLive()">
                <span class="md-secondary">Watch Live!</span>
              </md-list-item>
              <md-list-item ng-click="overrideLive()" ng-show="authorised">
                <i class="material-icons" ng-show="overrideAttempted">{{overrideStatus}}</i><span class="md-secondary">Override Live Plot</span>
              </md-list-item>
              <md-divider></md-divider>
              <md-subheader class="md-no-sticky">More Simulation Data</md-subheader>
              <md-list-item ng-click="toggleNav('warnings')" ng-show="{{warnings.length>0}}">
                <span class="md-secondary">Warnings</span>
              </md-list-item>
              <md-list-item ng-click="toggleNav('events')">
                <span class="md-secondary">Event Log</span>
              </md-list-item>
              <md-list-item ng-click="toggleNav('landing')">
                <span class="md-secondary">Landing Params</span>
              </md-list-item>
              <md-list-item ng-click="toggleNav('orbit')">
                <span class="md-secondary">Orbital Params</span>
              </md-list-item>
              <md-divider></md-divider>
            </md-list>
          </md-sidenav>
          
          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="warnings" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>Warnings</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('warnings')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
            <md-divider></md-divider>
            <md-content flex layout-padding>
              <md-list>
                <md-list-item class="md-3-line" ng-repeat="item in warnings">
                  <div class="md-list-item-text" layout="column">
                    <h3>{{ item }}</h3>
                  </div>
                </md-list-item>
              </md-list>            
            </md-content>
          </md-sidenav>
          
          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="events" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>Event Log</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('events')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
              <md-divider></md-divider>
            <md-content flex layout-padding>
              <md-list>
                <md-list-item class="md-3-line" ng-repeat="item in events">
                  <div class="md-list-item-text" layout="column">
                    <h3>{{ item.when }}</h3>
                    <h4>{{ item.what }}</h4>
                  </div>
                </md-list-item>
              </md-list>
            </md-content>
            </md-list>
          </md-sidenav>
          
          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="landing" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>Landing Params</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('landing')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
            <md-divider></md-divider>
            <md-content flex layout-padding>
              <md-list>
                <md-list-item class="md-3-line" ng-repeat="item in landing">
                  <div class="md-list-item-text" layout="column">
                    <h3>{{ item.when }}</h3>
                    <h4>{{ item.what }}</h4>
                  </div>
                </md-list-item>
              </md-list>            
            </md-content>
            </md-list>
          </md-sidenav>
          
          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="orbit" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo" layout="row" layout-align="space-between center" >
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>Orbital Params</span></h1>
              </div>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleNav('orbit')">
                <i class="material-icons">keyboard_arrow_right</i>
              </md-button>
            </md-toolbar>
            <md-divider></md-divider>
            <md-content flex layout-padding>
              <md-list>
                <md-list-item class="md-3-line" ng-repeat="item in orbit">
                  <div class="md-list-item-text" layout="column">
                    <h3>{{ item.when }}</h3>
                    <h4>{{ item.what }}</h4>
                  </div>
                </md-list-item>
              </md-list>            
            </md-content>
            </md-list>
          </md-sidenav>

        </md-content>

      </section>
    </div> 
  </body>
</html>
