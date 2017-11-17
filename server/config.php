<?php

define('PDO_URL', 'mysql:host=127.0.0.1;dbname=disasterdb');
define('PDO_USERNAME', 'root');
define('PDO_PASSWORD', '');

$json_fields = ['trusted_person', 'eskan', 'salamat',
'amoozesh', 'qaza', 'miras', 'rosoom', 'keshavarzi',
'haqe_ab', 'tejarat', 'tourism', 'mali', 'barq', 'mokhaberat',
'zirsakht', 'transportation', 'tasfie_ab', 'modiriat',
'marta', 'hemaiat_ejtemaee'];

$plain_fields = [
  'ostan', 'city', 'bakhsh', 'abadi',
  'latitude', 'longitude', 'date', 'user_id'
];
