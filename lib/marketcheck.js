// lib/marketcheck.js
import axios from 'axios';

const BASE = 'https://api.marketcheck.com/v2';
const KEY  = process.env.NEXT_PUBLIC_MARKETCHECK_API_KEY;

if (!KEY) console.warn('Marketcheck key missing – car values disabled');

export async function getMarketValue({ vin, year, make, model, trim, mileage }) {
  if (!KEY) return null;

  try {
    if (vin) {
      const { data } = await axios.get(`${BASE}/vin/${vin}/stats`, {
        headers: { host: 'marketcheck-prod.apigee.net' },
        params: { api_key: KEY },
      });
      return data;
    }

    const { data } = await axios.get(`${BASE}/stats`, {
      headers: { host: 'marketcheck-prod.apigee.net' },
      params: { api_key: KEY, year, make, model, trim: trim || '', odometer: mileage || '' },
    });
    return data;
  } catch (e) {
    console.error('Marketcheck error', e.message);
    return null;
  }
}