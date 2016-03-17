<!doctype html>
<html>
  <head>
    <title>Flight Club | Donate</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='//fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <script src="//checkout.stripe.com/checkout.js"></script>
    <script src="js/core.js"></script>     
    <script src="js/donate.js"></script>
    
    <link rel="stylesheet" href="css/style.css" />

    <meta property="og:title" content="Donate" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="//www.flightclub.io" />
    <meta property="og:description" content="Donate to Flight Club" />
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
  <body ng-app="FCDonate" data-ng-element-ready="">
    <div ng-controller="DonateCtrl" style="min-height:100%" ng-cloak>
      <section layout="column" flex>

        <md-toolbar>
          <div class="md-toolbar-tools">
            <md-button class="md-icon-button" aria-label="Home" ng-click="redirect('/')">
              <i class="material-icons">home</i>
            </md-button>
            <h2>
              <span>Flight Club | Donate</span>
            </h2>
          </div>
        </md-toolbar>
        <md-content layout="column" layout-align="center center" layout-padding>
          <md-content layout="row">
            <md-content flex="5" flex-gt-sm="25"></md-content>
            <md-content flex>
              <p>You're donating! Thank you!</p>
              <p>Donations to Flight Club help me pay for my server costs and any other related charges.</p>
              <p>In the unlikely event I ever get more donations per month than my servers cost, I can buy more CPU power which means
                more, faster simulations. Woo! Science!</p>
            </md-content>
            <md-content flex="5" flex-gt-sm="25"></md-content>
          </md-content>
          <md-content>
            <md-input-container>
              <label>Amount (€)</label>
              <input ng-change="validate()" ng-model="amountEuro">
            </md-input-container>
          </md-content>
          <div>{{error}}</div>
          <md-button class="md-primary md-raised" ng-disabled="!valid" ng-click="click()">Donate</md-button>
        </md-content>

      </section>
    </div>
  </body>
</html>
