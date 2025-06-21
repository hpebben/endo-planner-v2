<?php
/**
 * Plugin Name:     Endo Planner v2
 * Description:     EndoPlanner Wizard block
 * Version:         1.0.0
 * Author:          hpebben
 * Text Domain:     endoplanner
 */

// Let WP auto-register everything based on block.json + build/ assets:
add_action( 'init', function() {
    register_block_type( __DIR__ . '/build' );
} );
