const API_URL = import.meta.env.VITE_API_URL;

export default function checkAuthentication(callback) {
  const refresh = localStorage.getItem('refreshToken');

  if (!refresh) {
    callback(false);
  } else {
    fetch(API_URL + 'token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refresh }),
    })
      .then(response => {
        if (!response.ok) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          callback(false);
        } else {
          return response.json();
        }
      })
      .then(data => {
        try {
          localStorage.setItem('accessToken', data.access);
          callback(true);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          callback(false);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        callback(false);
      });
  }
}
