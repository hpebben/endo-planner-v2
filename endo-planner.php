<?php
/**
 * Plugin Name: EndoPlanner 2.0
 * Description: A Gutenberg‐based wizard for clinical indication, patency mapping, case summary, intervention planning, and PDF export.
 * Version:     1.0.0
 * Author:      Your Name
 * License:     GPL2+
 *
 * GitHub Plugin URI: https://github.com/hpebben/endo-planner-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Automatically load dependencies and version from build/index.asset.php
 */
$asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' );

/**
 * Register our block’s JavaScript (built by wp-scripts) and CSS for the editor.
 */
wp_register_script(
    'endo-planner-block',                                // Handle
    plugins_url( 'build/index.js', __FILE__ ),           // Path to built JS
    $asset_file['dependencies'],                         // WordPress‐provided dependencies
    $asset_file['version']                               // Version (based on file hash)
);

wp_register_style(
    'endo-planner-editor',                                // Handle
    plugins_url( 'build/index.css', __FILE__ ),           // Path to built editor CSS
    array(),                                              // No dependencies
    filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
);

/**
 * Register the block using block.json. 
 * This lets WordPress know which script/style handles to enqueue when the block is used.
 */
register_block_type(
    plugin_dir_path( __FILE__ ) . 'block.json',
    array(
        'editor_script' => 'endo-planner-block',   // Loaded in Gutenberg editor
        'editor_style'  => 'endo-planner-editor',  // Editor‐only styles
        'script'        => 'endo-planner-block',   // Frontend script handle (if you have any frontend JS)
        'style'         => 'endo-planner-editor',  // Frontend CSS handle (if you want to reuse editor CSS)
    )
);
