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
    <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'></script>
    <!-- Latest compiled and minified CSS -->
    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css'>
    <!-- Optional theme -->
    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <!-- Latest compiled and minified JavaScript -->
    <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js'></script>
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <script src="js/jquery.cookie.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script src="js/core.js"></script>
    <script src="js/results_v2.js"></script>    

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
  <body id="results">
    <div class='container'>
      <div class="row row-offcanvas row-offcanvas-right vfill">
        <nav class='navbar navbar-default'>
          <!-- Brand and toggle get grouped for better mobile display -->
          <div class="left lmargin0 navbar-brand">
            <a href="index.php"><span class="fa fa-home"></span></a>
          </div>
          <span id="missionTag" class='navbar-brand'></span>
          <div class="right rmargin0 navbar-brand" data-toggle="offcanvas">
            <a href="#" role="tab" data-toggle="tab"><span class="fa fa-bars"></span></a>
          </div>
        </nav>
        <div id="resultsOffCanvas" class="col-xs-9 col-sm-3 sidebar-offcanvas">
          <ul class="slideList nav nav-pills nav-stacked">
            <?php
            if ($payload !== '') {
              echo '<li id="watchButton" class="col-xs-12"><a href="live.php?code=' . $payload . '"><span>Watch Live</span></a></li>' . "\n";
            }
            if(isset($token) && $token !== '') {
              echo '<li id="liveInitButton" class="col-xs-12"><span class="col-xs-10 slideTag">Override Live Plots</span><span id="overrideStatus"/></li>' . "\n";
            }
            ?>
            <li class="col-xs-12 warnings"><span class="col-xs-10 slideTag">Warnings</span></li>
            <li class="col-xs-12 events"><span class="col-xs-10 slideTag">Event Log</span></li>
            <li class="col-xs-12 landing"><span class="col-xs-10 slideTag">Landing</span><ul class="slideItem col-xs-12 nav nav-pills nav-stacked" style="display:none"></ul></li>
            <li class="col-xs-12 orbit"><span class="col-xs-10 slideTag">Orbit</span></li>
          </ul>
        </div>
        <div class="row">          
          <div class="col-sm-4"><div class="plot" id="globe"></div></div>
          <div class="col-sm-4"><div class="plot" id="altitude1"></div></div>
          <div class="col-sm-4"><div class="plot" id="altitude2"></div></div>
        </div>
        <div class="row">
          <div class="col-sm-4"><div class="plot" id="profile1"></div></div>
          <div class="col-sm-4"><div class="plot" id="total-dv"></div></div>
          <div class="col-sm-4"><div class="plot" id="velocity1"></div></div>
         </div>
        <div class="row">
          <div class="col-sm-4"><div class="plot" id="velocity2"></div></div>
          <div class="col-sm-4"><div class="plot" id="prop"></div></div>
          <div class="col-sm-4"><div class="plot" id="phase1"></div></div>
        </div>
        <div class="row">
          <div class="col-sm-4"><div class="plot" id="q"></div></div>
          <div class="col-sm-4"><div class="plot" id="accel1"></div></div>
          <div class="col-sm-4"><div class="plot" id="accel2"></div></div>
        </div>
        <div class="row">
          <div class="col-sm-4"><div class="plot" id="aoa"></div></div>
          <div class="col-sm-4"><div class="plot" id="aov"></div></div>
          <div class="col-sm-4"><div class="plot" id="aop"></div></div>
        </div>
      </div>
    </div>
  </body>
</html>
