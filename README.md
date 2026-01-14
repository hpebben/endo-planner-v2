# endo-planner-v2

This project contains the source for the Endoplanner WordPress plugin. The code
uses the `@wordpress/scripts` toolchain, so Node.js is required to build the
assets.

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

## Elementor cleanup checklist (Interventional planning)

- Remove all Elementor HTML widgets that include `<script>` tags for the intervention UI.
- Keep only the required IDs/classes in the layout:
  - `.endo-device-trigger`
  - `.endo-newcase-trigger`
  - `.endo-summarize-trigger`
  - `#summaryText`, `#summary1`, `#summary2`, `#summary3`

## Elementor snippet

Elementor HTML widgets should contain **markup only** (no inline `<script>` tags). The device UI
logic now lives in `assets/js/device-ui.js`, so Elementor should not bind events or define helper
functions. If a bridge is absolutely required for legacy layouts, keep it to a no-op placeholder
that does not attach behavior. The plugin provides shims for any legacy global functions.
