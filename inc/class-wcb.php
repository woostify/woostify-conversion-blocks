<?php
/**
 * Main Woostify Conversion Blocks Class
 *
 * @package  Woostify Conversion Blocks
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WCB' ) ) {
	/**
	 * Woostify Conversion Blocks class
	 */
	class WCB {
		/**
		 * Instance
		 *
		 * @var instance
		 */
		private static $instance;
		/**
		 * Default block dependencies
		 *
		 * @var array
		 */
		private $dependencies = array(
			'wp-editor',
			'wp-plugins',
			'wp-edit-post',
			'wp-element',
			'wp-components',
			'wp-data',
			'wp-dom-ready',
			'wp-hooks',
			'wp-blocks',
			'wp-i18n',
			'wp-api-fetch',
			'wp-api',
		);

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
		 * Woostify Block Constructor.
		 */
		public function __construct() {

			// Init.
			add_action( 'init', array( $this, 'setup' ) );

			// Returning false loads all core block assets, regardless of whether they are rendered in a page or not. Returning true loads core block assets only when they are rendered.
			add_filter( 'should_load_separate_core_block_assets', '__return_true' );

			// Register blocks.
			add_action( 'init', array( $this, 'register_blocks' ) );

			// Register block category.
			add_filter( 'block_categories_all', array( $this, 'register_block_category' ), 10, 2 );

			// Enqueue block editor assets.
			add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );

			// Enqueue block editor assets.
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_block_frontend_assets' ) );

			if ( ! is_admin() ) {
				add_filter( 'wcb_post_dynamic_css', array( $this, 'update_blocks_styles' ) );
			}
		}

		/**
		 * Update blocks css
		 *
		 * @param String $current_css Current css content in css file.
		 * @return String
		 */
		public function update_blocks_styles( $current_css ) {
			global $post;

			$style = '';

			$blocks = parse_blocks( $post->post_content );
			foreach ( $blocks as $block ) {
				$style .= $this->get_blocks_styles( $block['blockName'], $block['attrs'] );
			}
			return $style;
		}

		/**
		 * Plugin sets up.
		 */
		public function setup() {
			if ( ! defined( 'WCB_VERSION' ) ) {
				return;
			}

			wp_set_script_translations( 'wcb-blocks-scripts', 'wcb', WCB_PATH . 'languages/' );

			load_plugin_textdomain( 'wcb', false, WCB_PATH . 'languages/' );
		}

		/**
		 * Get style from blocks
		 *
		 * @param string $block_name Block name.
		 * @param array  $block_attrs Block attributes.
		 */
		public function get_blocks_styles( $block_name, $block_attrs ) {
			$blocks_style = '';

			if ( str_contains( $block_name, 'wcb' ) ) {
				$blocks_style .= $this->generate_block_style( $block_name, $block_attrs );
			}

			return $blocks_style;
		}

		/**
		 * Generate block style from attributes
		 *
		 * @param string $block_name Block name.
		 * @param array  $block_attrs Block attributes.
		 * @return string
		 */
		public function generate_block_style( $block_name = '', $block_attrs = array() ) {
			$tablet_breakpoint = get_option( 'wcb_settings_tablet_breakpoint', '1024' );
			$mobile_breakpoint = get_option( 'wcb_settings_mobile_breakpoint', '768' );

			$block_style  = '';
			$tablet_style = '';
			$mobile_style = '';

			$block_class = $block_attrs['uniqueId'];
			if ( 'wcb/first-block' === $block_name ) {
				$bg_color              = isset( $block_attrs['bg_color'] ) ? esc_html( $block_attrs['bg_color'] ) : '';
				$text_color            = isset( $block_attrs['text_color'] ) ? esc_html( $block_attrs['text_color'] ) : '';
				$font_size_unit        = isset( $block_attrs['fontSizeUnit'] ) ? esc_html( $block_attrs['fontSizeUnit'] ) : 'px';
				$font_size_unit_tablet = isset( $block_attrs['fontSizeUnitTablet'] ) ? esc_html( $block_attrs['fontSizeUnitTablet'] ) : 'px';
				$font_size_unit_mobile = isset( $block_attrs['fontSizeUnitMobile'] ) ? esc_html( $block_attrs['fontSizeUnitMobile'] ) : 'px';

				// Desktop style.
				$block_style     .= '#wcb-' . $block_class . ' h2 {';
					$block_style .= 'background-color: ' . $bg_color . ';';
					$block_style .= 'color: ' . $text_color . ';';
				if ( isset( $block_attrs['fontFamily'] ) ) {
					$block_style .= 'font-family: ' . $block_attrs['fontFamily'] . ', sans-serif;';
				}
				if ( isset( $block_attrs['fontWeight'] ) ) {
					$block_style .= 'font-weight: ' . $block_attrs['fontWeight'] . ';';
				}
				if ( isset( $block_attrs['fontSize'] ) ) {
					$block_style .= 'font-size: ' . $block_attrs['fontSize'] . $font_size_unit . ';';
				}
				$block_style .= '}';

				// Tablet style.
				$tablet_style     .= '@media (max-width:' . $tablet_breakpoint . 'px) {';
					$tablet_style .= '#wcb-' . $block_class . ' h2 {';
				if ( isset( $block_attrs['fontSizeTablet'] ) ) {
					$tablet_style .= 'font-size: ' . $block_attrs['fontSizeTablet'] . $font_size_unit_tablet . ';';
				}
					$tablet_style .= '}';
				$tablet_style     .= '}';

				// Mobile Style.
				$mobile_style     .= '@media (max-width:' . $mobile_breakpoint . 'px) {';
					$mobile_style .= '#wcb-' . $block_class . ' h2 {';
				if ( isset( $block_attrs['fontSizeMobile'] ) ) {
					$mobile_style .= 'font-size: ' . $block_attrs['fontSizeMobile'] . $font_size_unit_mobile . ';';
				}
					$mobile_style .= '}';
				$mobile_style     .= '}';
			}

			return $block_style . $tablet_style . $mobile_style;
		}

		/**
		 * Enqueue scripts for block editor
		 */
		public function enqueue_block_editor_assets() {
			global $pagenow;

			if ( 'widgets.php' === $pagenow ) {
				unset( $this->dependencies[0] );
			}

			// Blocks scripts.
			wp_register_script(
				'wcb-blocks-scripts',
				WCB_URI . 'dist/blocks.js',
				$this->dependencies,
				WCB_VERSION,
				true
			);

			$breakpoints = array(
				'tablet' => get_option( 'wcb_settings_tablet_breakpoint', '1024' ),
				'mobile' => get_option( 'wcb_settings_mobile_breakpoint', '768' ),
			);
			wp_localize_script(
				'wcb-blocks-scripts',
				'wcb_params',
				array(
					'global_colors'     => get_option( 'wcb_global_colors', '' ),
					'global_typography' => get_option( 'wcb_global_typography', '' ),
					'breakpoints'       => $breakpoints,
				),
			);

			wp_register_style(
				'wcb-editor-style',
				WCB_URI . 'dist/style-blocks.css',
				array( 'wp-edit-blocks' ),
				WCB_VERSION
			);
			// End blocks script.

			wp_register_style(
				'wcb-sidebar-style',
				WCB_URI . 'dist/sidebar.css',
				array(),
				WCB_VERSION
			);
			// End blocks script.

			// General editor style.
			wp_enqueue_style(
				'wcb-block-editor',
				WCB_URI . 'assets/css/block-editor.css',
				array(),
				WCB_VERSION,
				'all'
			);

			// Plugin sidebar script.
			wp_register_script(
				'wcb-sidebar',
				WCB_URI . 'dist/sidebar.js',
				$this->dependencies,
				WCB_VERSION,
				true,
			);

			if ( 'widgets.php' !== $pagenow ) {
				wp_enqueue_script( 'wcb-sidebar' );
				wp_enqueue_style( 'wcb-sidebar-style' );
			}

		}

		/**
		 * Enqueue scripts for font end
		 */
		public function enqueue_block_frontend_assets() {
			wp_register_style(
				'wcb-front-end',
				WCB_URI . 'dist/blocks.css',
				array(),
				WCB_VERSION
			);

			wp_enqueue_style( 'wcb-front-end' );
		}

		/**
		 * Register gutenberg blocks.
		 */
		public function register_blocks() {
			$blocks = array(
				array(
					'slug'  => 'first-block',
					'title' => __( 'First Block', 'wcb' ),
				),
				array(
					'slug'  => 'second-block',
					'title' => __( 'Second Block', 'wcb' ),
				),
			);

			foreach ( $blocks as $block ) {
				wcb_regitser_block_type( $block['slug'], array( 'title' => $block['title'] ) );
			}
		}

		/**
		 * Register new block category
		 *
		 * @param   array                   $block_categories       Array of categories for block types.
		 * @param   WP_Block_Editor_Context $block_editor_context   The current block editor context.
		 */
		public function register_block_category( $block_categories, $block_editor_context ) {
			$new_category = array(
				'slug'  => 'wcb',
				'title' => __( 'Woostify Block', 'wcb' ),
				'icon'  => 'wordpress', // Slug of a WordPress Dashicon or custom SVG.
			);

			return array_merge(
				$block_categories,
				array( $new_category ),
			);
		}

	}

	WCB::get_instance();
}
