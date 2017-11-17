<?php
require_once 'config.php';

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$pdo = new PDO(PDO_URL, PDO_USERNAME, PDO_PASSWORD);

$stmt = $pdo->prepare('SELECT * FROM visits');
$stmt->execute();
$result = $stmt->fetchAll();

// echo "<pre>";
// var_dump($result);
// echo "</pre>";

$plain_fields = array_merge(['id'], $plain_fields);

?>
<!DOCTYPE html>
<html>
<head>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

  <!-- jQuery library -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

  <!-- Latest compiled JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>
<body>
  <table class='table table-striped'>
    <tr>
      <?php foreach($plain_fields as $col): ?>
      <th><?= $col ?></th>
      <?php endforeach; ?>
      <?php foreach($json_fields as $col): ?>
      <th><?= $col ?></th>
      <?php endforeach; ?>
    </tr>
    <?php foreach($result as $res): ?>
      <tr>
        <?php foreach($plain_fields as $col): ?>
        <td><?= $res[$col] ?></td>
        <?php endforeach; ?>
        <?php foreach($json_fields as $col): ?>
          <?php $str = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function ($match) {
    return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE');
}, $res[$col]); ?>
        <td><?= $str ?></td>
        <?php endforeach; ?>
      </tr>
    <?php endforeach; ?>
  </table>
</body>
</html>
