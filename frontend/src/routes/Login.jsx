import { Form } from 'react-router-dom';

export default function Login() {
  return (
    <Form method='post' className='form'>
      <p>
        <label htmlFor=''>Email</label>
        <input type='text' name='email' />
      </p>
      <p>
        <label htmlFor=''>Password</label>
        <input type='password' name='password' />
      </p>
      <p>
        <button type='submit'>Login</button>
      </p>
    </Form>
  );
}

/* // email 
            // password 
            // confirm password
            first_name 
            last_name
            company
            interest
            contact_number */
