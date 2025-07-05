<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block
 * Version:         1.6.124
 * Author:          hpebben
 * Text Domain:     endoplanner
 */

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
