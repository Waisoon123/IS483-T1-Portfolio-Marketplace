import * as storageKeys from '../constants/storageKeys.js';

const API_URL = import.meta.env.VITE_API_URL;

export default async function checkAuthentication(callback) {
  const refresh = localStorage.getItem(storageKeys.REFRESH_TOKEN) || null;

  // If there is no refresh token, then the user is not logged in.
  if (!refresh) {
    callback(false);
    return;
  }

  // If user is logged in, then check if the refresh token is valid/has not expired.
  try {
    const response = await fetch(`${API_URL}token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refresh }),
    });

    if (!response.ok) {
      throw new Error('Response not OK');
    }

    const data = await response.json();
    localStorage.setItem(storageKeys.ACCESS_TOKEN, data.access);
    callback(true);
  } catch (error) {
    // If the refresh token is invalid/expired, then remove the refresh and access tokens.
    console.error('Error:', error);
    localStorage.removeItem(storageKeys.ACCESS_TOKEN);
    localStorage.removeItem(storageKeys.REFRESH_TOKEN);
    document.cookie = `${storageKeys.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    callback(false);
  }
}
