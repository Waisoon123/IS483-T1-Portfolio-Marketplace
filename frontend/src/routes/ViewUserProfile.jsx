import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './ViewUserProfile.module.css';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../constants/checkAuthentication.js';
import Modal from '../components/Modal.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const ViewUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAlertModalOpen, setIsErrorModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthentication(auth => {
      setIsAuthenticated(auth);
      if (auth) {
        const userId = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        // Fetch user profile data from API
        axios
          .get(`${API_URL}users/${userId}`)
          .then(response => {
            setUserProfile(response.data);
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
          });
      } else {
        setIsErrorModalOpen(true);
      }
    });
  }, [navigate]);

  console.log(userProfile);

  return (
    <>
      <Modal isOpen={isAlertModalOpen}>
        <div>
          <p>Please Login to Continue</p>
          <button onClick={() => navigate(paths.LOGIN)}>Login</button>
        </div>
      </Modal>
      <div className={styles.container}>
        {userProfile ? (
          <div>
            <h2>
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
    </>
  );
};

export default ViewUserProfile;
