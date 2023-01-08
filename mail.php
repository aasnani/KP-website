<?php
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\SMTP;

  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';

  echo '<script>alert("Here")</script>';
  return;

  if (isset($_POST['name']))
    $name = $_POST['name'];
  if (isset($_POST['city']))
    $city = $_POST['city'];
  if (isset($_POST['state']))
    $state = $_POST['state'];
  if (isset($_POST['zip']))
    $zip = $_POST['zip'];
  if (isset($_POST['email']))
    $email = $_POST['email'];
  if (isset($_POST['number']))
    $number = $_POST['number'];
  if (isset($_POST['address']))
    $address = $_POST['address'];
  if (isset($_POST['comment']))
    $comment = $_POST['comment'];
  // if ($name === '') {
  //   echo "Name cannot be empty.";
  //   die();
  // }
  // if ($email === '') {
  //   echo "Email cannot be empty.";
  //   die();
  // } else {
  //   if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  //     echo "Email format invalids.";
  //     die();
  //   }
  // }
  // if ($comment === '') {
  //   echo "Message cannot be empty.";
  //   die();
  // }

  // error_reporting(-1);
  // ini_set('display_errors', 'On');
  // set_error_handler("var_dump");


  $recipient = "armand.asnani@gmail.com";
  $subj = "Kaypee Jeweller Contact Us From: $name";
  $content = "Name: $name \nCity: $city \nState: $state \nZip: $zip \nEmail: $email \nNumber: $number \nAddress: $address \nComment: $comment";

  $mail = new PHPMailer();

  $mail->isSMTP();

  $mail->Host = 'kaypeejewelers.com';

  $mail->Port = 465;

  $mail->SMTPAuth = true;

  $mail->SMTPSecure = ssl;

  $mail->Username = '_mainaccount@kaypeejewelers.com';

  $mail->Password = 'sbyQyR8zYsKv';

  $mail->addAddress($recipient);

  $mail->setFrom('_mainaccount@kaypeejewelers.com');

  $mail->Subject = $subj;

  $mail->Body = $content;

  if (!$mail->send()) {
    $msg .= 'Mailer Error: ' . $mail->ErrorInfo;
  } else {
    $msg .= 'Message sent!';
  }


  // mail($recipient, $subj, $content, $headers) or die("Error!");
  // $result = mail($recipient, $subj, $content, $headers);
  // echo '<script>alert('.$result!')</script>';
  // print json_encode(array('message' => $msg, 'code' => 1));
  exit();
?>
