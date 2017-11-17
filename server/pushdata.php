<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");

$pdo = new PDO(PDO_URL, PDO_USERNAME, PDO_PASSWORD);

$postBody = file_get_contents('php://input');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($postBody))
{
	$decodedPostBody = json_decode($postBody);
	var_dump($decodedPostBody);

	$json_fields = ['trusted_person', 'eskan', 'salamat',
	'amoozesh', 'qaza', 'miras', 'rosoom', 'keshavarzi',
	'haqe_ab', 'tejarat', 'tourism', 'mali', 'barq', 'mokhaberat',
	'zirsakht', 'tasfie_ab', 'modiriat', 'marta', 'hemaiat_ejtemaee'];

	$plain_fields = [
		'ostan', 'city', 'bakhsh', 'abadi', 'location',
		'date', 'user'
	];

	$all_fields = array_merge($plain_fields, $json_fields);

	$backquoted_join = join('`, `', $all_fields);
	$replacement_join = join(', :', $all_fields);
	$update_rec_join = "";
	foreach ($all_fields as $fname) {
		$update_rec_join .= "$fname = :$fname";
	}

	//
	// id, ostan, city, bakhsh, abadi, location, date, user, trusted_person, eskan,
	// salamat, amoozesh, qaza, miras, rosoom, keshavarzi, haqe_ab, tejarat, tourism,
	// mali, barq, mokhaberat, zirsakht, tasfie_ab, modiriat, marta, hemaiat_ejtemaee
	//
	$sqlString = "INSERT INTO `visits`(`visit_id`, `visit_name`, `$backquoted_join`) ".
	"VALUES (:visit_id, :visit_name, :$replacement_join ) ".
	"ON DUPLICATE KEY UPDATE visit_name = :visit_name, $update_rec_join;";
	$sql = $pdo->prepare($sqlString);

	$sql->bindParam(1, $_POST['visitId']);
	$sql->bindParam(2, $_POST['visitName']);

	foreach($json_fields as $fname) {
		$sql->bindParam(":" . $fname, $_POS['details'][$fname]);
	}

	$sql->bindParam(':ostan', $_POST['details']['0']['ostan']);
	$sql->bindParam(':city', $_POS['details']['0']['city']);
	$sql->bindParam(":bakhsh", $_POS['details']['0']['baksh']);
	$sql->bindParam(":abadi", $_POS['details']['0']['abadi']);
	$sql->bindParam(":location", $_POS['details']['0']['location']);
	$sql->bindParam(':date', $_POS['details']['0']['date']);

	$sql->execute();
}
