/**
 * weather controller
 */

// Do Read Comments

import { factories } from '@strapi/strapi';

const fetch = global.fetch; // Using the global fetch function

export default {
    // I Start by fetching weather info and serve to front-end
  async fetchWeather(ctx) {
    // then I used ctx HTTP helper to get the query parameter from url which in our case is "location"
    const locationParam = ctx.query.location;

    // This makes sure that the location param is a string and remove whitespaces to avoid validation errors.
    if (typeof locationParam !== 'string' || !locationParam.trim()) {
      return ctx.badRequest('location is required');
    }

    const location = locationParam.trim();

    // 1 Check DB for recent record using findMany() method, and sort by fetchedAt timestamp.
    const existing = await strapi.documents('api::weather.weather').findMany({
        filters: { location },
        sort: { fetchedAt: 'desc' },
        limit: 1, // make sure I fetch only the most recent record for the location, if it exists
    });

    // Set the now variable and begin to check for outdated record using fecthedAt timestamp, 
    // if the record is less than 5 minutes old, return it without calling the API. 
    // This helps to reduce unnecessary API calls and improve performance.
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (existing.length && now - new Date(existing[0].fetchedAt).getTime() < FIVE_MINUTES) {
      // Return recent record
      ctx.body = existing[0];
      return;
    }

    // 2 Call OpenWeatherMap API
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return ctx.internalServerError('Missing OpenWeatherMap API key');
    }

    // Use encodeURIComponent to construct the OpenWeatherMap API URL
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      location
    )}&units=metric&appid=${API_KEY}`;


    // begin to fetch and handle API response using await and fetch global 
    let apiResponse: any;
    for (let i = 0; i < 2; i++) {
        try {
            const res = await fetch(url);

            // Throw 400 validataionError
            if (!res.ok) throw new Error(`Status ${res.status}`); 

            // Convert response to JSON
            apiResponse = await res.json();
            break; // success
            } catch (err) {
                // Log error which usually shows in terminal on dev, but on prod it is located in stdOut
                 strapi.log.error(`Attempt ${i + 1} - Weather fetch failed:`, err);

                if (i === 1) {
                // Only return 500 after last attempt
                return ctx.internalServerError('Failed to fetch weather data');
                }
        }
    }
    

    // 3 Normalize data
    // This creates a clean object to store in strapi, 
    // rounds off temp and windSpeed to integers to avoid 400 DB validation errors.
    const recordData = {
      location,
      temperature: Math.round(apiResponse.main.temp),
      condition: apiResponse.weather[0].main,
      humidity: apiResponse.main.humidity,
      windSpeed: Math.round(apiResponse.wind.speed),
      fetchedAt: new Date(),
      publishedAt: new Date(),
    };

    // 4. Save or update record (no duplicates)
    let record: any;
    if (existing.length) {
        // If a recent record exists, just update it, instead of creating a new one
        record = await strapi.documents('api::weather.weather').update({
            documentId: existing[0].documentId,
            data: recordData,
        });

        await strapi.documents('api::weather.weather').publish({
            documentId: record.documentId,
        });
    } else {
        // create new record if there is no existing one
        record = await strapi.documents('api::weather.weather').create({
            data: recordData,
        });

        await strapi.documents('api::weather.weather').publish({
            documentId: record.documentId,
        });
    }

    // Send final weather record as JSON to the client
    ctx.body = record;
   }   
   
};