import { useForm } from 'react-hook-form';

export default function Login() {
  const { handleSubmit, register } = useForm();

  const onSubmit = (data) => {
    // Handle form submission logic
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='form'>
      <p>
        <label htmlFor='email'>Email</label>
        <input type='text' name='email' id='email' {...register('email')} />
      </p>
      <p>
        <label htmlFor='password'>Password</label>
        <input type='password' name='password' id='password' {...register('password')} />
      </p>
      <p>
        <button type='submit'>Login</button>
      </p>
    </form>
  );
}
