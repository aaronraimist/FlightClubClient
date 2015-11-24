<!DOCTYPE html>
<!--
    This file is part of FlightClub.

    Copyright © 2014-2015 Declan Murphy

    FlightClub is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    FlightClub is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with FlightClub.  If not, see <http://www.gnu.org/licenses/>.
-->
<html>
  <head>
    <title>Login</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>

    <script src="js/jquery.cookie.js"></script>
    <script src="js/form2js.js"></script>
    <script src="js/core.js"></script>
    <script src="js/login.js"></script>

    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />

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
  <body id="login">
    <div class="bg">
      <img src="images/background.jpg" alt="background"/>
    </div>
    <div class="container">
      <nav class="navbar navbar-default">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="left lmargin0 navbar-brand">
          <a href="index.php"><span class="fa fa-home"></span></a>
        </div>
        <div class="navbar-header">
          <a class="navbar-brand left" href="#"><span>Login</span></a>
        </div>
      </nav>
      <form id="loginForm" method="POST" class="tmargin1">
        <div class="row"><div class="col-xs-4 col-sm-offset-4 col-sm-2">Username</div><div class="col-xs-7 col-sm-3"><div class="input-group"><input title="" type="text" class="form-control" value="" name="Login.username"/></div></div></div>
        <div class="row"><div class="col-xs-4 col-sm-offset-4 col-sm-2">Password</div><div class="col-xs-7 col-sm-3"><div class="input-group"><input title="" type="password" class="form-control" value="" name="Login.password"/></div></div></div>
        <div class="row"><div class="col-sm-offset-4 col-sm-4"><button type="submit" class="btn btn-default"><span class="fa fa-play fa-2x"></span></button></div></div>
      </form>
    </div>
    <footer class="footer">
      Created by <a href="http://www.decmurphy.com">Declan</a>, a.k.a /u/TheVehicleDestroyer, for the community at /r/SpaceX.<br>
      This app is purely for entertainment purposes. I have no affiliation with SpaceX whatsoever. Yet.
    </footer>
  </body>
</html>
