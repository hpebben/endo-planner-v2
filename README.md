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
