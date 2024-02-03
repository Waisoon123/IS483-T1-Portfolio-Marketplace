import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './ViewUserProfile.module.css';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../utils/checkAuthentication.js';
import Modal from '../components/Modal.jsx';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelsText.js';
import * as storageKeys from '../constants/storageKeys.js';

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
        const userId = getCookie(storageKeys.USER_ID);

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
            <div className={styles.profileHeader}>
              <div className={styles.profilePicture}></div>
              <h2 className={styles.fullname} data-testid='fullName'>
                {userProfile.first_name} {userProfile.last_name}
              </h2>
            </div>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <p className={styles.title}>{fromLabels.EMAIL}</p>
                <p className={styles.info}>{userProfile.email}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.title}>{fromLabels.COMPANY}</p>
                <p className={styles.info}>{userProfile.company}</p>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <p className={styles.title}>{fromLabels.INTERESTS}</p>
                <p className={styles.info}>{userProfile.interests}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.title}>{fromLabels.CONTACT_NUMBER}</p>
                <p className={styles.info}>{userProfile.contact_number}</p>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <button
                type='submit'
                className={styles.editButton}
                onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <p>Loading user profile...</p>
        )}
      </div>
    </>
  );
};

export default ViewUserProfile;
