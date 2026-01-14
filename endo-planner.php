<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block + Intervention Planning frontend
 * Version:         1.6.164
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
    $version = endoplanner_v2_get_version();
    $git = endoplanner_v2_get_git_sha();
    return array(
        'version' => $version ? $version : 'unknown',
        'git'     => $git ? $git : 'unknown',
    );
}

add_action( 'init', function() {
    register_block_type( __DIR__ . '/build', array(
        'render_callback' => 'endoplanner_v2_render_block',
    ) );
} );

function endoplanner_v2_page_has_planner() {
    if ( ! is_singular() ) {
        return false;
    }

    $post = get_post();
    if ( ! $post ) {
        return false;
    }

    $has_block = function_exists( 'has_block' ) && has_block( 'endoplanner/v2-wizard', $post );
    $has_shortcode = function_exists( 'has_shortcode' ) && has_shortcode( $post->post_content, 'endoplanner' );
    $has_marker = str_contains( $post->post_content, 'endoplanner-root' );

    $has_planner = $has_block || $has_shortcode || $has_marker;

    return (bool) apply_filters( 'endoplanner_v2_should_enqueue_planner_assets', $has_planner, $post );
}

function endoplanner_v2_label_planner_script_tag( $tag, $handle, $src ) {
    if ( 'endoplanner-v2-wizard-script' !== $handle ) {
        return $tag;
    }

    if ( false === strpos( $tag, 'my-plugin-planner-js' ) ) {
        $tag = preg_replace(
            '/<script /',
            '<script id="my-plugin-planner-js" data-source="my-plugin" ',
            $tag,
            1
        );
    }

    return "\n<!-- my-plugin planner scripts -->\n" . $tag;
}

add_filter( 'script_loader_tag', 'endoplanner_v2_label_planner_script_tag', 10, 3 );

/**
 * Enqueue Intervention Planning assets for Elementor-based pages.
 * (No build step; shipped as plain JS/CSS in assets/.)
 */
function endoplanner_v2_enqueue_intervention_assets() {
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

        $signature = endoplanner_v2_build_signature();
        $inline = 'window.EndoPlannerV2Build = ' . wp_json_encode( $signature ) . ';';
        $inline .= 'window.EndoPlannerInterventionBuild = window.EndoPlannerV2Build;';
        wp_add_inline_script( 'endoplanner-intervention', $inline, 'before' );
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
        wp_add_inline_script( 'endoplanner-patency', $inline, 'before' );
    }
}

function endoplanner_v2_enqueue_device_ui_assets() {
    $base_url  = plugin_dir_url( __FILE__ );
    $base_path = plugin_dir_path( __FILE__ );

    $js_rel  = 'assets/js/device-ui.js';
    $js_path = $base_path . $js_rel;

    if ( file_exists( $js_path ) ) {
        wp_enqueue_script(
            'endoplanner-device-ui',
            $base_url . $js_rel,
            array(),
            filemtime( $js_path ),
            true
        );

        $signature = endoplanner_v2_build_signature();
        $inline = 'window.EndoPlannerV2Build = ' . wp_json_encode( $signature ) . ';';
        wp_add_inline_script( 'endoplanner-device-ui', $inline, 'before' );
    }
}

add_action( 'wp_enqueue_scripts', function() {
    if ( is_admin() ) {
        return;
    }

    if ( ! endoplanner_v2_page_has_planner() ) {
        return;
    }

    endoplanner_v2_enqueue_intervention_assets();
    endoplanner_v2_enqueue_patency_assets();
    endoplanner_v2_enqueue_device_ui_assets();
}, 20 );

add_action( 'elementor/editor/before_enqueue_scripts', 'endoplanner_v2_enqueue_intervention_assets' );
add_action( 'elementor/preview/enqueue_scripts', 'endoplanner_v2_enqueue_intervention_assets' );
add_action( 'elementor/preview/enqueue_styles', 'endoplanner_v2_enqueue_intervention_assets' );

add_action( 'elementor/editor/before_enqueue_scripts', 'endoplanner_v2_enqueue_patency_assets' );
add_action( 'elementor/preview/enqueue_scripts', 'endoplanner_v2_enqueue_patency_assets' );
add_action( 'elementor/preview/enqueue_styles', 'endoplanner_v2_enqueue_patency_assets' );

add_action( 'elementor/editor/before_enqueue_scripts', 'endoplanner_v2_enqueue_device_ui_assets' );
add_action( 'elementor/preview/enqueue_scripts', 'endoplanner_v2_enqueue_device_ui_assets' );
