<?php
// Lightweight WordPress API doubles exercise the plugin's asset-selection and
// escaping logic. This is not a replacement for checking a real site's theme.
$actions = array();
$shortcodes = array();
$scripts = array();
$styles = array();
$post = (object) array( 'ID' => 12, 'post_content' => '' );
$elementor_data = '';
function add_action( $hook, $callback, $priority = 10, $arguments = 1 ) { $GLOBALS['actions'][$hook][$priority][] = $callback; }
function add_filter( $hook, $callback, $priority = 10, $arguments = 1 ) {}
function apply_filters( $hook, $value, ...$args ) { return $value; }
function add_shortcode( $tag, $callback ) { $GLOBALS['shortcodes'][$tag] = $callback; }
function shortcode_atts( $defaults, $attributes, $tag = '' ) { return array_intersect_key( array_merge( $defaults, (array) $attributes ), $defaults ); }
function get_post_meta( $id, $key, $single = false ) { return $GLOBALS['elementor_data']; }
function home_url( $path = '/' ) { return 'https://example.org' . $path; }
function get_permalink( $id ) { return 123 === $id ? 'https://example.org/case/' : false; }
function absint( $value ) { return abs( (int) $value ); }
function wp_parse_url( $url ) { return parse_url( $url ); }
function wp_validate_redirect( $url, $fallback = '' ) {
    $parts = parse_url( $url );
    if ( false === $parts || ( isset( $parts['scheme'] ) && ! in_array( $parts['scheme'], array( 'http', 'https' ), true ) ) || ( ! empty( $parts['host'] ) && 'example.org' !== $parts['host'] ) ) { return $fallback; }
    return $url;
}
function esc_html( $text ) { return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' ); }
function esc_url( $text ) { return esc_html( $text ); }
function plugins_url( $path, $file = '' ) { return '/wp-content/plugins/endo-planner-v2/' . $path; }
function plugin_dir_url( $path ) { return '/wp-content/plugins/endo-planner-v2/'; }
function plugin_dir_path( $path ) { return dirname( $path ) . '/'; }
function get_file_data( $file, $headers ) { preg_match( '/Version:\s*([^\s]+)/', file_get_contents( $file ), $match ); return array( 'version' => $match[1] ); }
function wp_enqueue_style( $handle, ...$args ) { $GLOBALS['styles'][] = $handle; }
function wp_enqueue_script( $handle, ...$args ) { $GLOBALS['scripts'][] = $handle; }
function wp_add_inline_script( ...$args ) {}
function wp_json_encode( $value ) { return json_encode( $value ); }
function get_post() { return $GLOBALS['post']; }
function is_singular() { return true; }
function is_admin() { return false; }
function has_shortcode( $content, $tag ) { return (bool) preg_match( '/\[' . preg_quote( $tag, '/' ) . '(?=[\s\]])/', $content ); }
function has_block( $name, $post ) { return str_contains( $post->post_content, 'wp:' . $name ); }
function get_block_wrapper_attributes() { return 'class="wp-block-endoplanner-v2-wizard"'; }
class WP_Block_Type_Registry {
    public $block;
    private static $instance;
    public static function get_instance() { return self::$instance ?? ( self::$instance = new self() ); }
    public function get_registered( $name ) { return $this->block; }
}
function register_block_type( $path, $options = array() ) {
    $metadata = json_decode( file_get_contents( $path . '/block.json' ), true );
    WP_Block_Type_Registry::get_instance()->block = (object) array(
        'script_handles' => isset( $metadata['script'] ) ? array( 'endoplanner-v2-wizard-script' ) : array(),
        'view_script_handles' => isset( $metadata['viewScript'] ) ? array( 'endoplanner-v2-wizard-view-script' ) : array(),
        'style_handles' => array( 'endoplanner-v2-wizard-style' ),
    );
}
function run_actions( $hook ) { $priorities = $GLOBALS['actions'][$hook] ?? array(); ksort( $priorities ); foreach ( $priorities as $callbacks ) { foreach ( $callbacks as $callback ) { $callback(); } } }
function check( $condition, $message ) { if ( ! $condition ) { throw new RuntimeException( $message ); } }
function clear_assets() { $GLOBALS['scripts'] = array(); $GLOBALS['styles'] = array(); }

require dirname( __DIR__ ) . '/endo-planner.php';
run_actions( 'init' );
check( isset( $shortcodes['endoplanner'], $shortcodes['endoplanner_teaser'] ), 'Both shortcodes must register.' );
check( empty( WP_Block_Type_Registry::get_instance()->block->script_handles ), 'No globally enqueued frontend script.' );

$post->post_content = '[endoplanner_teaser url="/case/"]';
run_actions( 'wp_enqueue_scripts' );
$teaser = endoplanner_v2_teaser_shortcode( array( 'url' => '/case/', 'title' => '<script>unsafe</script>' ) );
check( ! $scripts, 'Teaser pages must not load the wizard or legacy JavaScript.' );
check( in_array( 'endoplanner-pages', $styles, true ), 'Teaser style must load.' );
check( str_contains( $teaser, 'href="/case/"' ), 'Start case must navigate to the case page.' );
check( str_contains( $teaser, '&lt;script&gt;unsafe&lt;/script&gt;' ), 'Custom heading must be escaped.' );
check( ! str_contains( $teaser, 'endo-newcase-trigger' ) && ! str_contains( $teaser, 'id="startnewcase"' ), 'Teaser must not use legacy reset triggers.' );
check( ! str_contains( $teaser, 'endoplanner-root' ), 'Teaser must not mount the application.' );
foreach ( array( 'javascript:alert(1)', 'https://other.example/case/', 'http://example.org/case/', '#case' ) as $bad_url ) {
    check( 'https://example.org/case/' === endoplanner_v2_case_url( array( 'url' => $bad_url ) ), 'Invalid or cross-origin case URLs must fall back safely.' );
}
check( 'https://example.org/case/' === endoplanner_v2_case_url( array( 'page_id' => '123' ) ), 'Page ID permalink must resolve.' );

clear_assets();
$post->post_content = '';
$elementor_data = '[{"widgetType":"shortcode","settings":{"shortcode":"[endoplanner layout=\"workspace\"]"}}]';
run_actions( 'wp_enqueue_scripts' );
$workspace = endoplanner_v2_workspace_shortcode();
check( in_array( 'endoplanner-v2-wizard-view-script', $scripts, true ), 'Elementor shortcode must load the registered view script.' );
check( in_array( 'endoplanner-v2-wizard-style', $styles, true ) && in_array( 'wp-components', $styles, true ), 'Workspace must load wizard and WordPress control styles.' );
check( ! in_array( 'endoplanner-intervention', $scripts, true ), 'Native workspace should not load legacy Elementor scripts.' );
check( 1 === substr_count( $workspace, 'class="endoplanner-root"' ), 'Workspace must contain exactly one application root.' );
check( str_contains( $workspace, 'Back to EndoPlanner' ), 'Workspace must retain navigation.' );
check( '<div class="endoplanner-root"></div>' === endoplanner_v2_workspace_shortcode( array( 'layout' => 'embedded' ) ), 'Embedded option must retain a plain application root.' );

clear_assets(); $elementor_data = ''; $post->post_content = '<div class="endoplanner-root"></div>';
run_actions( 'wp_enqueue_scripts' );
check( in_array( 'endoplanner-v2-wizard-view-script', $scripts, true ), 'Existing raw HTML roots must keep loading the wizard.' );
check( in_array( 'endoplanner-intervention', $scripts, true ), 'Legacy embeds retain their scripts.' );

if ( ! empty( $argv[1] ) ) {
    $head = '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/css/page-embeds.css"><style>body{margin:0;background:#fafbfe}</style></head><body>';
    file_put_contents( $argv[1] . '/teaser-qa.html', $head . endoplanner_v2_teaser_shortcode( array( 'url' => '/e2e/workspace-qa.html' ) ) . '</body></html>' );
    file_put_contents( $argv[1] . '/workspace-markup.html', endoplanner_v2_workspace_shortcode() );
    file_put_contents( $argv[1] . '/workspace-qa.html', str_replace( '</head>', '<link rel="stylesheet" href="/src/styles/style.scss"></head>', $head ) . endoplanner_v2_workspace_shortcode() . '<script type="module" src="/e2e/main.jsx"></script></body></html>' );
}
echo "WordPress embed checks passed.\n";
