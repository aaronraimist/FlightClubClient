<?php
$payload = '';
if (isset($_GET["code"])) {
  $payload = $_GET["code"];
}
$token = '';
if(isset($_COOKIE['authToken'])) {
    $token = $_COOKIE['authToken'];
}
?>

<!doctype html>
<html>
  <head>
    <title></title>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'> 

    <link rel='stylesheet' href='css/style.css' />
    <link rel='stylesheet' href='css/mobile-style.css' />
    <link rel='stylesheet' href='css/large-style.css' />
    
    <meta property="og:title" content="Simulation Results" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="http://www.flightclub.io" />
    <meta property="og:description" content="Flight Club is a rocket launch + landing simulator 
          and trajectory visualiser. Based on SpaceX's launch vehicles, it serves as a tool for
          checking how likely it is that a booster can return to the launch pad for upcoming missions." />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="http://www.flightclub.io/images/og_image.png" />   

    <link rel="apple-touch-icon" sizes="57x57" href="images/favicon-round/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="images/favicon-round/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/favicon-round/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="images/favicon-round/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/favicon-round/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="images/favicon-round/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="images/favicon-round/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="images/favicon-round/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="images/favicon-round/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192"  href="images/favicon-round/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-round/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="images/favicon-round/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-round/favicon-16x16.png">
    <link rel="manifest" href="images/favicon-round/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="images/favicon-round/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
  </head>
  <body ng-app="FCResults" data-ng-element-ready="">
    <div ng-controller="ResultsCtrl as appCtrl" ng-cloak>
      <section layout="row" flex>

        <md-content flex>
          <md-toolbar>
            <div class="md-toolbar-tools">
              <md-button class="md-icon-button" aria-label="Home" ng-click="goHome()">
                <i class="material-icons">home</i>
              </md-button>
              <h2>
                <span>{{missionName}}</span>
              </h2>
              <span flex></span>
              <md-button class="md-icon-button" aria-label="Home" ng-click="goToWorld()">
                <i class="material-icons">language</i>
              </md-button>
              <md-button class="md-icon-button" aria-label="Menu" ng-click="toggleSideNav()">
                <i class="material-icons">menu</i>
              </md-button>
            </div>
          </md-toolbar>

          <div ng-show="isLoading" layout="row" layout-fill layout-align="center center">
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
          </div>

          <md-content>
            <md-grid-list
              md-cols-gt-md="12" md-cols="4" md-cols-md="8"
              md-row-height="1:1"
              md-gutter-gt-md="16px" md-gutter-md="8px" md-gutter="4px">
              <md-grid-tile
                ng-repeat="tile in appCtrl.plotTiles"
                id="{{tile.title}}"
                md-colspan-gt-sm="{{tile.colspan}}"
                md-rowspan-gt-sm="{{tile.rowspan}}">
              </md-grid-tile>
            </md-grid-list>
          </md-content>

          <md-sidenav flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="sidenav" md-is-locked-open="false">
            <md-toolbar class="md-theme-indigo">
              <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
                <h1><span>{{missionName}}</span></h1>
              </div>
            </md-toolbar>
            <md-divider></md-divider>
            <md-list>
              <md-subheader class="md-no-sticky">Options</md-subheader>
              <md-list-item ng-click="goToLive()">
                <span class="md-secondary">Watch Live!</span>
              </md-list-item>
              <md-divider></md-divider>
              <md-subheader class="md-no-sticky">More Simulation Data</md-subheader>
              <md-list-item ng-click="doSecondaryAction($event)">
                <span class="md-secondary">Warnings</span>
              </md-list-item>
              <md-list-item ng-click="doSecondaryAction($event)">
                <span class="md-secondary">Event Log</span>
              </md-list-item>
              <md-list-item ng-click="doSecondaryAction($event)">
                <span class="md-secondary">Landing Params</span>
              </md-list-item>
              <md-list-item ng-click="doSecondaryAction($event)">
                <span class="md-secondary">Orbital Params</span>
              </md-list-item>
              <md-divider></md-divider>
            </md-list>
          </md-sidenav>

        </md-content>

      </section>
    </div>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="js/core.js"></script>     
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script src="js/results_v3.js"></script>     
  </body>
</html>
