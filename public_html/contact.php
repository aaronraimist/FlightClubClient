<!doctype html>
<html>
  <head>
    <title>Flight Club | Contact</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.css">
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <script src="js/core.js"></script>     
    <script src="js/contact.js"></script>
    <link rel="stylesheet" href="css/style.css" />

    <meta property="og:title" content="Contact" />
    <meta property="og:site_name" content="Flight Club"/>
    <meta property="og:url" content="//www.flightclub.io" />
    <meta property="og:description" content="Login to Flight Club" />
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
  <body ng-app="FCContact" data-ng-element-ready="">
    <div ng-controller="ContactCtrl" layout="column" flex ng-cloak style='min-height: 100%'>
      <section layout="row" flex>
        
        <md-content layout="column" layout-align='space-around center'>
          <md-toolbar>
            <div class="md-toolbar-tools">
              <md-button class="md-icon-button" aria-label="Home" ng-click="redirect('/')">
                <i class="material-icons">home</i>
              </md-button>
              <h2>
                <span>Flight Club | Contact</span>
              </h2>
            </div>
          </md-toolbar>
          <md-content flex layout-fill layout-padding layout="column" layout-gt-xs="row" layout-align="space-around center">
            <md-content flex layout-fill layout-padding layout="column" layout-align="space-around center">
              <md-content flex>
                <p>Hi! I'm Declan, the creator of Flight Club. Hope you liked it!</p>
                <p>If you want to contact me with any bug reports, feature requests 
                  or just to say hi, the form on this page will mail me directly. 
                  I've also left links to my GitHub and LinkedIn down below if you're 
                  thinking of offering me a job.</p>
                <p>Thanks for checking out the site!</p>
              </md-content>
              <md-content flex></md-content>
              <md-content layout-fill layout='row' layout-align='space-around center'>
                <md-button flex layout-padding class='md-raised' ng-click='redirect("https://github.com/murphd37")'><i class="fa fa-2x fa-github"></i><br>GitHub</md-button>
                <md-button flex layout-padding class='md-raised' ng-click='redirect("https://ie.linkedin.com/in/declan-murphy-b9245787")'><i class="fa fa-2x fa-linkedin"></i><br>LinkedIn</md-button>
              </md-content>
            </md-content>
            <md-content layout-fill layout-padding flex>
              <form id="mailForm" layout-padding layout='column' layout-align='space-around center'>
                <div flex layout-fill layout-padding layout='column' layout-gt-sm='row' layout-align='space-between center'>
                  <md-input-container flex>
                    <label>Name</label>
                    <input ng-change="validate()" ng-model="form.name">
                  </md-input-container>
                  <md-input-container flex>
                    <label>Email</label>
                    <input ng-change="validate()" type="email" name="email" ng-model="form.email" ng-pattern="/^.+@.+\..+$/" />
                    <div ng-messages="mailForm.email.$error" role="alert">
                      <div ng-message-exp="['pattern']">
                        That doesn't look like an email address...
                      </div>
                    </div>
                  </md-input-container>
                </div>
                <div flex layout-fill layout-padding>
                    <label>Message</label>
                    <textarea ng-change="validate()" style='min-height:100px' layout-fill ng-model="form.message"></textarea>
                </div>
                <md-button ng-disabled="formDisabled" class="md-raised md-primary" type="submit" ng-click="sendMail()">Send Mail!</md-button>
                <md-icon ng-show="mailSuccess">done</md-icon>
              </form>
            </md-content>
          </md-content>
          <md-content flex></md-content>
        </md-content>
        
      </section>
    </div>
  </body>
</html>
