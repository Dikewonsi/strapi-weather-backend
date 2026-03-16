/**
 * weather router
 */

import { factories } from '@strapi/strapi';

export default {
    routes: [
        {
            method: 'GET',
            path: '/weather',
            handler: 'weather.findByLocation',
            config: {
                auth:false,
            },
        },
    ],
};