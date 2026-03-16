/**
 * weather controller
 */

import { factories } from '@strapi/strapi';

export default {
  async findByLocation(ctx) {
    const locationParam = ctx.query.location;

    if (typeof locationParam !== 'string' || !locationParam.trim()) {
      return ctx.badRequest('location is required');
    }

    const location = locationParam.trim();

    const records = await strapi.entityService.findMany(
      'api::weather.weather',
      {
        filters: { location },
        sort: { fetchedAt: 'desc' },
        limit: 1,
      }
    );

    if (!records.length) {
      return ctx.notFound('No weather data found for this location');
    }

    // ✅ NEVER null
    ctx.body = records[0];
  },
};