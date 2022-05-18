<?php
/**
 * Woostify block helper functions.
 *
 * @package Woostify Conversion Blocks
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wcb_version' ) ) {
	/**
	 * Woostify Conversion Blocks Version
	 *
	 * @return string Woostify Conversion Blocks Version.
	 */
	function wcb_version() {
		return esc_attr( WCB_VERSION );
	}
}

if ( ! function_exists( 'wcb_regitser_block_type' ) ) {
	/**
	 * Register block
	 *
	 * @param string $block Block slug.
	 * @param array  $options Block options.
	 */
	function wcb_regitser_block_type( $block, $options = array() ) {
		register_block_type(
			'wcb/' . $block,
			array_merge(
				array(
					'editor_script' => 'wcb-blocks-scripts',
					'editor_style'  => 'wcb-editor-style',
					'style'         => 'wcb-front-end',
				),
				$options
			)
		);
	}
}

if ( ! function_exists( 'wcb_suffix' ) ) {
	/**
	 * Define Script debug.
	 *
	 * @return     string $suffix
	 */
	function wcb_suffix() {
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		return $suffix;
	}
}

if ( ! function_exists( 'wcb_is_block_editor_admin' ) ) {
	/**
	 * Check if page using block editor in admin only
	 *
	 * @return Boolean
	 */
	function wcb_is_block_editor_admin() {
		global $current_screen;
		$current_screen = get_current_screen(); // phpcs:ignore.
		if ( method_exists( $current_screen, 'is_block_editor' ) && $current_screen->is_block_editor() ) {
			return true;
		} else {
			return false;
		}
	}
}

if ( ! function_exists( 'wcb_is_web_font' ) ) {
	/**
	 * Check is google web font
	 *
	 * @param string $font_name font name.
	 * @return boolean
	 */
	function wcb_is_web_font( $font_name = '' ) {
		$system_fonts = array( 'Arial', 'Helvetica', 'Times New Roman', 'Georgia' );
		if ( in_array( $font_name, $system_fonts, TRUE ) || preg_match( '/^(sans[-+]serif|serif|monospace|serif-alt)$/i', $font_name ) ) {
			return false;
		} else {
			return true;
		}
	}
}

if ( ! function_exists( 'wcb_get_google_font_url' ) ) {
	/**
	 * Get google font url.
	 *
	 * @param string $font_name Font name.
	 * @return string
	 */
	function wcb_get_google_font_url( $font_name = '' ) {
		$family = str_replace( '/ /g', '+', $font_name );
		$subset = '';
		// 'https://fonts.googleapis.com/css2?family=' . $family . ':ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';.
		return 'https://fonts.googleapis.com/css?family=' . $family . ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic' . $subset;
	}
}
