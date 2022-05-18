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
			
			add_filter( 'init', array( $this, 'enqueue_google_font' ) );
		}

		/**
		 * Enqueue google font before block rendered
		 *
		 * @param array $block Block data.
		 */
		public function enqueue_google_font( $block ) {
			$typos = get_option( 'wcb_global_typography', '' );

			if ( '' === $typos ) {
				return;
			}

			$typos = $typos[0];

			foreach ( $typos as $attrs ) {
				if ( isset( $attrs['fontFamily'] ) && '' !== $attrs['fontFamily'] && wcb_is_web_font( $attrs['fontFamily'] ) ) {
					$style_id = 'wcb-google-font-' . strtolower( str_replace( ' ', '-', $attrs['fontFamily'] ) );
					wp_enqueue_style( $style_id, wcb_get_google_font_url( $attrs['fontFamily'] ), array(), WCB_VERSION );
				}
			}
		}

		/**
		 * Generate CSS from attribute array
		 *
		 * @param array $attrs current breakpoint selector attributes.
		 * @param array $ori_attrs current selector attributes.
		 * @return string
		 */
		public function generate_css( $attrs = array(), $ori_attrs = array() ) {
			$css_string = '';
			if ( empty( $attrs ) ) {
				return '';
			}

			foreach ( $attrs as $key => $attr ) {
				$attr_name = $key;
				$suffix    = '';
				if ( str_contains( $attr_name, 'Unit' ) ) {
					continue;
				}
				if ( str_contains( $attr_name, 'fontFamily' ) ) {
					$suffix = ', Sans-serif';
				}
				if ( str_contains( $attr_name, 'letterSpacing' ) ) {
					$suffix = 'px';
				}
				if ( str_contains( $attr_name, 'fontSize' ) || str_contains( $attr_name, 'lineHeight' ) ) {
					$suffix         = 'px';
					$real_attr_name = str_replace( array( 'Mobile', 'Tablet' ), '', $attr_name );
					if ( str_contains( $attr_name, 'Tablet' ) && isset( $ori_attrs[ $real_attr_name . 'UnitTablet' ] ) ) {
						$suffix = $ori_attrs[ $real_attr_name . 'UnitTablet' ];
					}
					if ( str_contains( $attr_name, 'Mobile' ) && isset( $ori_attrs[ $real_attr_name . 'UnitMobile' ] ) ) {
						$suffix = $ori_attrs[ $real_attr_name . 'UnitMobile' ];
					}
					if ( ! str_contains( $attr_name, 'Tablet' ) && ! str_contains( $attr_name, 'Mobile' ) && isset( $ori_attrs[ $real_attr_name . 'Unit' ] ) ) {
						$suffix = $ori_attrs[ $real_attr_name . 'Unit' ];
					}
				}
				$real_attr_name = str_replace( array( 'Mobile', 'Tablet' ), '', $attr_name );
				$new_attr_name  = strtolower( preg_replace( '/(?<!^)[A-Z]/', '-$0', $real_attr_name ) );
				$css_string    .= $new_attr_name . ': ' . $ori_attrs[ $attr_name ] . $suffix . ';';
			}

			return $css_string;
		}

		/**
		 * Add our global typography styles in the frontend.
		 *
		 * @return string
		 */
		public function typography_add_global_styles() {
			$css         = array();
			$current_css = '';

			$typos = get_option( 'wcb_global_typography', '' );
			if ( ! $typos || ! is_array( $typos ) ) {
				return '';
			}

			$typos = $typos[0];

			$typo_css        = array();
			$typo_css_tablet = array();
			$typo_css_mobile = array();
			$typo_css_prefix = '.wcb-block-wrapper ';
			foreach ( $typos as $selector => $typo ) {
				$attrs             = $typo;
				$typo_css_selector = $typo_css_prefix . $selector . ' {';
				$typo_attrs        = array();
				$typo_attrs_tablet = array();
				$typo_attrs_mobile = array();
				foreach ( $attrs as $attr_name => $attr_value ) {
					if ( ! str_contains( $attr_name, 'Tablet' ) && ! str_contains( $attr_name, 'Mobile' ) ) {
						$typo_attrs[ $attr_name ] = $attr_value;
					}
					if ( str_contains( $attr_name, 'Tablet' ) ) {
						$typo_attrs_tablet[ $attr_name ] = $attr_value;
					}
					if ( str_contains( $attr_name, 'Mobile' ) ) {
						$typo_attrs_mobile[ $attr_name ] = $attr_value;
					}
				}

				array_push( $typo_css, $typo_css_selector . $this->generate_css( $typo_attrs, $attrs ) . '}' );
				array_push( $typo_css_tablet, $typo_css_selector . $this->generate_css( $typo_attrs_tablet, $attrs ) . '}' );
				array_push( $typo_css_mobile, $typo_css_selector . $this->generate_css( $typo_attrs_mobile, $attrs ) . '}' );
			}

			$tablet_breakpoint = get_option( 'wcb_settings_tablet_breakpoint', '1024' );
			$mobile_breakpoint = get_option( 'wcb_settings_mobile_breakpoint', '768' );

			$current_css .= "\n/* Global Typography */\n";
			if ( count( $typo_css ) ) {
				$current_css .= implode( ' ', $typo_css );
			}
			if ( count( $typo_css_tablet ) ) {
				$current_css .= ' @media(max-width:' . $tablet_breakpoint . 'px) {';
				$current_css .= implode( ' ', $typo_css_tablet );
				$current_css .= '}';
			}
			if ( count( $typo_css_mobile ) ) {
				$current_css .= ' @media(max-width:' . $mobile_breakpoint . 'px) {';
				$current_css .= implode( ' ', $typo_css_mobile );
				$current_css .= '}';
			}

			return $current_css;
		}

		/**
		 * Add our global color styles in the frontend.
		 *
		 * @return String
		 */
		public function color_add_global_styles() {
			$current_css = '';
			// Don't do anything if we doon't have any global color.
			$colors = get_option( 'wcb_global_colors' );
			if ( ! $colors || ! is_array( $colors ) ) {
				return '';
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
