# Next.js DevTools Overlay

## What is the bottom-left menu?

The menu you see in the bottom-left corner (showing "Route", "Bundler", "Route Info", "Preferences") is the **Next.js DevTools overlay**. This is a development-only feature that appears when running `npm run dev`.

### Features:
- **Route**: Shows current route information
- **Bundler**: Displays bundler info (Turbopack in Next.js 16)
- **Route Info**: Detailed route debugging information
- **Preferences**: DevTools settings

## Why is it there?

This overlay helps developers:
- Debug routing issues
- See build information
- Access development tools
- Monitor performance

## How to hide it?

### Option 1: Click the "N" icon
Click the circular icon with "N" at the bottom-left to toggle the overlay on/off.

### Option 2: Disable in next.config.js
Add this to your `next.config.js`:

```js
const nextConfig = {
  // ... other config
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}
```

### Option 3: It won't appear in production
When you build for production (`npm run build`), this overlay will **not appear**. It's only visible in development mode.

## Is it a problem?

**No!** This overlay is completely normal and expected in Next.js development mode. It's a helpful tool for developers and doesn't affect your application's functionality.

## Note

The overlay is part of Next.js 16's new DevTools feature. It's designed to help with development and debugging. You can safely ignore it or toggle it off if it's distracting.
