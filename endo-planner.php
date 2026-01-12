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

function endoplanner_v2_get_version() {
    $data = get_file_data( __FILE__, array( 'version' => 'Version' ) );
    return $data['version'] ?? '';
}

function endoplanner_v2_get_git_sha() {
    $git_dir = __DIR__ . '/.git';
    $head_path = $git_dir . '/HEAD';
    if ( ! file_exists( $head_path ) ) {
        return '';
    }

    $head = trim( (string) @file_get_contents( $head_path ) );
    if ( str_starts_with( $head, 'ref:' ) ) {
        $ref = trim( substr( $head, 4 ) );
        $ref_path = $git_dir . '/' . $ref;
        if ( file_exists( $ref_path ) ) {
            $head = trim( (string) @file_get_contents( $ref_path ) );
        }
    }

    if ( ! $head ) {
        return '';
    }

    return substr( $head, 0, 7 );
}

function endoplanner_v2_build_signature() {
    return array(
        'version' => endoplanner_v2_get_version(),
        'git'     => endoplanner_v2_get_git_sha(),
    );
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
function endoplanner_v2_enqueue_intervention_assets() {
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
}

function endoplanner_v2_enqueue_patency_assets() {
    $base_url  = plugin_dir_url( __FILE__ );
    $base_path = plugin_dir_path( __FILE__ );

    $css_rel = 'assets/css/patency-ui.css';
    $js_rel  = 'assets/js/patency-ui.js';

    $css_path = $base_path . $css_rel;
    $js_path  = $base_path . $js_rel;

    if ( file_exists( $css_path ) ) {
        wp_enqueue_style(
            'endoplanner-patency',
            $base_url . $css_rel,
            array(),
            filemtime( $css_path )
        );
    }

    if ( file_exists( $js_path ) ) {
        wp_enqueue_script(
            'endoplanner-patency',
            $base_url . $js_rel,
            array(),
            filemtime( $js_path ),
            true
        );

        $signature = endoplanner_v2_build_signature();
        $inline = 'window.EndoPlannerV2Build = ' . wp_json_encode( $signature ) . ';';
        $inline .= 'console.info("[EndoPlanner V2]", window.EndoPlannerV2Build);';
        wp_add_inline_script( 'endoplanner-patency', $inline, 'before' );
    }
}

add_action( 'wp_enqueue_scripts', function() {
    if ( is_admin() ) {
        return;
    }

    endoplanner_v2_enqueue_intervention_assets();
    endoplanner_v2_enqueue_patency_assets();
}, 20 );

add_action( 'elementor/editor/before_enqueue_scripts', 'endoplanner_v2_enqueue_intervention_assets' );
add_action( 'elementor/preview/enqueue_scripts', 'endoplanner_v2_enqueue_intervention_assets' );
add_action( 'elementor/preview/enqueue_styles', 'endoplanner_v2_enqueue_intervention_assets' );

add_action( 'elementor/editor/before_enqueue_scripts', 'endoplanner_v2_enqueue_patency_assets' );
add_action( 'elementor/preview/enqueue_scripts', 'endoplanner_v2_enqueue_patency_assets' );
add_action( 'elementor/preview/enqueue_styles', 'endoplanner_v2_enqueue_patency_assets' );
