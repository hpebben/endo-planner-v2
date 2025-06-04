<?php
/**
 * Plugin Name: EndoPlanner 2.0
 * Description: A Gutenberg block wizard for clinical indication, patency mapping, case summary, intervention planning, and PDF export.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL2+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Automatically load dependencies and version from build/index.asset.php
$asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' );

// Register the block’s main script handle:
wp_register_script(
    'endo-planner-block',
    plugins_url( 'build/index.js', __FILE__ ),
    $asset_file['dependencies'],
    $asset_file['version']
);

// Register the block’s CSS (editor + front-end use same CSS here):
wp_register_style(
    'endo-planner-editor',
    plugins_url( 'build/index.css', __FILE__ ),
    [],
    filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
);

// Finally, register the block from block.json:
register_block_type( plugin_dir_path( __FILE__ ) . 'block.json', [
    'editor_script' => 'endo-planner-block',
    'editor_style'  => 'endo-planner-editor',
    'script'        => 'endo-planner-block',
    'style'         => 'endo-planner-editor',
] );
