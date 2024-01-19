import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ViewUserProfile.module.css';

const ViewUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Fetch user profile data from API
    axios
      .get('http://localhost:8000/api/users/1')
      .then(response => {
        setUserProfile(response.data);
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
    </div>
  );
};

export default ViewUserProfile;
