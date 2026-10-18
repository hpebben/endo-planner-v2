# endo-planner-v2

This project contains the source for the Endoplanner WordPress plugin. The code
uses the `@wordpress/scripts` toolchain, so Node.js is required to build the
assets.

## Recommended WordPress page setup

Use `[endoplanner_teaser page_id="123"]` on the main page (replace 123 with the actual Case page ID) and
`[endoplanner layout="workspace"]` on a dedicated full-width Case page.
See [the complete setup guide](docs/wordpress-workspace.md) for Elementor,
navigation, asset loading and preservation of browser-local case data.

## Requirements

- **Node.js**: The build tools support Node.js versions between **14** and
  **19**. Using a newer version (for example Node 22) results in warnings about
  unsupported engines when installing dependencies. Node 18 LTS is recommended.

## Installing dependencies

Run `npm install` from the project root:

```bash
npm install
```

During installation you may see warnings like the following due to the Node
version:

```
npm WARN EBADENGINE Unsupported engine
```

The install will still complete, but using a supported Node version avoids these
warnings.

## Building assets

After the dependencies are installed, build the production assets with:

```bash
npm run build
```

The build may emit warnings from `sass-loader` and Webpack about large bundle
size, which do not prevent the build from finishing.

## Legacy Elementor cleanup checklist (Interventional planning)

This section applies to retained HTML embeds. For the dedicated Case page and
its Start case link, use the shortcode setup above and the workspace guide.

- Remove all Elementor HTML widgets that include `<script>` tags for the intervention UI.
- Keep only the required IDs/classes in the layout:
  - `.endo-device-trigger`
  - `.endo-newcase-trigger`
  - `.endo-summarize-trigger`
  - `#summaryText`, `#summary1`, `#summary2`, `#summary3`
- For the New Case and Summarize buttons, leave the Elementor link field empty (or set to `#`).
  The plugin handles scrolling to `#case` and `#casesummary` to avoid double-handling.

## Elementor snippet

Elementor HTML widgets should contain **markup only** (no inline `<script>` tags). The device UI
logic now lives in `assets/js/device-ui.js`, so Elementor should not bind events or define helper
functions. If a bridge is absolutely required for legacy layouts, keep it to a no-op placeholder
that does not attach behavior. The plugin provides shims for any legacy global functions.

## Verification

The embed checks use PHP 8+ with small WordPress API doubles. They also generate
HTML fixtures for the teaser/workspace browser checks:

```bash
php -l endo-planner.php
php -l includes/page-embeds.php
php tests/wordpress-embeds.php e2e
npm run test:unit
npm run test:e2e
```

The generated `e2e/*-qa.html` / `workspace-markup.html` files are temporary QA
fixtures and are not plugin assets. GitHub CI runs these checks before release.
