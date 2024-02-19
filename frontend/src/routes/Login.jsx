import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import Modal from '../components/Modal';
import * as fromLabels from '../constants/formLabelTexts.js';
import Button from '../components/Button.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const {
    handleSubmit,
    setValue,
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
          <button
            onClick={() => {
              setIsErrorModalOpen(false);
              setValue(formFields.password, '');
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <div className='fixed inset-0 bg-black bg-opacity-50 z-10'></div>
      <form
        onSubmit={handleSubmit(handleLogin)}
        className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 mt-5 bg-primary p-8 rounded-lg h-[500px]'
      >
        <h1 className='text-2xl text-center mb-5 mt-16'>Welcome !</h1>
        <div>
          <label className='sr-only' htmlFor={formFields.email}>
            {fromLabels.EMAIL}
          </label>
          <input
            type='text'
            className='w-[500px] h-10 pl-2.5 border border-secondary-300 mt-2.5 rounded-sm'
            name={formFields.email}
            placeholder='Email'
            id={formFields.email}
            {...register(formFields.email, { required: true })}
          />
          {errors[formFields.email] && <p className='mt-2.5 font-medium text-sm text-red'>Email is required.</p>}
        </div>
        <div>
          <label className='sr-only' htmlFor={formFields.password}>
            {fromLabels.PASSWORD}
          </label>
          <input
            type='password'
            className='w-[500px] h-10 pl-2.5 border border-secondary-300 mt-2.5 rounded-sm'
            name={formFields.password}
            placeholder='Password'
            id={formFields.password}
            {...register(formFields.password, { required: true })}
          />
          {errors[formFields.password] && <p className='mt-2.5 font-medium text-sm text-red'>Password is required.</p>}
        </div>
        <Button
          type='submit'
          className='w-[500px] h-10 mt-2.5 border-2 border-secondary-300 rounded-sm text-secondary-300 shadow-md hover:bg-secondary-300 hover:text-primary text-md font-bold'
        >
          Login
        </Button>
      </form>
    </>
  );
}
