import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 🔧 Polyfills para librerías que esperan entorno Node en el navegador
(window as any).global = window;
(window as any).process = { env: { NODE_ENV: 'development' } };

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
