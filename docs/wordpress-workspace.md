# WordPress landing teaser and dedicated case workspace

## Recommended structure

- Main page: a lightweight EndoPlanner feature teaser.
- `/case/`: the complete native WordPress application, in the same tab.
- Use the same HTTPS domain so the existing browser-local case and preferences
  remain available. The Start case link navigates; it does not erase a case.
- Keep the public landing page's navigation and footer. Use a minimal page
  layout for the workspace with the plugin's compact Back to EndoPlanner link.

The plugin provides both embeds from v1.6.180. It does not automatically create
or publish WordPress pages, change the site's home page, or clear saved cases.

## Configure the case page

1. Update the plugin, including its generated `build/` files and `includes/`.
2. Create a WordPress Page named **Case**, with the URL slug **case**.
3. In Elementor, select **Elementor Canvas** under Page Layout. This removes
   the theme's header, footer and sidebar for this page only. A theme-provided
   blank/full-width template is another option if Elementor is not used.
4. Use a single full-width container, no sidebar, and no minimum/fixed height,
   entrance animation or boxed-width parent. Set outer gap/padding to 0; the
   workspace provides its own responsive padding and maximum width.
5. Add an Elementor **Shortcode** widget (or a Gutenberg **Shortcode** block):

   ```text
   [endoplanner layout="workspace"]
   ```

6. Publish the page. If the main page is not the site's root, set its backlink:

   ```text
   [endoplanner layout="workspace" back_url="/endoplanner/"]
   ```

The workspace gives the application up to 1440 px, replaces the old scrolling
section and has a compact return link. Keep one planner instance on this page.
The existing wizard block is still supported, as is `[endoplanner layout="embedded"]`
for layouts that already provide their own surrounding frame.

## Configure the main page

Replace the old HTML application section with a Shortcode widget/block:

```text
[endoplanner_teaser url="/case/"]
```

Or use the WordPress case page's actual numeric ID for a permalink-safe link:

```text
[endoplanner_teaser page_id="123"]
```

Replace 123 with the created page's ID. A custom teaser heading is optional:

```text
[endoplanner_teaser url="/case/" title="Plan your next peripheral intervention."]
```

The teaser displays clinical assessment, PAT, WIfI, GLASS, pedal/woundosome
anatomy, target routes, lesion/device planning, compatibility checks, local
preferences, automatic browser saving, illustrated PDF and preparation list.
It uses a small scoped stylesheet and no application JavaScript.

Change any other **Start case** buttons from `#case` to `/case/` (or the full
same-site URL). Remove their legacy `.endo-newcase-trigger` class and
`id="startnewcase"`: those old selectors intercept clicks to reset and scroll.
The new shortcode's link deliberately uses a different class and a normal href.
Do not paste scripts, duplicate `.endoplanner-root`, or iframe the old page.

## Check after switching

- Landing page: the teaser and Start case link appear; no planner is mounted.
- Start case opens the dedicated page in the current tab.
- The Case page shows one numbered wizard and uses the available screen width.
- Check at phone and desktop widths, including the case summary and PDF export.
- Browser-local cases/preferences continue on the same domain; nothing is
  transferred between different domains or browsers automatically.
- Clear page/plugin/CDN caches once after the plugin/page update. Exclude the
  workspace application scripts from script-combining/delay rules if those
  rules prevent the wizard from mounting. No page-cache exclusion is required
  merely because the case is held locally in the browser.

## Implementation notes

`block.json` uses `viewScript` for the frontend bundle. The block render or
workspace shortcode explicitly enqueues its registered script and styles;
raw existing `.endoplanner-root` embeds remain detected. Elementor shortcode
widgets are also detected in `_elementor_data` so styles load before rendering.
The native workspace does not load the older Elementor intervention scripts.
The teaser shortcode only enqueues `assets/css/page-embeds.css`.

References:
- [Elementor Canvas page layout](https://elementor.com/help/using-elementors-canvas-page-template/)
- [WordPress block metadata](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)
- [WordPress shortcode API](https://developer.wordpress.org/reference/functions/add_shortcode/)
