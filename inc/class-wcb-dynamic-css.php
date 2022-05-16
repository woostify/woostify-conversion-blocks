<?php
/**
 * Main Dynamic Css Class
 *
 * @package Woostify Conversion Blocks
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Woostify_Dynamic_Css' ) ) :
	/**
	 * Woostify Conversion Dynamic CSS Class
	 */
	class WCB_Dynamic_Css {
		/**
		 * Instance
		 *
		 * @var instance
		 */
		private static $instance;

		/**
		 * Stylesheet ID
		 *
		 * @var string
		 */
		public $stylesheet_id;

		/**
		 * Global Stylesheet ID
		 *
		 * @var string
		 */
		public $global_stylesheet_id;

		/**
		 * Base path.
		 *
		 * @access protected
		 * @since 2.0.0
		 * @var string
		 */
		protected $base_path;

		/**
		 * Base URL.
		 *
		 * @access protected
		 * @since 2.0.0
		 * @var string
		 */
		protected $base_url;

		/**
		 * Subfolder name.
		 *
		 * @access protected
		 * @since 2.0.0
		 * @var string
		 */
		protected $subfolder_name;

		/**
		 * The fonts folder.
		 *
		 * @access protected
		 * @since 2.0.0
		 * @var string
		 */
		protected $style_folder;

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
		 * Construct
		 */
		public function __construct() {
			// Replace with the ID of your own stylesheet.
			// Usually defined in your theme.
			$this->stylesheet_id        = 'wcb-front-end';
			$this->global_stylesheet_id = 'wcb-front-end';

			$this->add_options();

			add_action( 'save_post', array( $this, 'reset_post_transient' ) );
			add_action( 'save_post', array( $this, 'post_update_option' ) );
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_dynamic_css' ) );

		}

		/**
		 * Get the base path.
		 *
		 * @return string
		 */
		public function get_base_path() {
			if ( ! $this->base_path ) {
				$upload_dir      = wp_upload_dir();
				$this->base_path = apply_filters( 'wcb_dynamic_style_base_path', $upload_dir['basedir'] );
			}
			return $this->base_path;
		}

		/**
		 * Get the subfolder name.
		 *
		 * @return string
		 */
		public function get_subfolder_name() {
			if ( ! $this->subfolder_name ) {
				$this->subfolder_name = apply_filters( 'wcb_dynamic_style_subfolder_name', 'wcb-styles' );
			}
			return $this->subfolder_name;
		}

		/**
		 * Get the folder for dynamic style.
		 *
		 * @return string
		 */
		public function get_style_folder() {
			if ( ! $this->style_folder ) {
				$this->style_folder = $this->get_base_path();
				if ( $this->get_subfolder_name() ) {
					$this->style_folder .= '/' . $this->get_subfolder_name();
				}
			}
			return $this->style_folder;
		}

		/**
		 * Get the dynamic style file name.
		 *
		 * @return string
		 */
		public function get_file_name() {
			global $blog_id;

			// If this is a multisite installation, append the blogid to the filename.
			$new_blog_id = ( is_multisite() && 1 < $blog_id ) ? '_blog-' . $blog_id : null;
			$page_id     = $this->page_id();

			$file_name = '/post' . $new_blog_id . '-' . $page_id . '.css';

			return $file_name;
		}

		/**
		 * Get the current page ID.
		 */
		public function page_id() {

			global $post;

			$id = $post->ID;
			$id = ( ! is_singular() ) ? false : $id;
			$id = ( function_exists( 'is_shop' ) && is_shop() ) ? get_option( 'woocommerce_shop_page_id' ) : $id;
			$id = ( is_home() ) ? get_option( 'page_for_posts' ) : $id;

			return $id;

		}

		/**
		 * Determine if we're using file mode or inline mode.
		 */
		public function mode() {

			// Check if we're using file mode or inline mode.
			// Default to file mode and fallback to inline if file mode is not possible.
			$mode = get_option( 'wcb_settings_css_print_mode', 'file' );

			// Additional checks for file mode.
			if ( 'file' === $mode && $this->needs_update() ) {
				// Only allow processing 1 file every 5 seconds.
				$current_time = (int) time();
				$last_time    = (int) get_option( 'dynamic_css_time' );
				if ( 5 <= ( $current_time - $last_time ) ) {
					// Attempt to write to the file.
					$mode = ( $this->can_write() && $this->make_css() ) ? 'file' : 'inline';
					// Does again if the file exists.
					if ( 'file' === $mode ) {
						$mode = ( file_exists( $this->file( 'path' ) ) ) ? 'file' : 'inline';
					}
				}
			}

			return $mode;

		}

		/**
		 * Get global styles
		 *
		 * @return string
		 */
		public function get_global_style() {
			$wcb_global_settings = new WCB_Global_Settings();
			$global_colors_style = $wcb_global_settings->color_add_global_styles();
			$global_typo_style   = $wcb_global_settings->typography_add_global_styles();

			return $global_colors_style . $global_typo_style;
		}

		/**
		 * Enqueue the dynamic CSS.
		 */
		public function enqueue_dynamic_css() {

			if ( 'file' === $this->mode() ) {
				// Yay! we're using a file for our CSS, so enqueue it.
				if ( $this->make_global_css() ) {
					wp_enqueue_style( 'wcb-global-style', $this->file( 'uri', true ), array(), WCB_VERSION );
				}
				wp_enqueue_style( 'wcb-dynamic-post', $this->file( 'uri' ), array(), WCB_VERSION ); // phpcs:ignore.
				// Bah, no file mode... add inline to the head.
			} elseif ( 'inline' === $this->mode() ) {
				$global_style = $this->get_global_style();
				wp_add_inline_style( $this->stylesheet_id, apply_filters( 'wcb_post_dynamic_css', '' ) );
				wp_add_inline_style( $this->stylesheet_id, $global_style );
			}

		}

		/**
		 * Get the filesystem.
		 *
		 * @access protected
		 * @since 1.0.0
		 * @return \WP_Filesystem_Base
		 */
		protected function get_filesystem() {
			global $wp_filesystem;

			// If the filesystem has not been instantiated yet, do it here.
			if ( ! $wp_filesystem ) {
				if ( ! function_exists( 'WP_Filesystem' ) ) {
					require_once wp_normalize_path( ABSPATH . '/wp-admin/includes/file.php' );
				}
				WP_Filesystem();
			}
			return $wp_filesystem;
		}

		/**
		 * Make css file content with compiled
		 */
		public function make_css() {

			$content = "/********* Compiled - Do not edit *********/\n" . apply_filters( 'wcb_post_dynamic_css', '' );

			// Take care of domain mapping.
			if ( defined( 'DOMAIN_MAPPING' ) && DOMAIN_MAPPING ) {

				if ( function_exists( 'domain_mapping_siteurl' ) && function_exists( 'get_original_url' ) ) {

					$mapped_domain = domain_mapping_siteurl( false );
					$mapped_domain = str_replace( 'https://', '//', $domain_mapping );
					$mapped_domain = str_replace( 'http://', '//', $mapped_domain );

					$original_domain = get_original_url( 'siteurl' );
					$original_domain = str_replace( 'https://', '//', $original_domain );
					$original_domain = str_replace( 'http://', '//', $original_domain );

					$content = str_replace( $original_domain, $mapped_domain, $content );

				}
			}

			// Strip protocols.
			$content = str_replace( 'https://', '//', $content );
			$content = str_replace( 'http://', '//', $content );

			if ( is_writable( $this->file( 'path' ) ) || ( ! file_exists( $this->file( 'path' ) ) && is_writable( dirname( $this->file( 'path' ) ) ) ) ) {

				if ( ! $this->get_filesystem()->put_contents( $this->file( 'path' ), $content, FS_CHMOD_FILE ) ) {

					// Fail!
					return false;

				} else {

					// Update the opion in the db so that we know the css for this post has been successfully generated.
					$page_id            = $this->page_id();
					$option             = get_option( 'wcb_dynamic_css_posts', array() );
					$option[ $page_id ] = true;
					update_option( '_wcb_dynamic_css_posts', $option );
					// Update the 'wcb_dynamic_css_time' option.
					$this->update_saved_time();

					// Success!
					return true;

				}
			}

		}

		/**
		 * Make global css file content with compiled
		 */
		public function make_global_css() {
			$global_style = $this->get_global_style();

			$content = "/********* Global CSS - Do not edit *********/\n" . $global_style;

			// Take care of domain mapping.
			if ( defined( 'DOMAIN_MAPPING' ) && DOMAIN_MAPPING ) {

				if ( function_exists( 'domain_mapping_siteurl' ) && function_exists( 'get_original_url' ) ) {

					$mapped_domain = domain_mapping_siteurl( false );
					$mapped_domain = str_replace( 'https://', '//', $domain_mapping );
					$mapped_domain = str_replace( 'http://', '//', $mapped_domain );

					$original_domain = get_original_url( 'siteurl' );
					$original_domain = str_replace( 'https://', '//', $original_domain );
					$original_domain = str_replace( 'http://', '//', $original_domain );

					$content = str_replace( $original_domain, $mapped_domain, $content );

				}
			}

			// Strip protocols.
			$content = str_replace( 'https://', '//', $content );
			$content = str_replace( 'http://', '//', $content );

			if ( file_exists( $this->file( 'path', true ) ) ) {
				return true;
			} else {
				if ( is_writable( $this->file( 'path', true ) ) || is_writable( dirname( $this->file( 'path', true ) ) ) ) {

					if ( ! $this->get_filesystem()->put_contents( $this->file( 'path', true ), $content, FS_CHMOD_FILE ) ) {

						// Fail!
						return false;
					}

					return true;
				}
			}
		}

		/**
		 * Determines if the CSS file is writable.
		 *
		 * @param boolean $is_global Is global css file.
		 * @return boolean
		 */
		public function can_write( $is_global = false ) {

			if ( ! $this->page_id() && ! $is_global ) {
				return;
			}

			$file_name = $this->get_file_name();
			if ( $is_global ) {
				$file_name = 'global.css';
			}
			$folder_path = $this->get_style_folder();

			// Does the folder exist?
			if ( file_exists( $folder_path ) ) {
				// Folder exists, but is the folder writable?
				if ( ! is_writable( $folder_path ) ) {
					// Folder is not writable.
					// Does the file exist?
					if ( ! file_exists( $folder_path . $file_name ) ) {
						// File does not exist, therefore it can't be created
						// since the parent folder is not writable.
						return false;
					} else {
						// File exists, but is it writable?
						if ( ! is_writable( $folder_path . $file_name ) ) {
							// Nope, it's not writable.
							return false;
						}
					}
				} else {
					// The folder is writable.
					// Does the file exist?
					if ( file_exists( $folder_path . $file_name ) ) {
						// File exists.
						// Is it writable?
						if ( ! is_writable( $folder_path . $file_name ) ) {
							// Nope, it's not writable.
							return false;
						}
					}
				}
			} else {
				// Can we create the folder?
				// returns true if yes and false if not.
				return wp_mkdir_p( $folder_path );
			}

			// all is well!
			return true;

		}

		/**
		 * Gets the css path or url to the stylesheet.
		 *
		 * @param string  $target path/url.
		 * @param boolean $is_global is global css file.
		 * @return void
		 */
		public function file( $target = 'path', $is_global = false ) {

			if ( ! $this->page_id() && ! $is_global ) {
				return;
			}

			$file_name = $this->get_file_name();
			if ( $is_global ) {
				$file_name = 'global.css';
			}
			$folder_path = $this->get_style_folder();

			// The complete path to the file.
			$file_path = $folder_path . '/' . $file_name;
			// Get the URL directory of the stylesheet.
			$upload_dir     = wp_upload_dir();
			$css_uri_folder = $upload_dir['baseurl'];

			$css_uri        = trailingslashit( $css_uri_folder ) . $this->subfolder_name . $file_name;
			$global_css_uri = trailingslashit( $css_uri_folder ) . $this->subfolder_name . '/global.css';

			// Take care of domain mapping.
			if ( defined( 'DOMAIN_MAPPING' ) && DOMAIN_MAPPING ) {
				if ( function_exists( 'domain_mapping_siteurl' ) && function_exists( 'get_original_url' ) ) {
					$mapped_domain   = domain_mapping_siteurl( false );
					$original_domain = get_original_url( 'siteurl' );
					$css_uri         = str_replace( $original_domain, $mapped_domain, $css_uri );
					$global_css_uri  = str_replace( $original_domain, $mapped_domain, $global_css_uri );
				}
			}
			// Strip protocols.
			$css_uri = str_replace( 'https://', '//', $css_uri );
			$css_uri = str_replace( 'http://', '//', $css_uri );

			$global_css_uri = str_replace( 'https://', '//', $global_css_uri );
			$global_css_uri = str_replace( 'http://', '//', $global_css_uri );

			if ( 'path' === $target ) {
				return $file_path;
			} elseif ( 'url' === $target || 'uri' === $target ) {
				$timestamp = ( file_exists( $file_path ) ) ? '?timestamp=' . filemtime( $file_path ) : '';
				if ( $is_global ) {
					return $global_css_uri . $timestamp;
				} else {
					return $css_uri . $timestamp;
				}
			}

		}
		/**
		 * Reset ALL CSS transient caches.
		 */
		public function reset_all_transients() {

			global $wpdb;
			// Build the query to delete all dynamic-css transients and execute the required SQL.
			$sql   = "DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_dynamic_css_%'";
			$clean = $wpdb->query( $sql ); // phpcs:ignore.

		}

		/**
		 * Reset the dynamic CSS transient for a post.
		 *
		 * @param int $post_id Post ID.
		 */
		public function reset_post_transient( $post_id ) {
			delete_transient( 'wcb_dynamic_css_' . $post_id );
		}

		/**
		 * Create settings.
		 */
		public function add_options() {
			/**
			 * The 'wcb_dynamic_css_posts' option will hold an array of posts that have had their css generated.
			 * We can use that to keep track of which pages need their CSS to be recreated and which don't.
			 */
			add_option( 'wcb_dynamic_css_time', array(), '', 'yes' );
			/**
			 * The 'wcb_dynamic_css_time' option holds the time the file writer was last used.
			 */
			add_option( 'wcb_dynamic_css_time', time(), '', 'yes' );
		}

		/**
		 * Update the dynamic_css_posts option when a post is saved.
		 *
		 * @param int $post_id Post ID.
		 */
		public function post_update_option( $post_id ) {
			$option             = get_option( 'wcb_dynamic_css_posts', array() );
			$option[ $post_id ] = false;
			update_option( 'wcb_dynamic_css_posts', $option );
		}

		/**
		 * Update the dynamic_css_posts option when the theme options are saved.
		 */
		public function global_reset_option() {
			update_option( 'wcb_dynamic_css_posts', array() );
		}

		/**
		 * Do we need to update the CSS file?
		 */
		public function needs_update() {
			$option  = get_option( 'wcb_dynamic_css_posts', array() );
			$page_id = ( $this->page_id() ) ? $this->page_id() : 'global';

			// If the CSS file does not exist then we definitely need to regenerate the CSS.
			if ( ! file_exists( $this->file( 'path' ) ) ) {
				return true;
			}

			return ( ! isset( $option[ $page_id ] ) || ! $option[ $page_id ] ) ? true : false;

		}

		/**
		 * Update the 'dynamic_css_time' option.
		 */
		public function update_saved_time() {
			update_option( 'dynamic_css_time', time() );
		}

		/**
		 * Delete the style folder.
		 *
		 * @access public
		 *
		 * @return bool
		 */
		public function delete_dynamic_stylesheet_folder() {
			$this->reset_all_transients();
			return $this->get_filesystem()->delete( $this->get_style_folder(), true );
		}

	}

	WCB_Dynamic_Css::get_instance();
endif;
