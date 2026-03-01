import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject } from '@vercel/analytics';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Inject Vercel Web Analytics after app bootstrap
    // This tracks page views and user interactions
    // For more info: https://vercel.com/docs/analytics
    try {
      inject();
    } catch (error) {
      console.error('Failed to inject Vercel Analytics:', error);
    }
  })
  .catch((err) => console.error(err));
