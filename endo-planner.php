<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block + Intervention Planning frontend
 * Version:         1.6.163
 * Author:          hpebben
 * Text Domain:     endoplanner
 */

function endoplanner_v2_render_block( $attributes, $content, $block ) {
    $wrapper_attributes = get_block_wrapper_attributes();
    return '<div ' . $wrapper_attributes . '><div class="endoplanner-root"></div></div>';
}

add_action( 'init', function() {
    register_block_type( __DIR__ . '/build', array(
        'render_callback' => 'endoplanner_v2_render_block',
    ) );
} );

/**
 * Enqueue Intervention Planning assets for Elementor-based pages.
 * (No build step; shipped as plain JS/CSS in assets/.)
 */
add_action( 'wp_enqueue_scripts', function() {
    if ( is_admin() ) {
        return;
    }

    // TEMPORARILY: load on all frontend pages to validate it works.
    // After validation, restrict via is_front_page()/is_page()/slug/page-id.
    $base_url  = plugin_dir_url( __FILE__ );
    $base_path = plugin_dir_path( __FILE__ );

    $css_rel = 'assets/css/intervention-planning.css';
    $js_rel  = 'assets/js/intervention-planning.js';

    $css_path = $base_path . $css_rel;
    $js_path  = $base_path . $js_rel;

    if ( file_exists( $css_path ) ) {
        wp_enqueue_style(
            'endoplanner-intervention',
            $base_url . $css_rel,
            array(),
            filemtime( $css_path )
        );
    }

    if ( file_exists( $js_path ) ) {
        wp_enqueue_script(
            'endoplanner-intervention',
            $base_url . $js_rel,
            array(),
            filemtime( $js_path ),
            true
        );
    }
}, 20 );
