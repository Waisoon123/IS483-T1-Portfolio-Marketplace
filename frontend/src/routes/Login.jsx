import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import React, { useContext } from 'react';
import { AuthContext } from '../App.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const { handleSubmit, register } = useForm();
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
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
      const userId = responseData.user_id;

      console.log('Access:', accessToken, '\nRefresh:', refreshToken);
      console.log('Form submitted!');

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `userID=${userId}`;
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className='form'>
        <p>
          <label htmlFor=''>Email</label>
          <input type='text' name={formFields.email} data-testid='email-input' {...register('email')}/>
        </p>
        <p>
          <label htmlFor=''>Password</label>
          <input type='password' name={formFields.password} data-testid='password-input' {...register('password')}/>
        </p>
        <button
          type='submit'
          className='inline-block align-baseline border bg-green hover:bg-button-hovergreen text-white font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline'
        >
          Login
        </button>
      </form>
    </>
  );
}
