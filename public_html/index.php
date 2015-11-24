<?php

$token = '';
if(isset($_COOKIE['authToken'])) {
    $token = $_COOKIE['authToken'];
}

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
    <script src="js/core.js"></script>
    <script src="js/home.js"></script>
    
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />
    
    <meta property="og:title" content="Flight Club Home" />
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
  <body id="home">
    <div class="bg">
      <img src="images/background.jpg" alt="background"/>
    </div>
    <div class="container">
      <div class="row row-offcanvas row-offcanvas-right vfill">
        <div class="col-xs-12 col-sm-9 vfill rborder">
          <form id="submitForm" class="vfill">
            <?php
            if(isset($token) && $token !== '') {
              echo '<input type="hidden" name="auth.token" value="'.$token.'"/>'."\n";
            }
            ?>
            <div class="row vfill">
              <div class="col-xs-12 vfill">
                <div id="tabs" class="row">
                  <nav class="col-xs-12">
                    <ul class="nav nav-tabs">
                      <li class="visible-xs right" data-toggle="offcanvas"><a href="#" role="tab" data-toggle="tab"><span class="fa fa-bars"></span></a></li>
                      <li id="launch" class="right"><a href="#" role="tab" data-toggle="tab"><span class="fa fa-play"></span></a></li>
                      <li id="info" class="hidden-xs right"><a href="docs/"><span class="fa fa-info-circle"></span></a></li>
                      <?php
                      if(isset($token) && $token !== '') {
                        echo '<li id="logout" class="hidden-xs right"><a href="#"><span class="fa fa-sign-out"></span></a></li>'."\n";
                        echo '<li id="copy" class="hidden-xs right"><a href="#"><span class="fa fa-copy"></span></a></li>'."\n";
                        echo '<li id="update" class="hidden-xs right"><a href="#"><span class="fa fa-save"></span></a></li>'."\n";
                      }
                      else {
                        echo '<li id="login" class="hidden-xs right"><a href="login.php"><span class="fa fa-sign-in"></span></a></li>'."\n";
                      }
                      ?>
                    </ul>
                  </nav>
                </div>
                <div id="tab-content" class="tab-content">
                  
                  <div class="tab-pane fade active in" id="core">
                    <div class="row tmargin1">
                      <div id="sites" class="col-sm-6">
                        <nav class="col-xs-12" style="overflow-y:hidden">
                          <ul class="slideList nav nav-pills nav-stacked">
                            <li class="col-xs-12">
                              <span class="col-xs-12 slideTag header">Launch Sites</span>
                              <ul class="slideItem col-xs-12 nav nav-pills nav-stacked">
                              </ul>
                            </li>
                          </ul>
                        </nav>
                        <select name="Mission.launchsite" style="visibility:hidden">
                        </select>
                      </div>
                      <div id="vehicles" class="col-sm-6">
                        <nav class="col-xs-12" style="overflow-y:hidden">
                          <ul class="slideList nav nav-pills nav-stacked">
                            <li class="col-xs-12">
                              <span class="col-xs-12 slideTag header">Launch Vehicles</span>
                              <ul class="slideItem col-xs-12 nav nav-pills nav-stacked">
                              </ul>
                            </li>
                          </ul>
                        </nav>
                        <select name="Mission.launchvehicle" style="visibility:hidden">
                        </select>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
            <div id="saveInfo">
              <div class="row">
                <div class="col-xs-6">Mission Code</div>
                <div class="col-xs-6">
                  <div class="input-group"><input type="text" name="Mission.code" class="form-control" value=""/></div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-6">Launch Date</div>
                <div class="col-xs-6">
                  <div class="input-group"><input type="text" name="Mission.date" class="form-control" value=""/></div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-6">Launch Time (UTC)</div>
                <div class="col-xs-6">
                  <div class="input-group"><input type="text" name="Mission.time" class="form-control" value=""/></div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-6">Display</div>
                <div class="col-xs-6">
                  <div class="input-group"><select name="Mission.display" class="form-control"><option value="true">On</option><option value="false">Off</option></select></select></div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-offset-6 col-sm-6"><a href="#"><span class="fa fa-save"> Save</span></a></div>
              </div>
            </div>
            <div id="copyInfo">
              <div class="row">
                <div class="col-xs-6">New Mission Code</div>
                <div class="col-xs-6">
                  <div class="input-group"><input type="text" name="Mission.newcode" class="form-control" value=""/></div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-6">Description</div>
                <div class="col-xs-6">
                  <div class="input-group"><input type="text" name="Mission.description" class="form-control" value=""/></div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-offset-6 col-sm-6"><a href="#"><span class="fa fa-save"> Save</span></a></div>
              </div>
            </div>
          </form>
        </div>
        <nav id="head" class="col-xs-3 col-sm-3 sidebar-offcanvas">
          <div id="navHeader">Manifested Missions</div>
          <div id="headList">
            <ul class="nav nav-pills nav-stacked">
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </body>
</html>