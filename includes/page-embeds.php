<?php
/** Lightweight landing teaser and native WordPress case workspace. */

function endoplanner_v2_page_markup( $post ) {
    // Elementor may retain shortcode widgets in its page metadata.
    $elementor = get_post_meta( $post->ID, '_elementor_data', true );
    return $post->post_content . ( is_string( $elementor ) ? $elementor : '' );
}

function endoplanner_v2_enqueue_typography() {
    $plugin = dirname( __DIR__ ) . '/endo-planner.php';
    wp_enqueue_style( 'endoplanner-adobe-fonts', 'https://use.typekit.net/dvh7rnb.css', array(), null );
    wp_enqueue_style( 'endoplanner-typography', plugins_url( 'assets/css/brand-typography.css', $plugin ), array( 'endoplanner-adobe-fonts' ), endoplanner_v2_get_version() );
}

function endoplanner_v2_enqueue_page_styles() {
    $plugin = dirname( __DIR__ ) . '/endo-planner.php';
    endoplanner_v2_enqueue_typography();
    wp_enqueue_style( 'endoplanner-pages', plugins_url( 'assets/css/page-embeds.css', $plugin ), array( 'endoplanner-typography' ), endoplanner_v2_get_version() );
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
    endoplanner_v2_enqueue_typography();
}

function endoplanner_v2_is_workspace_page( $page ) {
    if ( ! $page || 'page' !== $page->post_type || 'publish' !== $page->post_status || ! empty( $page->post_password ) ) {
        return false;
    }
    $markup = endoplanner_v2_page_markup( $page );
    return ! has_shortcode( $markup, 'endoplanner_teaser' ) && ( has_shortcode( $markup, 'endoplanner' ) || has_block( 'endoplanner/v2-wizard', $page ) );
}

function endoplanner_v2_find_workspace( $attributes ) {
    if ( ! empty( $attributes['page_id'] ) ) {
        $page = get_post( absint( $attributes['page_id'] ) );
        return endoplanner_v2_is_workspace_page( $page ) ? $page : null;
    }
    if ( ! empty( $attributes['url'] ) ) {
        $url = str_starts_with( $attributes['url'], '/' ) && ! str_starts_with( $attributes['url'], '//' ) ? home_url( $attributes['url'] ) : $attributes['url'];
        $id = url_to_postid( $url );
        if ( $id ) {
            $page = get_post( $id );
            if ( endoplanner_v2_is_workspace_page( $page ) ) {
                return $page;
            }
        }
        // Honour intentional custom destinations, but repair the old default
        // /case/ link when the published workspace has another actual slug.
        if ( rtrim( $url, '/' ) !== rtrim( home_url( '/case/' ), '/' ) ) {
            return null;
        }
    }
    $query = array( 'post_type' => 'page', 'post_status' => 'publish', 'numberposts' => 100, 'orderby' => 'ID', 'order' => 'ASC', 'suppress_filters' => false );
    $pages = array_merge(
        get_posts( array_merge( $query, array( 's' => 'endoplanner' ) ) ),
        get_posts( array_merge( $query, array( 'meta_key' => '_elementor_data', 'meta_value' => 'endoplanner', 'meta_compare' => 'LIKE' ) ) )
    );
    $candidates = array();
    foreach ( $pages as $page ) {
        if ( endoplanner_v2_is_workspace_page( $page ) && (int) $page->ID !== (int) get_option( 'page_on_front' ) ) {
            $candidates[$page->ID] = $page;
        }
    }
    return 1 === count( $candidates ) ? reset( $candidates ) : null;
}

function endoplanner_v2_case_url( $attributes ) {
    $default = home_url( '/case/' );
    $page = endoplanner_v2_find_workspace( $attributes );
    if ( $page ) {
        $url = 'permalink' === ( $attributes['link_mode'] ?? 'direct' ) ? get_permalink( $page->ID ) : add_query_arg( array( 'page_id' => $page->ID, 'endoplanner_case' => $page->ID ), home_url( '/' ) );
    } else {
        $url = $attributes['url'] ?? $default;
    }
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
    $attributes = shortcode_atts( array( 'url' => '', 'page_id' => '', 'link_mode' => 'direct', 'title' => 'If you fail to plan, you plan to fail' ), $attributes, 'endoplanner_teaser' );
    endoplanner_v2_enqueue_page_styles();
    $plugin = dirname( __DIR__ ) . '/endo-planner.php';
    wp_enqueue_script( 'endoplanner-teaser-showcase', plugins_url( 'assets/js/teaser-showcase.js', $plugin ), array(), endoplanner_v2_get_version(), true );
    $instance = wp_unique_id( 'endoplanner-showcase-' );
    $features = array(
        array( '1', 'Clinical indication', array( 'Fontaine stage', 'WIfI assessment', 'Woundosome selection', 'Optional pedal acceleration time' ) ),
        array( '2', 'Disease anatomy', array( 'Lesion extent', 'GLASS stage', 'Pedal target routes', 'Woundosome-guided anatomy' ) ),
        array( '3', 'Intervention plan', array( 'Access planning', 'Crossing and treatment devices', 'Closure', 'Compatibility review' ) ),
        array( '4', 'Case summary', array( 'Selected anatomy', 'Illustrated case PDF', 'Materials preparation checklist' ) ),
    );
    ob_start(); ?>
    <div class="endoplanner-teaser-shell">
    <section class="endoplanner-teaser" aria-label="EndoPlanner overview">
        <img class="endoplanner-teaser-logo" src="<?php echo esc_url( plugins_url( 'assets/images/endoplanner-icon.png', $plugin ) ); ?>" width="512" height="512" alt="Endoplanner" decoding="async" />
        <div class="endoplanner-teaser-intro">
            <h2><?php echo esc_html( $attributes['title'] ); ?></h2>
            <p>Clinical assessment, arterial anatomy and devices in one guided workflow.</p>
            <a class="endoplanner-teaser-start" href="<?php echo esc_url( endoplanner_v2_case_url( $attributes ) ); ?>">Start case <span aria-hidden="true">&rarr;</span></a>
        </div>
        <div class="endoplanner-showcase" aria-label="Application stage preview">
            <div class="endoplanner-showcase-heading"><h3>Endoplanner <em>At a Glance</em></h3><span class="endoplanner-showcase-example">Example case</span></div>
            <div class="endoplanner-teaser-features" role="tablist" aria-label="Explore the four planning stages">
            <?php foreach ( $features as $index => $feature ) : ?>
                <button type="button" class="endoplanner-teaser-feature<?php echo 0 === $index ? ' is-active' : ''; ?>" role="tab" id="<?php echo esc_attr( $instance . '-tab-' . $index ); ?>" aria-controls="<?php echo esc_attr( $instance . '-slide-' . $index ); ?>" aria-selected="<?php echo 0 === $index ? 'true' : 'false'; ?>" tabindex="<?php echo 0 === $index ? '0' : '-1'; ?>" data-stage="<?php echo esc_attr( $index ); ?>"><span class="endoplanner-feature-number" aria-hidden="true"><?php echo esc_html( $feature[0] ); ?></span><span class="endoplanner-feature-title"><?php echo esc_html( $feature[1] ); ?></span></button>
            <?php endforeach; ?>
            </div>
            <div class="endoplanner-showcase-controls"><div class="endoplanner-showcase-dots" aria-label="Choose a stage preview"><?php foreach ( $features as $index => $feature ) : ?><button type="button" class="endoplanner-showcase-dot<?php echo 0 === $index ? ' is-active' : ''; ?>" data-dot="<?php echo esc_attr( $index ); ?>" aria-label="<?php echo esc_attr( 'Show ' . $feature[1] ); ?>" aria-pressed="<?php echo 0 === $index ? 'true' : 'false'; ?>"></button><?php endforeach; ?></div><button type="button" class="endoplanner-showcase-play" aria-label="Pause slideshow" aria-pressed="false">Pause</button></div>
            <?php foreach ( $features as $index => $feature ) : ?>
                <figure class="endoplanner-showcase-slide" role="tabpanel" id="<?php echo esc_attr( $instance . '-slide-' . $index ); ?>" aria-labelledby="<?php echo esc_attr( $instance . '-tab-' . $index ); ?>" <?php echo 0 === $index ? '' : 'hidden'; ?> data-slide="<?php echo esc_attr( $index ); ?>">
                    <figcaption><strong><?php echo esc_html( $feature[1] ); ?></strong><ul class="endoplanner-showcase-highlights"><?php foreach ( $feature[2] as $highlight ) : ?><li><?php echo esc_html( $highlight ); ?></li><?php endforeach; ?></ul></figcaption>
                    <img src="<?php echo esc_url( plugins_url( 'assets/showcase/stage-' . ( $index + 1 ) . '.webp', $plugin ) ); ?>" width="1280" height="800" alt="<?php echo esc_attr( $feature[1] . ' - example of the actual EndoPlanner application' ); ?>" loading="<?php echo 0 === $index ? 'eager' : 'lazy'; ?>" decoding="async" />
                </figure>
            <?php endforeach; ?>
        </div>
    </section>
    </div>
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
    if ( has_shortcode( $markup, 'endoplanner_teaser' ) || has_shortcode( $markup, 'endoplanner' ) || endoplanner_v2_is_workspace_page( $post ) ) {
        endoplanner_v2_enqueue_page_styles();
    }
}, 15 );

add_filter( 'body_class', function( $classes ) {
    if ( is_singular() ) {
        $page = get_post();
        if ( endoplanner_v2_is_workspace_page( $page ) ) {
            $classes[] = 'endoplanner-workspace-page';
        } elseif ( $page && has_shortcode( endoplanner_v2_page_markup( $page ), 'endoplanner_teaser' ) ) {
            $classes[] = 'endoplanner-teaser-page';
        }
    }
    return $classes;
} );

// Preserve the explicit page-ID route only for a real published workspace.
// This avoids a canonical redirect back to a broken/stale pretty permalink.
add_filter( 'redirect_canonical', function( $redirect ) {
    $id = isset( $_GET['endoplanner_case'] ) && is_scalar( $_GET['endoplanner_case'] ) ? absint( $_GET['endoplanner_case'] ) : 0;
    if ( $id && $id === get_queried_object_id() && endoplanner_v2_is_workspace_page( get_post( $id ) ) ) {
        return false;
    }
    return $redirect;
} );
