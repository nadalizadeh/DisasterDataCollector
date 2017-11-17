<?php
require_once 'config.php';

$formAliases = array(
	'trusted_person' => '1',
	'eskan' => '1-1',
	'salamat' => '1-2',
	'amoozesh' => '1-3',
	'qaza' => '1-4',
	'miras' => '1-5',
	'rosoom' => '1-6',
	'keshavarzi' => '2-1',
	'haqe_ab' => '2-2',
	'tejarat' => '2-3',
	'tourism' => '2-4',
	'mali' => '2-5',
	'barq' => '3-1',
	'mokhaberat' => '3-2',
	'zirsakht' => '3-3',
	'transportation' => '3-4',
	'tasfie_ab' => '3-5',
	'modiriat' => '4-1',
	'marta' => '4-2',
	'hemaiat_ejtemaee' => '4-3'
);

header("Access-Control-Allow-Origin: *");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$pdo = new PDO(PDO_URL, PDO_USERNAME, PDO_PASSWORD);

$postBody = file_get_contents('php://input');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($postBody))
{
	$all_fields = array_merge($plain_fields, $json_fields);

	$backquoted_join = join('`, `', $all_fields);
	$replacement_join = join(', :', $all_fields);
	$update_rec_join = "";
	foreach ($all_fields as $fname) {
		$update_rec_join .= ", $fname = :$fname";
	}

	//
	// id, ostan, city, bakhsh, abadi, location, date, user, trusted_person, eskan,
	// salamat, amoozesh, qaza, miras, rosoom, keshavarzi, haqe_ab, tejarat, tourism,
	// mali, barq, mokhaberat, zirsakht, tasfie_ab, modiriat, marta, hemaiat_ejtemaee
	//
	$sqlString = "INSERT INTO `visits` (`visit_id`, `visit_name`, `$backquoted_join`) ".
	"VALUES (:visit_id, :visit_name, :$replacement_join ) ".
	"ON DUPLICATE KEY UPDATE visit_name = :visit_name $update_rec_join;";
	$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );

	$sql = $pdo->prepare($sqlString);

	if (!$sql) {
	    echo "\nPDO::errorInfo():\n";
	    print_r($pdo->errorInfo());
	}

	$decodedPostBody = json_decode($postBody, true);
	var_dump($decodedPostBody);

	foreach($decodedPostBody['items'] as $theItem) {
		$userId = 0;
		$sql->bindParam(':user_id', $userId);
		$sql->bindParam(':visit_id', $theItem['visitId']);
		$sql->bindParam(':visit_name', $theItem['visitName']);

		$sql->bindParam(':ostan', $theItem['details']['0']['ostan']);
		$sql->bindParam(':city', $theItem['details']['0']['city']);
		$sql->bindParam(":bakhsh", $theItem['details']['0']['citypart']);
		$sql->bindParam(":abadi", $theItem['details']['0']['roosta']);
		$sql->bindParam(":latitude", floatVal($theItem['details']['0']['latitude']));
		$sql->bindParam(":longitude", floatVal($theItem['details']['0']['longitude']));
		$sql->bindParam(':date', $theItem['details']['0']['date']);

		$emptyStr = '';
		foreach ($json_fields as $fname) {
			if (!isset($formAliases[$fname])) {
				$sql->bindParam(':' . $fname, $emptyStr);
				continue;
			}

			$alias = $formAliases[$fname];
			if (! isset($theItem['details'][$alias])) {
				$sql->bindParam(':' . $fname, $emptyStr);
				continue;
			}

			unset($valToSet);
			$valToSet = json_encode($theItem['details'][$alias]);
			$sql->bindParam(':' . $fname, $valToSet);
		}

		$result = $sql->execute();

		if (!$result) {
	    echo "\nPDO::errorInfo():\n";
	    print_r($pdo->errorInfo());
		}
	}
}
