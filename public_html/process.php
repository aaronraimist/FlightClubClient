<?php

$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];
 
if (($name == "") || ($email == "") || ($message == "")) {
  $code = 404;
} else {
  $from = "From: $name<$email>\r\nReturn-path: $email";
  $subject = "FlightClub Mail";
  mail("murphd37@tcd.ie", $subject, $message, $from);
  $code = 200;
}
 
http_response_code($code);
return;
?>
