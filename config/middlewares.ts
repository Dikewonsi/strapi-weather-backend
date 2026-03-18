import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',

  {
      name: 'strapi::cors',
      config: {
        origin: [
          'http://localhost:5173',              // local Vite dev
          'https://strapi-weather-frontend.vercel.app',   // production frontend
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    },
  
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
