<?php
/** Lightweight landing teaser and native WordPress case workspace. */

function endoplanner_v2_page_markup( $post ) {
    // Elementor may retain shortcode widgets in its page metadata.
    $elementor = get_post_meta( $post->ID, '_elementor_data', true );
    return $post->post_content . ( is_string( $elementor ) ? $elementor : '' );
}

function endoplanner_v2_enqueue_page_styles() {
    $plugin = dirname( __DIR__ ) . '/endo-planner.php';
    wp_enqueue_style( 'endoplanner-pages', plugins_url( 'assets/css/page-embeds.css', $plugin ), array(), endoplanner_v2_get_version() );
}

function endoplanner_v2_enqueue_wizard_assets() {
    $type = WP_Block_Type_Registry::get_instance()->get_registered( 'endoplanner/v2-wizard' );
    if ( ! $type ) {
        return;
    }
    foreach ( array_merge( $type->script_handles ?? array(), $type->view_script_handles ?? array() ) as $handle ) {
        wp_enqueue_script( $handle );
    }
    foreach ( $type->style_handles ?? array() as $handle ) {
        wp_enqueue_style( $handle );
    }
    wp_enqueue_style( 'wp-components' );
}

function endoplanner_v2_case_url( $attributes ) {
    $default = home_url( '/case/' );
    $url = ! empty( $attributes['page_id'] ) ? get_permalink( absint( $attributes['page_id'] ) ) : ( $attributes['url'] ?? $default );
    // Keep browser-local case state on the same origin. This is a navigation
    // link, not a new-case reset or a client-side redirect.
    if ( ! $url || str_starts_with( $url, '#' ) ) {
        return $default;
    }
    $url = wp_validate_redirect( $url, $default );
    $home = wp_parse_url( home_url( '/' ) );
    $parts = wp_parse_url( $url );
    if ( ! empty( $parts['host'] ) && ( strtolower( $parts['host'] ) !== strtolower( $home['host'] ) || ( $parts['port'] ?? null ) !== ( $home['port'] ?? null ) || ( $parts['scheme'] ?? $home['scheme'] ) !== $home['scheme'] ) ) {
        return $default;
    }
    return $url;
}

function endoplanner_v2_teaser_shortcode( $attributes = array() ) {
    $attributes = shortcode_atts( array( 'url' => home_url( '/case/' ), 'page_id' => '', 'title' => 'Plan the intervention. Prepare the procedure.' ), $attributes, 'endoplanner_teaser' );
    endoplanner_v2_enqueue_page_styles();
    $features = array(
        array( '01', 'Clinical indication', 'Fontaine, WIfI and optional pedal acceleration time.' ),
        array( '02', 'Disease anatomy', 'Lesion extent, GLASS stage and target arterial path.' ),
        array( '03', 'Wound-guided planning', 'Selected woundosomes with AP and lateral pedal anatomy.' ),
        array( '04', 'Visual device plan', 'Access, crossing, treatment and shared route support.' ),
        array( '05', 'Compatibility review', 'Wire platforms, introducer profiles and working lengths.' ),
        array( '06', 'Summary & preparation', 'Illustrated PDF and an assistant-ready materials checklist.' ),
    );
    ob_start(); ?>
    <section class="endoplanner-teaser" aria-label="EndoPlanner overview">
        <div class="endoplanner-teaser-intro">
            <span class="endoplanner-page-eyebrow">ENDOPLANNER</span>
            <h2><?php echo esc_html( $attributes['title'] ); ?></h2>
            <p>Clinical assessment, arterial anatomy and devices in one guided workflow.</p>
            <a class="endoplanner-teaser-start" href="<?php echo esc_url( endoplanner_v2_case_url( $attributes ) ); ?>">Start case <span aria-hidden="true">&rarr;</span></a>
            <p class="endoplanner-teaser-save">Local device preferences &middot; Automatic browser save</p>
        </div>
        <div class="endoplanner-teaser-features">
            <?php foreach ( $features as $feature ) : ?>
                <div class="endoplanner-teaser-feature"><span class="endoplanner-feature-number" aria-hidden="true"><?php echo esc_html( $feature[0] ); ?></span><div><h3><?php echo esc_html( $feature[1] ); ?></h3><p><?php echo esc_html( $feature[2] ); ?></p></div></div>
            <?php endforeach; ?>
        </div>
    </section>
    <?php return ob_get_clean();
}

function endoplanner_v2_workspace_shortcode( $attributes = array() ) {
    $attributes = shortcode_atts( array( 'layout' => 'workspace', 'back_url' => home_url( '/' ) ), $attributes, 'endoplanner' );
    endoplanner_v2_enqueue_wizard_assets();
    if ( 'embedded' === $attributes['layout'] ) {
        return '<div class="endoplanner-root"></div>';
    }
    endoplanner_v2_enqueue_page_styles();
    $back = wp_validate_redirect( $attributes['back_url'], home_url( '/' ) );
    return '<div class="endoplanner-workspace"><header class="endoplanner-workspace-header"><a href="' . esc_url( $back ) . '">&larr; Back to EndoPlanner</a><span>Case workspace</span></header><div class="endoplanner-root"></div></div>';
}

add_action( 'init', function() {
    add_shortcode( 'endoplanner', 'endoplanner_v2_workspace_shortcode' );
    add_shortcode( 'endoplanner_teaser', 'endoplanner_v2_teaser_shortcode' );
} );

add_action( 'wp_enqueue_scripts', function() {
    if ( is_admin() || ! is_singular() ) {
        return;
    }
    $post = get_post();
    if ( ! $post ) {
        return;
    }
    $markup = endoplanner_v2_page_markup( $post );
    if ( has_shortcode( $markup, 'endoplanner_teaser' ) || has_shortcode( $markup, 'endoplanner' ) ) {
        endoplanner_v2_enqueue_page_styles();
    }
}, 15 );
