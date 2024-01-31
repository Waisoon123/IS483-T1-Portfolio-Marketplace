import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './ViewUserProfile.module.css';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../constants/checkAuthentication.js';
import Modal from '../components/Modal.jsx';
import { AuthContext } from '../App.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const getCookie = name => {
  const cookieValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return cookieValue ? cookieValue[2] : null;
};

const ViewUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isAlertModalOpen, setIsErrorModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthentication(auth => {
      setIsAuthenticated(auth);
      if (auth) {
        const userId = getCookie('userID');

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
          className='inline-block align-baseline border bg-green hover:bg-button-hovergreen text-white font-bold py-2 px-4 mx-1 rounded focus:outline-none focus:shadow-outline'
          onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
        >
          Edit Profile
        </button>
      </div>
    </>
  );
};

export default ViewUserProfile;
