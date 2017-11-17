<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");

$pdo = new PDO(PDO_URL, PDO_USERNAME, PDO_PASSWORD);

$postBody = file_get_contents('php://input');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($postBody))
{
	$decodedPostBody = json_decode($postBody, true);
	var_dump($decodedPostBody);

	$json_fields = ['trusted_person', 'eskan', 'salamat',
	'amoozesh', 'qaza', 'miras', 'rosoom', 'keshavarzi',
	'haqe_ab', 'tejarat', 'tourism', 'mali', 'barq', 'mokhaberat',
	'zirsakht', 'tasfie_ab', 'modiriat', 'marta', 'hemaiat_ejtemaee'];

	$plain_fields = [
		'ostan', 'city', 'bakhsh', 'abadi',
		'latitude', 'longitude', 'date', 'user_id'
	];

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
	var_dump($sqlString);
	$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );

	$sql = $pdo->prepare($sqlString);

	if (!$sql) {
	    echo "\nPDO::errorInfo():\n";
	    print_r($pdo->errorInfo());
	}

	$userId = 0;
	$sql->bindParam(':user_id', $userId);
	$sql->bindParam(':visit_id', $decodedPostBody['visitId']);
	$sql->bindParam(':visit_name', $decodedPostBody['visitName']);

	$sql->bindParam(':ostan', $decodedPostBody['details']['0']['ostan']);
	$sql->bindParam(':city', $decodedPostBody['details']['0']['city']);
	$sql->bindParam(":bakhsh", $decodedPostBody['details']['0']['citypart']);
	$sql->bindParam(":abadi", $decodedPostBody['details']['0']['roosta']);
	$sql->bindParam(":latitude", $decodedPostBody['details']['0']['latitude']);
	$sql->bindParam(":longitude", $decodedPostBody['details']['0']['longitude']);
	$sql->bindParam(':date', $decodedPostBody['details']['0']['date']);

	$formAliases = array(
		'trusted_person' => '1',
		'eskan' => '1-1',
		'salamat' => '1-2',
		'amoozesh' => '1-3',
		'qaza' => '',
		'miras' => '',
		'rosoom' => '',
		'keshavarzi' => '',
		'haqe_ab' => '',
		'tejarat' => '',
		'tourism' => '',
		'mali' => '',
		'barq' => '',
		'mokhaberat' => '',
		'zirsakht' => '',
		'tasfie_ab' => '',
		'modiriat' => '',
		'marta' => '',
		'hemaiat_ejtemaee' => ''
	);

	$emptyStr = '';
	foreach ($json_fields as $fname) {
		if (!isset($formAliases[$fname])) {
			$sql->bindParam(':' . $fname, $emptyStr);
			continue;
		}

		$alias = $formAliases[$fname];
		if (! isset($decodedPostBody['details'][$alias])) {
			$sql->bindParam(':' . $fname, $emptyStr);
			continue;
		}

		unset($valToSet);
		$valToSet = json_encode($decodedPostBody['details'][$alias]);
		$sql->bindParam(':' . $fname, $valToSet);
	}

	$result = $sql->execute();

	if (!$result) {
    echo "\nPDO::errorInfo():\n";
    print_r($pdo->errorInfo());
	}
}
