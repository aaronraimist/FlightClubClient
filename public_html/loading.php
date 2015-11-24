<!doctype html>
<html>
  <head>
    <title>Loading...</title>
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

    <script src="js/core.js"></script>
    <script src="js/loading.js"></script>
    
    <link href='https://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/mobile-style.css" />
    <link rel="stylesheet" href="css/large-style.css" />
    
    <meta property="og:title" content="Loading..." />
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
  <body id="load">
    <div class="bg">
      <img src="images/background.jpg" alt="background"/>
    </div>
    <div class="container">
      <div class="row row-offcanvas row-offcanvas-right vfill">
        <div class="col-xs-12 col-sm-12 progress-container">
          <div class="text_full centre">
            Calculating trajectory...</br>
          </div>
          <div id="rocket" class="tmargin1">
            <img src="images/rocket_large.png" alt="rocket"/>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>