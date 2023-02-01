<?php
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\SMTP;

  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
  require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';

  if (isset($_POST['name']))
    $name = $_POST['name'];
  if (isset($_POST['email']))
    $email = $_POST['email'];
  if (isset($_POST['number']))
    $number = $_POST['number'];
  if (isset($_POST['comment']))
    $comment = $_POST['comment'];

  $recipient = "armand.asnani@gmail.com";
  $subj = "Kay Pee Jewelers Contact Us From: $name";
  $content = "Name: $name \nEmail: $email \nNumber: $number \nComment: $comment";

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

  echo $msg;
?>
