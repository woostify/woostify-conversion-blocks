<?php
/**
 * Woostify Conversion Blocks Admin Class
 *
 * @package  Woostify Conversion Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WCB_Admin' ) ) :
	/**
	 * Woostify Conversion Blocks Admin class
	 */
	class WCB_Admin {
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
		 * Constructor
		 */
		public function __construct() {
			add_action( 'admin_menu', array( $this, 'register_menu' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

			add_action( 'wp_ajax_save_settings_options', array( $this, 'save_options' ) );

			add_action( 'wp_ajax_regenerate_css_files', array( $this, 'regenerate_css_files' ) );
		}

		/**
		 * Enqueue admin scripts
		 *
		 * @return void
		 */
		public function enqueue_scripts() {
			wp_enqueue_style(
				'wcb-general',
				WCB_URI . 'assets/css/admin/general.css',
				array(),
				wcb_version()
			);
			wp_enqueue_style(
				'wcb-dashboard',
				WCB_URI . 'assets/css/admin/dashboard.css',
				array(),
				wcb_version()
			);

			wp_enqueue_script(
				'wcb-edit-screen',
				WCB_URI . 'assets/js/edit-screen.js',
				array(),
				wcb_version(),
				true
			);

			$data = array(
				'save'          => __( 'Save', 'wcb' ),
				'saving'        => __( 'Saving', 'wcb' ),
				'saved'         => __( 'Saved', 'wcb' ),
				'saved_success' => __( 'Saved successfully', 'wcb' ),
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'settings_form_nonce' => wp_create_nonce( 'wcb_settings_form_nonce' ),
			);

			wp_localize_script(
				'wcb-edit-screen',
				'wcb_edit_screen',
				$data
			);
		}

		/**
		 * Save setting values.
		 */
		public function save_options() {
			if ( ! current_user_can( 'edit_theme_options' ) ) {
				wp_send_json_error();
			}

			$setting_id = isset( $_POST['setting_id'] ) ? sanitize_text_field( wp_unslash( $_POST['setting_id'] ) ) : '';
			$nonce      = 'wcb-' . $setting_id . '-nonce';
			check_ajax_referer( $nonce, 'security_nonce' );

			$options = isset( $_POST['options'] ) ? json_decode( sanitize_text_field( wp_unslash( $_POST['options'] ) ), true ) : array();

			if ( ! empty( $options ) ) {
				$array = array();

				foreach ( $options as $k => $v ) {
					$value = sanitize_textarea_field( wp_unslash( $v ) );

					if ( false !== strpos( $k, '[]' ) ) {
						array_push( $array, $value );

						// Get option name.
						$name = strstr( $k, '[', true ) . '[]';

						update_option( $name, implode( '@_sn', $array ) );
					} else {
						update_option( $k, $value );
					}
				}
			}

			wp_send_json_success();
		}

		/**
		 * Creates the dashboard page
		 *
		 * @see  add_theme_page()
		 */
		public function register_menu() {
			// Filter to remove Admin menu.
			$admin_menu = apply_filters( 'woostify_conversion_block_options_admin_menu', false );
			if ( true === $admin_menu ) {
				return;
			}

			add_menu_page( 'Woostify Conversion Blocks Dashboard', 'Woostify Conversion Blocks', 'manage_options', 'wcb', array( $this, 'dashboard_screen' ), '', 60 );
			// Menu Dashboard.
			add_submenu_page( 'wcb', 'Woostify Conversion Blocks Dashboard', 'Dashboard', 'manage_options', 'wcb' );
			// Menu Settings.
			add_submenu_page( 'wcb', 'Woostify Conversion Blocks Settings', 'Settings', 'manage_options', 'wcb-settings', array( $this, 'settings_screen' ) );
		}

		/**
		 * Layout for header of plugin setting page
		 */
		public function dashboard_header_section() {
			$plugin_url = 'https://woostify.com';
			?>
				<section class="woostify-welcome-nav">
					<div class="woostify-welcome-container">
						<a class="woostify-welcome-theme-brand" href="<?php echo esc_url( $plugin_url ); ?>" target="_blank" rel="noopener">
							<img class="woostify-welcome-theme-icon" src="<?php echo esc_url( WCB_URI . 'assets/images/logo.svg' ); ?>" alt="<?php esc_attr_e( 'Woostify Block Logo', 'wcb' ); ?>">
							<span class="woostify-welcome-theme-title"><?php esc_html_e( 'Woostify', 'wcb' ); ?></span>
						</a>

						<span class="woostify-welcome-theme-version"><?php echo esc_html( wcb_version() ); ?></span>
					</div>
				</section>
			<?php
		}

		/**
		 * Layout for dashboard screen of plugin setting page
		 */
		public function dashboard_screen() {
			?>
			<div class="woostify-options-wrap admin-welcome-screen">
				<?php $this->dashboard_header_section(); ?>
			</div>
			<?php
		}

		/**
		 * Layout for settings screen of plugin setting page
		 */
		public function settings_screen() {
			$print_mode = get_option( 'wcb_settings_css_print_mode', 'file' );
			$tablet_breakpoint = get_option( 'wcb_settings_tablet_breakpoint', '1024' );
			$mobile_breakpoint = get_option( 'wcb_settings_mobile_breakpoint', '768' );
			?>
			<div class="woostify-options-wrap woostify-featured-setting wcb-setting" data-id="settings" data-nonce="<?php echo esc_attr( wp_create_nonce( 'wcb-settings-nonce' ) ); ?>">
				<?php $this->dashboard_header_section(); ?>
				<div class="wrap woostify-settings-box">
					<div class="woostify-welcome-container">
						<div class="woostify-notices-wrap">
							<h2 class="notices" style="display:none;"></h2>
						</div>
						<div class="woostify-settings-content">
							<div class="woostify-settings-section-head">
								<h4 class="woostify-settings-section-title">
									<?php esc_html_e( 'Settings', 'wcb' ); ?>
								</h4>
							</div>
							<div class="woostify-settings-section-content">
								<table class="form-table woostify-setting-tab-content">
									<tbody>
										<tr>
											<th><?php esc_html_e( 'CSS Print Method', 'wcb' ); ?></th>
											<td>
												<select name="wcb_settings_css_print_mode" id="wcb_settings_css_print_mode">
													<option value="file" <?php selected( $print_mode, 'file' ); ?>><?php esc_html_e( 'External File', 'wcb' ); ?></option>
													<option value="inline" <?php selected( $print_mode, 'inline' ); ?>><?php esc_html_e( 'Inline Embedding', 'wcb' ); ?></option>
												</select>
												<p class="woostify-setting-description"><?php esc_html_e( 'Use external CSS files for all generated stylesheets. Choose this setting for better performance (recommended).', 'wcb' ); ?></p>
												<button type="button" class="js-button-regenerate-css-files button button-secondary button-large" style="margin-top:1em">
													<span class="dashicons dashicons-update-alt"></span><?php esc_html_e( 'Regenerate CSS Files', 'wcb' ); ?>
												</button>
												<p class="woostify-setting-description"><?php esc_html_e( 'Force your external CSS files to regenerate next time their page is loaded.', 'wcb' ); ?></p>
											</td>
										</tr>
										<tr>
											<th><?php esc_html_e( 'Responsive Breakpoints', 'wcb' ); ?></th>
											<td>
												<div class="input-group" style="margin-bottom:1em">
													<label for="wcb_settings_tablet_breakpoint"><?php esc_html_e( 'Tablet', 'wcb' ); ?></label>
													<input type="number" class="small-text no-arrows" name="wcb_settings_tablet_breakpoint" id="wcb_settings_tablet_breakpoint" value="<?php echo (int) $tablet_breakpoint; ?>" />
												</div>
												<div class="input-group">
													<label for="wcb_settings_mobile_breakpoint"><?php esc_html_e( 'Mobile', 'wcb' ); ?></label>
													<input type="number" class="small-text no-arrows" name="wcb_settings_mobile_breakpoint" id="wcb_settings_mobile_breakpoint" value="<?php echo (int) $mobile_breakpoint; ?>" />
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="woostify-settings-section-footer position-sticky">
								<span class="save-options button button-primary"><?php esc_html_e( 'Save', 'wcb' ); ?></span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<?php
		}

		public function regenerate_css_files() {
			/*Do another nonce check*/
			check_ajax_referer( 'wcb_settings_form_nonce', 'wcb_settings_form_nonce' );

			$wcb_dynamic_css = new WCB_Dynamic_Css();
			$wcb_dynamic_css->delete_dynamic_stylesheet_folder();

			wp_send_json_success();
		}

	}

	WCB_Admin::get_instance();

endif;
