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
    <script src="js/ajax_testing.js"></script>
    
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />

    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
  </head>
  <body id="home">
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
                      <li class="active"><a href="#core" role="tab" data-toggle="tab">Core</a></li>
                      <li class="visible-xs right" data-toggle="offcanvas"><a href="#" role="tab" data-toggle="tab"><span class="fa fa-bars"></span></a></li>
                      <li id="launch" class="right"><a href="#" role="tab" data-toggle="tab"><span class="fa fa-play"></span></a></li>
                      <li id="info" class="hidden-xs right"><a href="docs/"><span class="fa fa-info-circle"></span></a></li>
                      <?php
                      if(isset($token) && $token !== '') {
                        echo '<li id="logout" class="hidden-xs right"><a href="#"><span class="fa fa-sign-out"></span></a></li>'."\n";
                        echo '<li id="remove" class="hidden-xs right"><a href="#"><span class="fa fa-remove"></span></a></li>'."\n";
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
        <nav id="head" class="col-xs-9 col-sm-3 sidebar-offcanvas">
          <ul class="nav nav-pills nav-stacked">
          </ul>
        </nav>
      </div>
    </div>
  </body>
</html>