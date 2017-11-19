<?php

if ( defined( 'CIS_INC' ) ) {
	die;
} else {
	define( 'CIS_INC', 1 );
}

// -----------------------

define( 'WP_USE_THEMES', FALSE );
define( 'COOKIE_DOMAIN', FALSE );
define( 'DISABLE_WP_CRON', TRUE );
require_once( "wp-load.php" );

// -----------------------

define( 'CIS_TABLE_RAW', 'crisis_raw_submission' );
define( 'CIS_DEBUG', FALSE );
define( 'CIS_MAKE_USER_UPLOAD_ALL_ITS_FORMS_ALWAYS', TRUE );

function _crisis_err( $msg ) {
	print json_encode( [ 'error' => $msg ] );
	die;
}

function _crisis_ok( $data ) {
	print json_encode( [ 'ok' => $data ] );
}

function _crisis_man_standalone_api_set_headers() {
	header( "Access-Control-Allow-Origin: *" );
	header( "Cache-Control: no-store, no-cache, must-revalidate, max-age=0" );
	header( "Cache-Control: post-check=0, pre-check=0", FALSE );
	header( "Pragma: no-cache" );
}

function _crisis_man_get_post() {
	$data = file_get_contents( 'php://input' );
	if ( CIS_DEBUG ) {
		file_put_contents( '/dev/shm/cis_debug', $data );
	}

	return $data;
}

// ---------------------------------------

function _crisis_man_auth( $user, $pwd ) {
	$user          = wp_authenticate( $user, $pwd );
	$result        = new stdClass;
	$result->ok    = ! is_wp_error( $user );
	$result->err   = $result->ok ? '' : $user->get_error_code();
	$result->login = $result->ok ? $user->user_login : '';

	return $result;
}

// ---------------------------------------

function _crisis_db_safe_int( array $value ) {
	$safe = [];
	foreach ( $value as $v ) {
		$safe[] = intval( $v );
	}

	return $safe;
}

function _crisis_db_safe_implode_int( array $value ) {
	return implode( ',', _crisis_db_safe_int( $value ) );
}

/**
 * Which visit ids are new or which hashes have changed and need update.
 */
function _crisis_man_needs_upload( $user, $hash_by_vid ) {

	// uncomment the following to make user upload all it's forms even if they
	// are not changed.

	//	return array_keys($hash_by_vid);

	if ( CIS_MAKE_USER_UPLOAD_ALL_ITS_FORMS_ALWAYS ) {
		return array_keys( $hash_by_vid );
	}

	global $wpdb;

	$safe    = _crisis_db_safe_implode_int( array_keys( $hash_by_vid ) );
	$q       = ' SELECT vid, hash FROM crisis_raw_submission WHERE ' .
	           ' fresh = 1 AND username = %s AND vid IN ( ' . $safe . ' )';
	$q       = $wpdb->prepare( $q, $user );
	$hashes  = $wpdb->get_results( $q, ARRAY_A );
	$needed  = [];
	$old_vid = [];

	foreach ( $hashes as $hash ) {
		$v = intval( $hash['vid'] );
		$h = $hash['hash'];
		if ( $hash_by_vid[ $v ] !== $h ) {
			$needed[] = $v;
		}
		$old_vid[] = $v;
	}

	foreach ( array_keys( $hash_by_vid ) as $v ) {
		if ( ! in_array( $v, $old_vid ) ) {
			$needed[] = $v;
		}
	}

	return $needed;
}

function _crisis_man_new_upload( $user, $vid, $hash, $data ) {
	global $wpdb;

	return $wpdb->insert(
		'crisis_raw_submission', [
		'hash'           => $hash,
		'vid'            => $vid,
		'username'       => $user,
		'timestamp'      => time(),
		'raw_submission' => json_encode( $data ),
		'fresh'          => 1,
	] );

}

function _crisis_man_unfresh_vids( $username, $vid ) {

	global $wpdb;

	file_put_contents( '/a/aaa', var_export( [
		[ 'fresh' => 0 ],
		[
			'username' => $username,
			'vid'      => intval( $vid ),
		],
	], TRUE ) );

	return $wpdb->update(
		'crisis_raw_submission', [ 'fresh' => 0 ], [
			'username' => $username,
			'vid'      => intval( $vid ),
		]
	);

}
