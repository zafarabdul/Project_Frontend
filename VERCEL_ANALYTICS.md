# Vercel Web Analytics Setup

This document describes the Vercel Web Analytics implementation in this Angular project.

## Overview

Vercel Web Analytics is enabled in this project to track page views and user interactions. The implementation uses the `@vercel/analytics` package.

## Implementation Details

### Package Installation

The `@vercel/analytics` package (v1.6.1) is already installed as a dependency in `package.json`:

```json
"@vercel/analytics": "^1.6.1"
```

### Integration

Since Angular is not explicitly supported with a dedicated component in the Vercel Analytics package, we use the generic `inject()` function approach recommended for "other" frameworks.

The analytics script is injected in `src/main.ts` after the application bootstrap:

```typescript
import { inject } from '@vercel/analytics';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Inject Vercel Web Analytics after app bootstrap
    try {
      inject();
    } catch (error) {
      console.error('Failed to inject Vercel Analytics:', error);
    }
  })
  .catch((err) => console.error(err));
```

### Why This Approach?

1. **Timing**: The `inject()` function is called after the app is successfully bootstrapped, ensuring the DOM is ready
2. **Error Handling**: Wrapped in try-catch to prevent analytics failures from breaking the application
3. **Framework Compatibility**: The `inject()` function works with any JavaScript framework, including Angular

### Features

- ✅ Automatic page view tracking
- ✅ Performance metrics collection
- ✅ User navigation tracking
- ⚠️ No automatic route change detection (Angular routing is not specifically supported)

### Enabling Analytics on Vercel

To view analytics data:

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click the **Analytics** tab
4. Click **Enable** if not already enabled

After deployment, analytics data will be available at `/_vercel/insights/*` routes.

### Verification

After deployment, you should see:
- A Fetch/XHR request to `/_vercel/insights/view` in your browser's Network tab when visiting any page
- Analytics data appearing in the Vercel dashboard after a few hours of visitor activity

### Custom Events (Optional)

For Pro and Enterprise plans, you can track custom events:

```typescript
import { track } from '@vercel/analytics';

// Track custom events
track('button_clicked', { button_id: 'subscribe' });
```

### Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Package Documentation](https://vercel.com/docs/analytics/package)
- [Privacy Policy](https://vercel.com/docs/analytics/privacy-policy)
- [Troubleshooting](https://vercel.com/docs/analytics/troubleshooting)

## Notes

- Analytics only tracks data when the application is deployed on Vercel
- Local development will inject the script but won't send data
- The implementation is privacy-focused and GDPR compliant
