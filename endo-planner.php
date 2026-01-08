<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block
 * Version:         1.6.163
 * Author:          hpebben
 * Text Domain:     endoplanner
 */

define( 'ENDOPLANNER_V2_VERSION', '1.6.162' );
define( 'ENDOPLANNER_INTERVENTION_PAGE_ID', (int) apply_filters( 'endoplanner_intervention_page_id', 0 ) );

// Let WP auto-register everything based on block.json + build/ assets:
function endoplanner_v2_render_block( $attributes, $content, $block ) {
    $wrapper_attributes = get_block_wrapper_attributes();
    return '<div ' . $wrapper_attributes . '><div class="endoplanner-root"></div></div>';
}

add_action( 'init', function() {
    // block.json now resides in the build directory
    register_block_type( __DIR__ . '/build', array(
        'render_callback' => 'endoplanner_v2_render_block',
    ) );
} );

function endoplanner_v2_should_enqueue_intervention_assets() {
    if ( is_admin() ) {
        return false;
    }

    $enabled = false;
    $post = get_queried_object();

    if ( $post instanceof WP_Post ) {
        if ( ENDOPLANNER_INTERVENTION_PAGE_ID && (int) $post->ID === ENDOPLANNER_INTERVENTION_PAGE_ID ) {
            $enabled = true;
        }

        $slug = isset( $post->post_name ) ? $post->post_name : '';
        $slug_matches = array( 'endoplanner', 'endo-planner', 'interventional-planning' );
        if ( ! $enabled && $slug && in_array( $slug, $slug_matches, true ) ) {
            $enabled = true;
        }

        if ( ! $enabled && function_exists( 'has_block' ) ) {
            $enabled = has_block( 'endoplanner-v2/wizard', $post ) || has_block( 'endoplanner/wizard', $post );
        }

        if ( ! $enabled && function_exists( 'has_shortcode' ) ) {
            $enabled = has_shortcode( $post->post_content, 'endoplanner' );
        }
    }

    return (bool) apply_filters( 'endoplanner_intervention_assets_enabled', $enabled, $post );
}

add_action( 'wp_enqueue_scripts', function() {
    if ( ! endoplanner_v2_should_enqueue_intervention_assets() ) {
        return;
    }

    $script_path = __DIR__ . '/assets/js/intervention-planning.js';
    $style_path  = __DIR__ . '/assets/css/intervention-planning.css';

    $script_version = file_exists( $script_path ) ? filemtime( $script_path ) : ENDOPLANNER_V2_VERSION;
    $style_version  = file_exists( $style_path ) ? filemtime( $style_path ) : ENDOPLANNER_V2_VERSION;

    wp_enqueue_script(
        'endoplanner-intervention-planning',
        plugins_url( 'assets/js/intervention-planning.js', __FILE__ ),
        array(),
        $script_version,
        true
    );

    wp_enqueue_style(
        'endoplanner-intervention-planning',
        plugins_url( 'assets/css/intervention-planning.css', __FILE__ ),
        array(),
        $style_version
    );

    $debug = isset( $_GET['endo_debug'] ) || (bool) apply_filters( 'endoplanner_intervention_debug', false );
    wp_add_inline_script(
        'endoplanner-intervention-planning',
        'window.EndoPlannerIntervention = window.EndoPlannerIntervention || ' . wp_json_encode( array(
            'debug' => $debug,
        ) ) . ';',
        'before'
    );
}, 20 );
