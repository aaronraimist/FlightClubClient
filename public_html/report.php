<?php

$message = $_POST['errors'];
 
if ($message == "") {
  $code = 404;
} else {
  $from = "From: Flight Club Errors<errors@flightclub.io>";
  $subject = "Flight Club Errors";
  mail("murphd37@tcd.ie", $subject, $message, $from);
  $code = 200;
}
 
http_response_code($code);
return;
?>
