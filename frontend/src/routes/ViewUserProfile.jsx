import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../utils/checkAuthentication.js';
import Modal from '../components/Modal.jsx';
import { AuthContext } from '../App.jsx';
import * as fromLabels from '../constants/formLabelTexts.js';
import * as storageKeys from '../constants/storageKeys.js';
import Button from '../components/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

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
        <div className='w-[525px] h-[165px] text-center bg-modalError border-4 border-modalErrorBorder'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'>Unauthorized Access</h3>
          <p>Please Login to Continue</p>
          <hr className='border border-white my-4 w-full' />
          <button className='font-bold text-md' onClick={() => navigate(paths.LOGIN)}>
            Login
          </button>
        </div>
      </Modal>
      <div className='h-[1000px] bg-primary sm:p-8 lg:py-16 lg:px-52'>
        <div className='relative h-[500px]'>
          {/* Background Photo Placeholder */}
          <div className='bg-secondary-100 h-[250px]'></div>
          <div className='w-40 h-40 bg-secondary-200 rounded-full border-2 border-secondary-300 absolute top-1/2 left-32 transform -translate-x-1/2 -translate-y-1/2'></div>
          <div className='bg-white'>
            {userProfile ? (
              <div className='w-full'>
                <div className='flex justify-between'>
                  <h2 className='font-bold font-sans sm:text-xl lg:text-2xl mt-32 ml-16' data-testid='fullName'>
                    {userProfile.first_name} {userProfile.last_name}
                  </h2>
                  <div className='flex items-center'>
                    <p className='mt-32 sm:text-lg lg:text-2xl text-black font-semibold mb-2.5 mr-16'>
                      {userProfile.company}
                    </p>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <p className='text-lg text-gray-700 mb-2.5 ml-16'>{userProfile.email}</p>
                </div>
                <div className='flex flex-wrap space-evenly text-left mb-2.5'>
                  <div>
                    <p className='text-lg text-gray-700 mb-2.5 ml-16'>{userProfile.contact_number}</p>
                  </div>
                </div>
                <div className='flex flex-wrap space-evenly text-left mb-2.5'>
                  <div className='ml-16'>
                    <div className='flex items-center mb-2'>
                      <h2 className='text-xl font-semibold text-secondary-200'>Interests</h2>
                      <FontAwesomeIcon icon={faHeart} className='ml-2 text-secondary-200' />
                    </div>
                    <div className='flex flex-wrap bg-white gap-0'>
                      {Array.isArray(userProfile.interests) ? (
                        userProfile.interests.map((interest, index) => (
                          <div
                            data-testid={interest.name}
                            key={index}
                            className='bg-secondary-200 p-2 text-white mr-2 w-auto rounded-sm'
                          >
                            {interest.name}
                          </div>
                        ))
                      ) : (
                        <div>{userProfile.interests}</div>
                      )}
                    </div>
                    <div className='mt-8 mb-8'>
                      <Button
                        type='submit'
                        className='bg-secondary-100 px-6 py-2 text-black font-sans border-none cursor-pointer rounded-full text-md hover:bg-secondary-300 hover:text-white'
                        onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        type='submit'
                        className='bg-white border-2 border-gray-700 px-6 py-2 cursor-pointer rounded-full text-md ml-4'
                      >
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading user profile...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewUserProfile;
