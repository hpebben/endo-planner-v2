<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block
 * Version:         1.6.51
 * Author:          hpebben
 * Text Domain:     endoplanner
 */

// Let WP auto-register everything based on block.json + build/ assets:
add_action( 'init', function() {
    // block.json now resides in the build directory
    register_block_type( __DIR__ . '/build' );
} );
