import React, { useEffect, useState } from 'react';
import { Form } from 'react-router-dom';
//to navigate back to viewuserprofile
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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

    return ( 
        <div className='d-flex w-100 vh-100 justify-content-center align-items-center'>
            <div className='w-50 border bg-secondary text-white p-5'>
                {/* later edit to follow sequencing from sign-up,viewuserprofile */}
            <Form>
                <div>
                    <label htmlFor="firstname">First Name:</label>
                    <input type="text" id="firstname" name="firstname" placeholder="First Name" />
                </div>
                <div>
                    <label htmlFor="lastname">Last Name:</label>
                    <input type="text" id="lastname" name="lastname" placeholder="Last Name" />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email" placeholder="Email" />
                </div>
                <div>
                    <label htmlFor="company">Company:</label>
                    <input type="text" id="company" name="company" placeholder="Company" />
                </div>
                <div>
                    <label htmlFor="interests">Interests:</label>
                    <input type="text" id="interests" name="interests" placeholder="Interests" />
                </div>
                {/* to change; follow SignUp.jsx contact number format */}
                <div>
                    <label htmlFor="contactnumber">Contact Number:</label>
                    <input type="text" id="contactnumber" name="contactnumber" placeholder="Contact Number" />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Password" />
                </div>
                <br />
                <button className='btn btn-info'>Update</button>
            </Form>
            </div>
        </div>
    );
}

export default EditUserProfile;