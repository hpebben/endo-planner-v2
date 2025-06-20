<?php
/**
 * Plugin Name: EndoPlanner 2.0
 * Description: A Gutenberg‐based wizard for clinical indication, patency mapping, case summary, intervention planning, and PDF export.
 * Version:     1.6.49
 * Author:      hpebben
 * License:     GPL2+
 *
 * GitHub Plugin URI: https://github.com/hpebben/endo-planner-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load plugin translations.
 */
function endoplanner_load_textdomain() {
    load_plugin_textdomain( 'endoplanner', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'endoplanner_load_textdomain' );

function endoplanner_render_callback( $attributes ) {
    return '<div class="endoplanner-root"></div>';
}

function endoplanner_register_blocks() {
    $build_dir = __DIR__ . '/build';

    // front-end script
    $frontend_script = 'build/index.js';
    $frontend_handle = 'endoplanner-frontend';
    wp_register_script(
        $frontend_handle,
        plugins_url( $frontend_script, __FILE__ ),
        [ 'wp-element', 'wp-components', 'wp-data' ],
        filemtime( $build_dir . '/index.js' )
    );

    // front-end style (if you have one)
    $frontend_style = 'build/style-index.css';
    if ( file_exists( $build_dir . '/style-index.css' ) ) {
        wp_register_style(
            'endoplanner-frontend-style',
            plugins_url( $frontend_style, __FILE__ ),
            [],
            filemtime( $build_dir . '/style-index.css' )
        );
    }

    // editor script
    $editor_script = 'build/index.js';
    wp_register_script(
        'endoplanner-editor',
        plugins_url( $editor_script, __FILE__ ),
        [ 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-editor' ],
        filemtime( $build_dir . '/index.js' )
    );

    // editor style (if you have one)
    if ( file_exists( $build_dir . '/editor.css' ) ) {
        wp_register_style(
            'endoplanner-editor-style',
            plugins_url( 'build/editor.css', __FILE__ ),
            [],
            filemtime( $build_dir . '/editor.css' )
        );
    }

    register_block_type( 'endoplanner/v2-wizard', [
        'script'       => $frontend_handle,
        'editor_script'=> 'endoplanner-editor',
        'style'        => ! empty( $frontend_style ) ? 'endoplanner-frontend-style' : null,
        'editor_style' => file_exists( $build_dir . '/editor.css' ) ? 'endoplanner-editor-style' : null,
        'render_callback' => 'endoplanner_render_callback',
    ] );
}
add_action( 'init', 'endoplanner_register_blocks' );

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( 'Plugin path = ' . plugin_dir_path( __FILE__ ) );
}
