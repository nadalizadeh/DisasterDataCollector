<?php


require_once 'cis_inc.php';

function _crisis_cmd_form_data_which_to_upload( $data, $user ) {
	$vid = [];
	foreach ( $data as $item ) {
		if ( ! isset( $item['hash'] ) || ! isset( $item['vid'] ) ) {
			_crisis_err( 'bad data' );
		}
		// TODO sanitize intval(item['vid']) so we'll have no php err
		$vid[ intval( $item['vid'] ) ] = $item['hash'];
	}
	$needed = _crisis_man_needs_upload( $user, $vid );
	_crisis_ok( $needed );
}

function _crisis_cmd_form_data( $data, $user ) {
	$vids = [];
	foreach ( $data as $item ) {
		if ( ! isset( $item['details'] ) ||
		     ! isset( $item['hash'] ) ||
		     ! isset( $item['visitId'] ) ) {
			_crisis_err( 'some required information is missing' );
		}

		$vid     = $item['visitId'];
		$hash    = $item['hash'];
		$details = $item['details'];

		$vids[] = $vid;
		_crisis_man_unfresh_vids( $user, $vid );
		_crisis_man_new_upload( $user, $vid, $hash, $details );
	}

	_crisis_ok( 'ok' . json_encode( $vids ) );
}

function _crisis_cmd( $cmd, $data, $user ) {
	switch ( $cmd ) {
		case "form_data_which_to_upload":
			_crisis_cmd_form_data_which_to_upload( $data, $user );
			break;

		case "form_data":
			_crisis_cmd_form_data( $data, $user );
			break;

		default:
			_crisis_err( 'bad cmd' );
	}
}

function _crisis() {
	_crisis_man_standalone_api_set_headers();

	$d = NULL;
	try {
		$d = json_decode( _crisis_man_get_post(), TRUE );
	} catch ( Exception $e ) {
		_crisis_err( 'bad request: can not decode' );
	}
	if ( ! is_array( $d ) ) {
		_crisis_err( 'bad request: not an array: ' . json_encode( $d ) );
	}
	if ( ! isset( $d['arg'] ) || ! is_array( $d['arg'] ) ) {
		_crisis_err( 'bad request: data is not set' . json_encode( $d ) );
	}

	if ( empty( $d['username'] ) || empty( $d['password'] ) ) {
		_crisis_err( 'bad request: user/pass is not set' );
	}

	$user = _crisis_man_auth( $d['username'], $d['password'] );
	if ( ! $user->ok ) {
		_crisis_err( 'auth err: ' . $user->err );
	}

	_crisis_cmd( $d['cmd'], $d['arg'], $user->login );
}

_crisis();
