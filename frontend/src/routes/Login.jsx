import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import Modal from '../components/Modal';
import * as fromLabels from '../constants/formLabelTexts.js';
import Button from '../components/Button.jsx';
import video from '../assets/Dots_Video_Vertex.mp4';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
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
        const interests = responseData.interests;

        console.log('Access:', accessToken, '\nRefresh:', refreshToken);
        console.log('Form submitted!');

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('interests', interests);
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
        <div
          className='w-[525px] h-[165px] text-center bg-modalError border-4 border-modalErrorBorder'
          data-testid='error-modal'
        >
          <h3 className='text-xl font-bold mt-6 mb-2.5'>Wrong Credentials</h3>
          <p>Invalid username or password. Please try again.</p>
          <hr className='border border-white my-4 w-full' />
          <button
            className='font-bold text-md'
            onClick={() => {
              setIsErrorModalOpen(false);
              setValue(formFields.password, '');
            }}
          >
            Close
          </button>
        </div>
      </Modal>
      <div className='grid place-items-center h-screen bg-primary sm:p-8 md:p-12 lg:py-16 lg:px-44'>
        <div className='flex h-full w-4/5'>
          <div className='w-1/2 h-full flex'>
            <video width='100%' height='100%' autoPlay loop style={{ objectFit: 'cover', objectPosition: 'center' }}>
              <source src={video} type='video/mp4' />
            </video>
          </div>
          <div className='w-1/2 bg-white lg:px-20 lg:py-12 sm:px-4 sm:py-4'>
            <form onSubmit={handleSubmit(handleLogin)} className=''>
              <h1 className='mt-16 text-4xl font-semibold font-sans sm:text-md'>Welcome Back</h1>
              <div className='mt-16 sm:mt-8'>
                <label className='sr-only' htmlFor={formFields.email}>
                  {fromLabels.EMAIL}
                </label>
                <input
                  type='text'
                  className='w-full p-2.5 border border-secondary-300 mt-2.5 rounded-sm sm:text-sm lg:text-md'
                  name={formFields.email}
                  placeholder='Email'
                  id={formFields.email}
                  {...register(formFields.email, { required: true })}
                />
                {errors[formFields.email] && <p className='mt-2.5 font-medium text-sm text-red'>Email is required.</p>}
              </div>
              <div className='mt-4 mb-4 relative'>
                <label className='sr-only' htmlFor={formFields.password}>
                  {fromLabels.PASSWORD}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='w-full p-2.5 border border-secondary-300 mt-2.5 rounded-sm sm:text-sm lg:text-md'
                  name={formFields.password}
                  placeholder='Password'
                  id={formFields.password}
                  {...register(formFields.password, { required: true })}
                />
                <div
                  className='absolute inset-y-0 right-0 top-2 pr-3 flex items-center cursor-pointer'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FontAwesomeIcon icon={faEyeSlash} className='text-secondary-200' />
                  ) : (
                    <FontAwesomeIcon icon={faEye} className='text-secondary-200' />
                  )}
                </div>
                {errors[formFields.password] && (
                  <p className='mt-2.5 font-medium text-sm text-red'>Password is required.</p>
                )}
              </div>
              <div className='flex sm:block lg:flex justify-between mb-4'>
                <label className='flex items-center text-sm sm:mb-2'>
                  <input type='checkbox' className='mr-2' />
                  Remember me
                </label>
                <a href='/forgot-password' className='text-secondary-300 text-sm sm:text-xs'>
                  Forgot your password?
                </a>
              </div>
              <Button
                type='submit'
                className='w-full p-2.5 bg-secondary-100 rounded-sm text-black text-md font-bold sm:text-sm'
              >
                Login
              </Button>
              <div className='mb-24'>
                <p className='mt-4 text-center text-black sm:text-sm'>
                  Don&apos;t have an account?{' '}
                  <Link to='/sign-up' className='font-bold text-black underline sm:text-sm'>
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
