<?php
/**
 * Plugin Name:       Woostify Conversion Blocks
 * Description:       Advanced blocks for Gutenberg editor.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0-dev
 * Author:            Woostify
 * License:           GNU General Public License v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wcb
 *
 * @package           Woostify Conversion Blocks
 */

defined( 'ABSPATH' ) || exit;

// Define Constants.
define( 'WCB_VERSION', '0.1.0-dev' );
define( 'WCB_FILE', __FILE__ );
define( 'WCB_PLUGIN_BASE', plugin_basename( WCB_FILE ) );
define( 'WCB_PATH', plugin_dir_path( WCB_FILE ) );
define( 'WCB_URI', plugins_url( '/', WCB_FILE ) );

// Helper functions.
require_once WCB_PATH . 'inc/helpers.php';

// Global Settings.
require_once WCB_PATH . 'inc/class-wcb-global-settings.php';

// Main Woostify Block Class.
require_once WCB_PATH . 'inc/class-wcb.php';

// Woostify Block Dynamic CSS Class.
require_once WCB_PATH . 'inc/class-wcb-dynamic-css.php';

// Admin.
if ( is_admin() ) {
	require_once WCB_PATH . 'inc/admin/class-wcb-admin.php';
}
