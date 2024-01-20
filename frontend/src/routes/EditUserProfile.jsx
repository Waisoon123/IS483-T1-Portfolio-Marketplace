import React, { useEffect, useState } from 'react';
import { Form } from 'react-router-dom';
//to navigate back to viewuserprofile
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useParams } from 'react-router-dom';
//error validation
import { isValidName, isValidEmail, isValidPassword, isValidCompany, isValidInterest } from '../utils/validators';
//css
import styles from './EditUserProfile.module.css';

// fetch user data from API
// display user data in form(placeholder?)
// allow user to edit data
// submit data to API
// successful submission
// redirect to viewuserprofile
// also remember to include link from viewuserprofile to edituserprofile

function EditUserProfile() {

    // fetch user data from API and put it in placeholder(?) in form
    const [values, setValues] = useState({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        interests: '',
        contact_number: '',
        // password: '',
    })
    useEffect(() => {
        axios.get(`http://localhost:8000/api/users/45`)
        .then(res => {
            setValues({...values,id:res.data.id, first_name: res.data.first_name,last_name: res.data.last_name,
                email: res.data.email,company: res.data.company,
                interests: res.data.interests,contact_number: res.data.contact_number });
        })
        .catch(error => console.log(error))
}, [])

    // handleSubmit; error validation then send to API
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.patch(`http://localhost:8000/api/users/45`, values)
        .then(res => {
            console.log(res.data)
        })
        .catch(error => console.log(error))
    }

    return ( 
        <div className='d-flex w-100 vh-100 justify-content-center align-items-center bg'>
            <div className='w-50 border bg-slate-300 text-black p-5'>
                {/* later edit to follow sequencing from sign-up,viewuserprofile */}
            <Form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstname">First Name:</label>
                    <input type="text" id="firstname" name="firstname" placeholder="First Name"
                    value={values.first_name} onChange={e => setValues({...values,first_name:e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="lastname">Last Name:</label>
                    <input type="text" id="lastname" name="lastname" placeholder="Last Name" 
                    value={values.last_name} onChange={e => setValues({...values,last_name:e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email" placeholder="Email" 
                    value={values.email} onChange={e => setValues({...values,email:e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="company">Company:</label>
                    <input type="text" id="company" name="company" placeholder="Company" 
                    value={values.company} onChange={e => setValues({...values,company:e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="interests">Interests:</label>
                    <input type="text" id="interests" name="interests" placeholder="Interests" 
                    value={values.interests} onChange={e => setValues({...values,interests:e.target.value})}/>
                </div>
                {/* to change; follow SignUp.jsx contact number format */}
                <div>
                    <label htmlFor="contactnumber">Contact Number:</label>
                    <input type="text" id="contactnumber" name="contactnumber" placeholder="Contact Number" 
                    value={values.contact_number} onChange={e => setValues({...values,contact_number:e.target.value})}/>
                </div>
                {/* <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Password" />
                </div> */}
                <br />
                <button className='btn btn-info'>Update</button>
            </Form>
            </div>
        </div>
    );
}

export default EditUserProfile;