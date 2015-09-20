<?php

var_dump($_POST);

?>
<!doctype html>
<html>
  <head>
    <title>FlightClub</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>

    <script src="js/jquery.cookie.js"></script>
    <script src="js/form2js.js"></script>
    <script src="js/ajax_testing.js"></script>
    
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />

    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
  </head>
  <body id="home" onLoad="animate_rocket(30)">
    <div class="bg">
      <img src="images/background.jpg" alt="background"/>
    </div>
    <div class="container">
      <div class="row row-offcanvas row-offcanvas-right vfill">
        <div class="col-xs-12 col-sm-12 progress-container">
          <div class="text_full centre">
            Calculating trajectory...</br>
          </div>
          <div id="rocket">
            <img src="images/rocket_large.png" alt="rocket"/>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>