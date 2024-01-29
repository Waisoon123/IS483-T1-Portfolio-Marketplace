import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './ViewUserProfile.module.css';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';

const API_URL = import.meta.env.VITE_API_URL;

const ViewUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*\=\s*([^;]*).*$)|^.*$/, '$1');

    // Fetch user profile data from API
    fetch(`${API_URL}users/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUserProfile(data);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  }, []);

  console.log(userProfile);
  return (
    <div className={styles.container}>
      {userProfile ? (
        <div>
          <h2 data-testid='fullName'>
            {userProfile.first_name} {userProfile.last_name}
          </h2>
          <p>Email: {userProfile.email}</p>
          <p>Company: {userProfile.company}</p>
          <p>Interests: {userProfile.interests}</p>
          <p>Contact Number: {userProfile.contact_number}</p>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
      <button
        type='submit'
        className='btn btn-info w-50 border bg-slate-300 text-black p-3'
        onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ViewUserProfile;
