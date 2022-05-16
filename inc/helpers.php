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
