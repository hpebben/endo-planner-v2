# WordPress landing teaser and dedicated case workspace

## Recommended structure

- Main page: a lightweight EndoPlanner feature teaser.
- A separate Case page: the complete native WordPress application, in the same tab.
- Use the same HTTPS domain so the existing browser-local case and preferences
  remain available. The Start case link navigates; it does not erase a case.
- Keep the public landing page's navigation and footer. Use a minimal page
  layout for the workspace with the plugin's compact Back to EndoPlanner link.

The plugin provides both embeds from v1.6.180. It does not automatically create
or publish WordPress pages, change the site's home page, or clear saved cases.

## Configure the case page

1. Update the plugin, including its generated `build/` files and `includes/`.
2. Create a WordPress Page named **Case**. The slug can be `case` or another name.
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
[endoplanner_teaser page_id="123"]
```

Replace **123** with the published Case page's actual numeric ID: open that page
for editing and read the number after `post=` in the browser's address bar.
This explicitly identifies the workspace even if the site contains draft copies,
another page has the `case` slug, or the pretty permalink is being misrouted.

With exactly one published workspace page, automatic discovery also works:

```text
[endoplanner_teaser]
```

Discovery includes shortcode widgets stored in Elementor metadata and the
wizard block. It excludes the front page, pages containing the teaser, and
password-protected/unpublished pages. With multiple published workspace pages,
use `page_id` explicitly. The old `url="/case/"` default also tries to discover
the workspace; intentional custom URLs are retained.

A custom teaser heading is optional:

```text
[endoplanner_teaser page_id="123" title="Plan your next peripheral intervention."]
```

The teaser displays clinical assessment, PAT, WIfI, GLASS, pedal/woundosome
anatomy, target routes, lesion/device planning, compatibility checks, local
preferences, automatic browser saving, illustrated PDF and preparation list.
Below the four numbered stages, a visual showcase uses actual application
screenshots from a fictional example case. It advances every five seconds and
highlights the current stage in dark blue. Hover or click a stage number, or use
the navigation dots, to choose a slide. Arrow keys, Home and End also work when
a stage has keyboard focus. Rotation pauses while hovering over the teaser,
while a control has keyboard focus, and when the browser tab is hidden. A
Pause/Play button is provided; reduced-motion preferences start it paused.
The teaser loads only a small controller and scoped stylesheet, without the
application bundle. The compressed screenshots are included with the plugin.

By default Start case uses the same-site direct page-ID link, for example
`/?page_id=123&endoplanner_case=123`. The marker keeps WordPress's canonical
redirect from sending this workspace back to an incorrect pretty permalink.
It does not change the page template or bypass access/maintenance controls.
Once the site's pretty permalinks are working correctly, you can opt in:

```text
[endoplanner_teaser page_id="123" link_mode="permalink"]
```

Change any other **Start case** buttons from `#case` to the same direct
page-ID link (replace both occurrences of 123). Remove their legacy `.endo-newcase-trigger` class and
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
The teaser shortcode only enqueues `assets/css/page-embeds.css` and
`assets/js/teaser-showcase.js`. Screenshot WebP assets are in `assets/showcase/`.

## If the address changes but the landing page remains visible

1. Use the Case page's actual ID in the shortcode above, update the main page,
   and clear the site's page/CDN cache. Test the resulting Start case link.
2. Confirm the Case page contains only the workspace shortcode and uses
   Elementor Canvas (or a blank theme template). A link cannot remove a header
   or footer supplied by the destination page's template.
3. If the direct page-ID link works but `/case/` does not, check the published
   page's actual slug, then visit **Settings → Permalinks → Save Changes** to
   refresh WordPress rewrite rules. Review any custom redirects for `/case/`.
4. If both addresses still show the landing page, review Elementor Theme Builder
   display conditions: the landing template should apply to the front page,
   not every page. Also check for a cache serving the front page for other URLs.
5. Compare a signed-out/incognito visit with the backend's View Page link.
   Maintenance/login plugins can show visitors a different page. The plugin's
   direct link does not override that site setting.

References:
- [Elementor Canvas page layout](https://elementor.com/help/using-elementors-canvas-page-template/)
- [WordPress block metadata](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)
- [WordPress shortcode API](https://developer.wordpress.org/reference/functions/add_shortcode/)
- [WordPress page permalinks](https://developer.wordpress.org/reference/functions/get_permalink/)
- [Elementor template display conditions](https://elementor.com/help/conditions/)
- [Elementor changes do not appear online](https://elementor.com/help/changes-dont-appear-online/)
