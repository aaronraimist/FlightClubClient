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
    <script src="js/core.js"></script>
    <script src="js/results.js"></script>    

    <link rel='stylesheet' href='css/style.css' />
    <link rel='stylesheet' href='css/mobile-style.css' />
    <link rel='stylesheet' href='css/large-style.css' />
    <link rel='shortcut icon' href='images/favicon.ico' type='image/x-icon'>
  </head>
  <body id="results">
    <div class='bg'>
      <img src='images/background.jpg' alt='background' />
    </div>
    <div class='container'>
      <div class="row row-offcanvas row-offcanvas-right vfill">
        <nav class='navbar navbar-default'>
          <!-- Brand and toggle get grouped for better mobile display -->
          <span id="missionTag" class='lmargin0 navbar-brand'></span>
          <div class="right rmargin0 navbar-brand" data-toggle="offcanvas">
            <a href="#" role="tab" data-toggle="tab"><span class="fa fa-bars"></span></a>
          </div>
          <span id="missionTag" class='navbar-brand right'></span>
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
            <li class="col-xs-12 landing"><span class="col-xs-10 slideTag">Landing</span></li>
            <li class="col-xs-12 orbit"><span class="col-xs-10 slideTag">Orbit</span></li>
          </ul>
        </div>
        <div class="resultGrid">
        </div>
      </div>
    </div>
  </body>
</html>
