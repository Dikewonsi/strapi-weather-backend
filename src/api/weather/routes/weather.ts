/**
 * weather router
 */

import { factories } from '@strapi/strapi';

export default {
    routes: [
        {
            method: 'GET',
            path: '/weather/fetch',
            handler: 'weather.fetchWeather',
            config: {
                auth: false,
            },
        }
    ],
};