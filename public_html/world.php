<!doctype html>
<html>
  <head>
    <title>Flight Club World</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='//fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <script src="//cesiumjs.org/releases/1.17/Build/Cesium/Cesium.js"></script>
    <link rel="stylesheet" href="//cesiumjs.org/releases/1.17/Build/Cesium/Widgets/widgets.css" /> 
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />

    <meta property="og:title" content="LiveLaunch!" />
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
  <body id="world" ng-app="FCWorld" data-ng-element-ready="">
    <div ng-controller="sideNavCtrl" layout="column" flex layout-fill ng-cloak>
      <section layout="row" flex>

        <md-content ng-show="countdown || finished" flex layout="column" layout-align='space-around center'>
          <md-toolbar>
            <div class="md-toolbar-tools">
              <md-button class="md-icon-button" aria-label="Home" ng-click="goHome()">
                <i class="material-icons">home</i>
              </md-button>
              <h2>
                <span>{{missionName + " Live"}}</span>
              </h2>
            </div>
          </md-toolbar>
          <md-content flex></md-content>
          <md-content flex layout-fill class='md-primary centre'>
            <div ng-show="countdown">
              <h3 class=".md-display-3">{{missionName}} will launch in</h3>
              <md-divider></md-divider>
              <h2 class=".md-display-3">{{days}}</h2>
              <h2 class=".md-display-3">{{hours}}</h2>
              <h2 class=".md-display-3">{{minutes}}</h2>
              <h2 class=".md-display-3">{{seconds}}</h2>
            </div>
            <div ng-show="finished">
              <h3 class=".md-display-3">{{missionName}} has already launched</h3>
              <md-divider></md-divider>
              <a class=".md-display-3" ng-href="{{'world.php?watch=2&code='+missionCode}}">Rewatch the launch here</a>
            </div>
          </md-content>
          <md-content flex></md-content>
        </md-content>

        <md-content ng-show="cesiumShow" flex>
          <div id="cesiumContainer"></div>
          <div style="position:fixed;">
            <md-button class="md-icon-button md-primary" hide-gt-sm ng-click="toggle()">
              <i class="material-icons">menu</i>
            </md-button>
            <md-menu md-offset="40 0">
              <md-button class="md-icon-button md-primary" ng-click="$mdOpenMenu($event)">
                <i class="material-icons">language</i>
              </md-button>
              <md-menu-content width="7">
                <md-menu-item id="creditContainer">
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </div>
        </md-content>

        <md-sidenav ng-show="cesiumShow && sidebarShow" flex layout="column" class="md-sidenav-right md-whiteframe-z2" md-component-id="right" md-is-locked-open="$mdMedia('gt-sm')">
          <md-toolbar class="md-theme-indigo">
            <div class="md-toolbar-tools" layout="row" layout-align="space-around center" flex>
              <h1><span>{{missionName}}</span></h1>
              <md-button class="md-raised" ng-click="clickStage(0)">{{stage0}}</md-button>
              <md-button class="md-raised" ng-click="clickStage(1)">{{stage1}}</md-button>
            </div>
          </md-toolbar>
          <md-content>
            <div layout="column" layout-align="space-around center">
              <p>{{clock}}</p>
            </div>
          </md-content>
          <md-divider></md-divider>
          <md-content flex layout="column" layout-align="space-around center">
            <div layout-fill layout="column" layout-align="center center">
              <span id="altitudeTel{{selectedStage}}"></span>
              <div class="plot" id="altitudePlot{{selectedStage}}"></div>
            </div>
            <div layout-fill layout="column" layout-align="center center">
              <span id="velocityTel{{selectedStage}}"></span>
              <div class="plot" id="velocityPlot{{selectedStage}}"></div>
            </div>
          </md-content>
        </md-sidenav>

      </section>
    </div>
  <script src="js/flot.min.js"></script>
  <script src="js/core.js"></script>
  <script src="js/world.js"></script>
  <script src='js/playground.js'></script>   
  </body>
</html>
