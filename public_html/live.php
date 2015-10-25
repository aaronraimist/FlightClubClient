<?php
$payload = '';
if (isset($_GET["code"])) {
  $payload = $_GET["code"];
}
?>

<!doctype html>
<html>
  <head>
    <title></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">

    <script src="js/core.js"></script>
    <script src="js/live.js"></script>

  </head>
  <body id="live">
    <div class="container">
      <nav class="navbar navbar-default">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="left lmargin0 navbar-brand">
          <a href="index.php"><span class="fa fa-home"></span></a>
        </div>
        <div class="navbar-header">
          <a class="navbar-brand left" href="#"><span>LiveLaunch</span></a></li>
        </div>
      </nav>
      <div class='textBox text_full centre live-info'>
      </div>
      <div class='liveInfo'>
        <div class='row'>
          <div id="clock" class="text_black text_full col-xs-4"></div>
          <div id="velocity" class="text_black text_full col-xs-4"></div>
          <div id="altitude" class="text_black text_full col-xs-4"></div>
        </div>
      </div>
    </div>
  </body>
</html>
