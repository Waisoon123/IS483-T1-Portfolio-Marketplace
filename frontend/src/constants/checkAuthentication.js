const API_URL = import.meta.env.VITE_API_URL;

export default async function checkAuthentication(callback) {
  const refresh = localStorage.getItem('refreshToken');

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
    localStorage.setItem('accessToken', data.access);
    callback(true);
  } catch (error) {
    // If the refresh token is invalid/expired, then remove the refresh and access tokens.
    console.error('Error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    callback(false);
  }
}
