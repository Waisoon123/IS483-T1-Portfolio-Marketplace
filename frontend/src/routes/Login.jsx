import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import styles from './Login.module.css';
import Modal from '../components/Modal';
import * as fromLabels from '../constants/formLabelsText.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
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

  const handleLogin = async data => {
    const email = data[formFields.email];
    const password = data[formFields.password];
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

      if (!response.ok) {
        setIsErrorModalOpen(true);
        console.log('Error logging in:', error);
      } else {
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Modal isOpen={isErrorModalOpen}>
        <div data-testid='error-modal'>
          <p>Error Logging in. Email or Password incorrect.</p>
          <button onClick={() => setIsErrorModalOpen(false)}>Close</button>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(handleLogin)} className={styles.form}>
        <div>
          <label className={styles.hidden} htmlFor={formFields.email}>
            {fromLabels.EMAIL}
          </label>
          <input
            type='text'
            className={styles.input}
            name={formFields.email}
            placeholder='Email'
            id={formFields.email}
            {...register(formFields.email, { required: true })}
          />
          {errors[formFields.email] && <p className={styles.errorMsg}>Email is required.</p>}
        </div>
        <div>
          <label className={styles.hidden} htmlFor={formFields.password}>
            {fromLabels.PASSWORD}
          </label>
          <input
            type='password'
            className={styles.input}
            name={formFields.password}
            placeholder='Password'
            id={formFields.password}
            {...register(formFields.password, { required: true })}
          />
          {errors[formFields.password] && <p className={styles.errorMsg}>Password is required.</p>}
        </div>
        <button type='submit' className={styles.button}>
          Login
        </button>
      </form>
    </>
  );
}
