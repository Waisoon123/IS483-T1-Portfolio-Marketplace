import { useLocation } from 'react-router-dom';
import React from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const location = useLocation();
  const alert = location.state?.alert || false;

  const formFields = {
    email: 'email',
    password: 'password',
  };

  if (alert) {
    setIsErrorModalOpen(true);
  }

  const handleLogin = async event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const email = data.get(formFields.email);
    const password = data.get(formFields.password);
    console.log(email, password);

    try {
      const response = await fetch(`${API_URL}login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [formFields.email]: email,
          [formFields.password]: password,
        }),
      });
      const responseData = await response.json();
      const refreshToken = responseData.refresh;
      const accessToken = responseData.access;

      console.log('Access:', accessToken, '\nRefresh:', refreshToken);
      console.log('Form submitted!');

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className='form'>
        <p>
          <label htmlFor=''>Email</label>
          <input type='text' name={formFields.email} />
        </p>
        <p>
          <label htmlFor=''>Password</label>
          <input type='password' name={formFields.password} />
        </p>
        <button type='submit' className='btn btn-info w-50 border bg-emerald-600 text-white p-3'>
          Login
        </button>
      </form>
    </>
  );
}
