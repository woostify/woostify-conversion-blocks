<?php
/**
 * Main Woostify Conversion Block Class
 *
 * @package  Woostify Conversion Block
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Woostify_Conversion_Block' ) ) {
	/**
	 * Woostify Conversion Block class
	 */
	class Woostify_Conversion_Block {
		/**
		 * Instance
		 *
		 * @var instance
		 */
		private static $instance;

		public $block_styles;
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
			$this->block_styles = '';

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
				add_filter('render_block_data', array($this, 'content_pre_render'));
				add_filter( 'wcb_post_dynamic_css', array($this, 'get_block_styles') );
			}
		}

		public function get_block_styles($current_css) {
			return $current_css . $this->block_styles;
		}

		/**
		 * Plugin sets up.
		 */
		public function setup() {
			if ( ! defined( 'WOOSTIFY_BLOCK_VERSION' ) ) {
				return;
			}

			load_plugin_textdomain( 'woostify-block', false, WOOSTIFY_BLOCK_PATH . 'languages/' );
		}

		public function content_pre_render($block) {
			$style = $this->add_blocks_styles($block);
			$this->block_styles = $style;

			return $block;
		}

		public function add_blocks_styles($block) {
			$style_html = '';
            $block_name = $block['blockName'];
            $block_attrs = $block['attrs'];

			if ($block_name) {
                // Get styles for parent blocks
                $style_html .= $this->get_blocks_style ($block_name, $block_attrs);
            }

			return $style_html;
		}

		public function get_blocks_style($block_name, $block_attrs) {
			$available_blocks = array(
                'woostify-block/first-block',
            );

			$html_style = '';

            switch($block_name) {
				case 'woostify-block/first-block':
					$block_class = $block_attrs['uniqueId'];
					$bg_color      = isset($block_attrs['bg_color']) ? esc_html($block_attrs['bg_color']) : '';
					$html_style .= '#woostify-block-' . $block_class . ' h2 {';
						$html_style .= 'background-color: ' . $bg_color . ';';
					$html_style .= '}';
                    break;
				default:
					break;
			}

			return $html_style;
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
				'woostify_block-blocks-scripts',
				WOOSTIFY_BLOCK_URI . 'dist/blocks.js',
				$this->dependencies,
				WOOSTIFY_BLOCK_VERSION,
				true
			);

			wp_localize_script(
				'woostify_block-blocks-scripts',
				'wcb_params',
				array(
					'global_colors'     => get_option( 'wcb_global_colors', '' ),
					'global_typography' => get_option( 'wcb_global_typography', '' ),
				),
			);

			wp_register_style(
				'woostify_block-editor-style',
				WOOSTIFY_BLOCK_URI . 'dist/style-blocks.css',
				array( 'wp-edit-blocks' ),
				WOOSTIFY_BLOCK_VERSION
			);
			// End blocks script.
			
			wp_register_style(
				'woostify_block-sidebar-style',
				WOOSTIFY_BLOCK_URI . 'dist/sidebar.css',
				array(),
				WOOSTIFY_BLOCK_VERSION
			);
			// End blocks script.

			// General editor style.
			wp_enqueue_style(
				'woostify-block-editor',
				WOOSTIFY_BLOCK_URI . 'assets/css/block-editor.css',
				array(),
				WOOSTIFY_BLOCK_VERSION,
				'all'
			);

			wp_localize_script(
				'woostify-block-editor',
				'woostify_block',
				array(),
				WOOSTIFY_BLOCK_VERSION
			);

			// Plugin sidebar script.
			wp_register_script(
				'woostify_block-sidebar',
				WOOSTIFY_BLOCK_URI . 'dist/sidebar.js',
				$this->dependencies,
				WOOSTIFY_BLOCK_VERSION,
				true,
			);

			if ( 'widgets.php' !== $pagenow ) {
				wp_enqueue_script( 'woostify_block-sidebar' );
				wp_enqueue_style( 'woostify_block-sidebar-style' );
			}

		}

		public function enqueue_block_frontend_assets() {
			wp_register_style(
				'woostify_block-front-end',
				WOOSTIFY_BLOCK_URI . 'dist/blocks.css',
				array(),
				WOOSTIFY_BLOCK_VERSION
			);

			wp_enqueue_style('woostify_block-front-end');
		}

		/**
		 * Register gutenberg blocks.
		 */
		public function register_blocks() {
			$blocks = array(
				array(
					'slug'  => 'first-block',
					'title' => __( 'First Block', 'woostify-block' ),
				),
				array(
					'slug'  => 'second-block',
					'title' => __( 'Second Block', 'woostify-block' ),
				),
			);

			foreach ( $blocks as $block ) {
				woostify_block_regitser_block_type( $block['slug'], array( 'title' => $block['title'] ) );
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
				'slug'  => 'woostify-block',
				'title' => __( 'Woostify Block', 'woostify-block' ),
				'icon'  => 'wordpress', // Slug of a WordPress Dashicon or custom SVG.
			);

			return array_merge(
				$block_categories,
				array( $new_category ),
			);
		}

	}

	Woostify_Conversion_Block::get_instance();
}