<?php
/**
 * Main Woostify Conversion Blocks Global Settings Class
 *
 * @package  Woostify Conversion Blocks
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WCB_Global_Settings' ) ) {
	/**
	 * WCB Global Settings class
	 */
	class WCB_Global_Settings {
		/**
		 * Instance
		 *
		 * @var instance
		 */
		private static $instance;

		/**
		 *  Initiator
		 */
		public static function get_instance() {
			if ( ! isset( self::$instance ) ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/**
		 * Initialize
		 */
		public function __construct() {
			// Register settings.
			add_action( 'init', array( $this, 'register_settings' ) );

			if ( ! is_admin() ) {
				add_filter( 'wcb_post_dynamic_css', array( $this, 'color_add_global_styles' ) );
			}
		}

		/**
		 * Add our global color styles in the frontend.
		 *
		 * @param String $current_css Current css content in css file.
		 * @return String
		 */
		public function color_add_global_styles( $current_css ) {
			// Don't do anything if we doon't have any global color.
			$colors = get_option( 'wcb_global_colors' );
			if ( ! $colors || ! is_array( $colors ) ) {
				return $current_css;
			}

			$css      = array();
			$core_css = array();

			foreach ( $colors as $color_palette ) {
				if ( ! is_array( $color_palette ) ) {
					continue;
				}

				foreach ( $color_palette as $color ) {
					if ( ! is_array( $color ) ) {
						continue;
					}
					if ( ! array_key_exists( 'slug', $color ) || ! array_key_exists( 'color', $color ) || ! array_key_exists( 'rgb', $color ) ) {
						continue;
					}

					$color_name = strtolower( $color['slug'] );

					// Convert the name to kebab casing.
					$color_typography_name = 'body .has-' . implode( '-', explode( ' ', $color_name ) ) . '-color';
					$color_background_name = 'body .has-' . implode( '-', explode( ' ', $color_name ) ) . '-background-color';

					// Only do this for our global colors.
					if ( $color['color'] && $color['slug'] ) {
						// Add the custom css property.
						$css[] = '--' . $color['slug'] . ': ' . $color['color'] . ';';
						$css[] = '--' . $color['slug'] . '-rgba: ' . $color['rgb'] . ';';

						// Add custom css class rule for other blocks.
						// For typography colors.
						$core_css[] = $color_typography_name . ' { color: ' . $color['color'] . ' !important; }';

						// For background colors.
						$core_css[] = $color_background_name . ' { background-color: ' . $color['color'] . ' !important; }';
					}
				}
			}

			if ( count( $css ) ) {
				$generated_color_css  = "/* Global colors */\n";
				$generated_color_css .= ':root {' . implode( ' ', $css ) . '}';
				$current_css         .= $generated_color_css;
			}

			if ( count( $core_css ) ) {
				$current_css .= implode( ' ', $core_css );
			}

			return $current_css;
		}

		/**
		 * Register the settings we need for global settings.
		 *
		 * @return void
		 */
		public function register_settings() {
			register_setting(
				'wcb_global_settings',
				'wcb_global_colors',
				array(
					'type'              => 'array',
					'sanitize_callback' => array( $this, 'sanitize_array_setting' ),
					'show_in_rest'      => array(
						'schema' => array(
							'items' => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'name'  => array(
											'type' => 'string',
										),
										'slug'  => array(
											'type' => 'string',
										),
										'color' => array(
											'type' => 'string',
										),
										'rgb'   => array(
											'type' => 'string',
										),
									),
								),
							),
						),
					),
					'default'           => '',
				)
			);

			$typo_schema = array(
				'type'       => 'object',
				'properties' => array(
					'fontFamily'           => array(
						'type' => 'string',
					),
					'fontWeight'           => array(
						'type' => 'string',
					),
					'textTransform'        => array(
						'type' => 'string',
					),
					'fontStyle'            => array(
						'type' => 'string',
					),
					'lineHeight'           => array(
						'type' => 'number',
					),
					'lineHeightTablet'     => array(
						'type' => 'number',
					),
					'lineHeightMobile'     => array(
						'type' => 'number',
					),
					'lineHeightUnit'       => array(
						'type' => 'string',
					),
					'lineHeightUnitTablet' => array(
						'type' => 'string',
					),
					'lineHeightUnitMobile' => array(
						'type' => 'string',
					),
					'fontSize'             => array(
						'type' => 'number',
					),
					'fontSizeTablet'       => array(
						'type' => 'number',
					),
					'fontSizeMobile'       => array(
						'type' => 'number',
					),
					'fontSizeUnit'         => array(
						'type' => 'string',
					),
					'fontSizeUnitTablet'   => array(
						'type' => 'string',
					),
					'fontSizeUnitMobile'   => array(
						'type' => 'string',
					),
					'letterSpacing'        => array(
						'type' => 'number',
					),
					'letterSpacingTablet'  => array(
						'type' => 'number',
					),
					'letterSpacingMobile'  => array(
						'type' => 'number',
					),
				),
			);
			register_setting(
				'wcb_global_settings',
				'wcb_global_typography',
				array(
					'type'              => 'array',
					'sanitize_callback' => array( $this, 'sanitize_array_setting' ),
					'show_in_rest'      => array(
						'schema' => array(
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'h1' => $typo_schema,
									'h2' => $typo_schema,
									'h3' => $typo_schema,
									'h4' => $typo_schema,
									'h5' => $typo_schema,
									'h6' => $typo_schema,
								),
							),
						),
					),
					'default'           => '',
				)
			);
		}

		/**
		 * Sanitize array setting value
		 *
		 * @param String|Array $input Input value.
		 * @return Array
		 */
		public function sanitize_array_setting( $input ) {
			return ! is_array( $input ) ? array( array() ) : $input;
		}
	}

	WCB_Global_Settings::get_instance();
}
