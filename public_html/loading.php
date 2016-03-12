<!doctype html>
<html>
  <head>
    <title>Flight Club | Loading</title>
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
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <script src="js/core.js"></script>     
    <script src="js/loading.js"></script>
    <link rel="stylesheet" href="css/style.css" />

    <meta property="og:title" content="Loading" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="http://www.flightclub.io" />
    <meta property="og:description" content="Loading Simulation" />
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
  <body ng-app="FCLoad" data-ng-element-ready="">
    <div ng-controller="LoadCtrl" ng-cloak layout-fill>
      <section layout="column" flex layout-fill>

        <md-toolbar>
          <div class="md-toolbar-tools">
            <md-button class="md-icon-button" aria-label="Home" ng-click="goHome()">
              <i class="material-icons">home</i>
            </md-button>
            <h2>
              <span>Flight Club | Loading</span>
            </h2>
          </div>
        </md-toolbar>
        <md-content layout-fill layout="column" layout-align="space-around center">
          <md-content flex></md-content>
          <h2 flex>Calculating trajectory...</h2>
          <md-content style="width:100%" flex>
            <div id="rocket">
              <img alt="rocket"/>
            </div>
          </md-content>
          <md-content flex></md-content>
        </md-content>

      </section>
    </div>
  </body>
</html>
