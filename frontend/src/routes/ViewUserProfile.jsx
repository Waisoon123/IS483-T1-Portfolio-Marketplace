import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../utils/checkAuthentication.js';
import Modal from '../components/Modal.jsx';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelTexts.js';
import * as storageKeys from '../constants/storageKeys.js';
import Button from '../components/Button.jsx';

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

  useEffect(() => {
    checkAuthentication(auth => {
      setIsAuthenticated(auth);
      if (auth) {
        const userId = getCookie(storageKeys.USER_ID);

        // Fetch user profile data from API
        fetch(`${API_URL}users/${userId}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem(storageKeys.ACCESS_TOKEN)}`,
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (Array.isArray(data.interests)) {
              const formattedInterests = data.interests.map(interest => ({
                id: interest.id,
                name: interest.name,
              }));
              setUserProfile({ ...data, interests: formattedInterests });
            } else {
              // Handle case where interests data is not an array
              console.error('Interests data is not an array:', data.interests);
            }
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
      <div className='bg-primary flex flex-col h-screen width-[600px] items-center p-16'>
        {userProfile ? (
          <div className='w-[500px] mx-auto h-screen'>
            <div className='flex items-center justify-center mb-8'>
              <div className='w-20 h-20 bg-secondary-300 rounded-full mr-10'></div>
              <h2 className='font-bold text-2xl' data-testid='fullName'>
                {userProfile.first_name} {userProfile.last_name}
              </h2>
            </div>
            <div className='flex flex-wrap space-evenly text-left mb-2.5'>
              <div>
                <p className='font-bold text-lg'>{fromLabels.EMAIL}</p>
                <p className='p-2 text-sm bg-white w-[500px] rounded-sm border border-secondary-300 h-[40px] text-gray-700 italic mb-2.5'>
                  {userProfile.email}
                </p>
              </div>
              <div>
                <p className='font-bold text-lg'>{fromLabels.COMPANY}</p>
                <p className='p-2 text-sm bg-white w-[500px] rounded-sm border border-secondary-300 h-[40px] text-gray-700 italic mb-2.5'>
                  {userProfile.company}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap space-evenly text-left mb-2.5'>
              <div>
                <p className='font-bold text-lg'>{fromLabels.INTERESTS}</p>
                {/* <p className={styles.info}>{userProfile.interests}</p> */}
                <div className='flex flex-wrap w-[500px] bg-white gap-0'>
                  {Array.isArray(userProfile.interests) ? (
                    userProfile.interests.map((interest, index) => (
                      <div
                        data-testid={interest.name}
                        key={index}
                        className='bg-secondary-300 p-2 text-white m-2 w-auto rounded-sm'
                      >
                        {interest.name}
                      </div>
                    ))
                  ) : (
                    <div>{userProfile.interests}</div>
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-wrap space-evenly text-left mb-2.5'>
              <div>
                <p className='font-bold text-lg'>{fromLabels.CONTACT_NUMBER}</p>
                <p className='p-2 text-sm bg-white w-[500px] rounded-sm border border-secondary-300 h-[40px] text-gray-700 italic mb-2.5'>
                  {userProfile.contact_number}
                </p>
              </div>
            </div>
            <div>
              <Button
                type='submit'
                className='bg-secondary-300 text-white border-none cursor-pointer w-[500px] p-2 text-md hover:bg-button-hoverUpdate'
                onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
              >
                Edit Profile
              </Button>
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
