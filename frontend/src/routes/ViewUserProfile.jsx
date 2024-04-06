import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/paths.js';
import checkAuthentication from '../utils/checkAuthentication.js';
import Modal from '../components/Modal.jsx';
import { AuthContext } from '../App.jsx';
import * as storageKeys from '../constants/storageKeys.js';
import Button from '../components/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faXmark, faPencilAlt, faBan, faCircleXmark, faTrash} from '@fortawesome/free-solid-svg-icons';
import profilePicturePlaceholder from '../assets/profile_picture_placeholder.jpg';

const API_URL = import.meta.env.VITE_API_URL;

const getCookie = name => {
  const cookieValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return cookieValue ? cookieValue[2] : null;
};

const ViewUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isAlertModalOpen, setIsErrorModalOpen] = useState(false);
  const [isImageErrorModalOpen, setIsImageErrorModalOpen] = useState(false);
  const [isImageRemovalErrorModalOpen, setIsImageRemovalErrorModalOpen] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [imageUpdated, setImageUpdated] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
            setLoading(false); // Set loading to false once data is fetched
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
            setLoading(false); // Set loading to false in case of errors
          });
      } else {
        setIsErrorModalOpen(true);
      }
    });
  }, [navigate, imageUpdated]);

  console.log(userProfile);

  const editProfilePicture = () => {
    const userId = getCookie(storageKeys.USER_ID);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async event => {
      const image = event.target.files[0];

      // Validate the selected file
      if (!image || !image.type.startsWith('image/')) {
        setIsImageErrorModalOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append('profile_pic', image);

      try {
        const response = await fetch(`${API_URL}users/${userId}/`, {
          method: 'PATCH',
          body: formData,
          headers: {
            authorization: `Bearer ${localStorage.getItem(storageKeys.ACCESS_TOKEN)}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          setImageUpdated(prevState => !prevState); // Toggle imageUpdated state to reload user profile and display updated profile picture
        } else {
          setIsImageErrorModalOpen(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
    input.click();
  };

  const removeProfilePicture = async () => {
    const userId = getCookie(storageKeys.USER_ID);
    const formData = new FormData();
    formData.append('profile_pic', '');

    try {
      const response = await fetch(`${API_URL}users/${userId}/`, {
        method: 'PATCH',
        body: formData,
        headers: {
          authorization: `Bearer ${localStorage.getItem(storageKeys.ACCESS_TOKEN)}`,
        },
      });

      if (response.ok) {
        setImageUpdated(prevState => !prevState); // Toggle imageUpdated state to reload user profile and display updated profile picture
      } else {
        setIsImageRemovalErrorModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
    setIsRemovingImage(false);
  };

  return (
    <>
      <Modal isOpen={isAlertModalOpen}>
        <div className='w-[425px] h-[165px] text-center bg-primary border-4 rounded'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'><FontAwesomeIcon className='text-red mr-4' size='xl' icon={faBan} />Unauthorized Access</h3>
          <p>Please Login to Continue</p>
          {/* <hr className='border border-white my-4 w-full' /> */}
          <button className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/3 m-auto mt-3 hover:bg-white hover:text-secondary-200' onClick={() => navigate(paths.LOGIN)}>
            Login
          </button>
        </div>
      </Modal>

      <Modal isOpen={isImageErrorModalOpen}>
        <div className='w-[425px] h-[165px] text-center bg-primary border-4 rounded'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'><FontAwesomeIcon className='text-red mr-4' size='xl' icon={faCircleXmark} />Upload Image Failed</h3>
          <p>Please select an image file or try again</p>
          <button className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/3 m-auto mt-3 hover:bg-white hover:text-secondary-200' onClick={() => setIsImageErrorModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>

      <Modal isOpen={isImageRemovalErrorModalOpen}>
        <div className='w-[425px] h-[165px] text-center bg-primary border-4 rounded'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'><FontAwesomeIcon className='text-red mr-4' size='xl' icon={faCircleXmark} />Image Removal Failed</h3>
          <p>Please try again later</p>
          <button className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 w-1/3 m-auto mt-3 hover:bg-white hover:text-secondary-200' onClick={() => setIsImageRemovalErrorModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>

      <Modal isOpen={isRemovingImage}>
        <div className='w-[525px] h-[165px] text-center bg-primary border-4 rounded'>
          <h3 className='text-xl font-bold mt-6 mb-2.5'><FontAwesomeIcon className='text-secondary-200 mr-4' size='xl' icon={faTrash} />Confirm Removing Profile Picture</h3>
          <p>Are you sure you want to remove your profile picture?</p>
          <div className='flex justify-center space-x-2'>
            <button className='text-secondary-200 bg-white font-bold text-md border-2 rounded-md p-2.5 mt-3 py-2.5 px-4 hover:bg-secondary-200 hover:text-white' onClick={() => setIsRemovingImage(false)}>
              Cancel
            </button>
            <button className='text-white bg-secondary-200 font-bold text-md border-2 rounded-md p-2.5 mt-3 py-2.5 px-4 hover:bg-red hover:text-white' onClick={removeProfilePicture}>
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className='flex flex-col items-center justify-center min-h-screen bg-primary'>
          <div className='animate-spin ease-linear border-4 border-t-4 border-secondary-300 h-12 w-12 mb-4'></div>
          <div className='text-secondary-300'>Loading...</div>
        </div>
      ) : userProfile ? (
        <div className='h-[1000px] bg-primary sm:p-8 lg:py-16 lg:px-52'>
          <div className='relative h-[500px]'>
            <div className='bg-white pt-8'>
              <div className='w-40 h-40 bg-secondary-200 rounded-full border-4 border-secondary-300 ml-16 relative hover:cursor-pointer group'>
                <div
                  className='absolute top-2 right-2 bg-button-hoverred rounded-full p-2 opacity-0 group-hover:opacity-100 flex justify-center items-center'
                  style={{ width: '24px', height: '24px' }}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className='text-white transform transition-transform duration-500 ease-in-out hover:scale-125'
                    onClick={() => setIsRemovingImage(true)}
                    title='Remove profile picture'
                  />
                </div>
                <img
                  src={userProfile.profile_pic ? userProfile.profile_pic : profilePicturePlaceholder}
                  alt='Profile Picture'
                  className='w-full h-full rounded-full object-cover'
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = profilePicturePlaceholder;
                  }}
                />
                <div
                  className='absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-500 bg-black bg-opacity-0 hover:bg-opacity-20 cursor-pointer opacity-0 hover:opacity-100'
                  onClick={editProfilePicture}
                >
                  <FontAwesomeIcon icon={faPencilAlt} className='mr-2 text-white text-xl' />
                  <span className='text-white font-bold'>Edit Image</span>
                </div>
              </div>

              <div className='w-full'>
                <div className='flex justify-between'>
                  <h2 className='font-bold font-sans sm:text-xl lg:text-2xl mt-4 ml-16' data-testid='fullName'>
                    {userProfile.first_name} {userProfile.last_name}
                  </h2>
                  <div className='flex items-center'>
                    <p
                      data-testid='company'
                      className='mt-4 sm:text-lg lg:text-2xl text-black font-semibold mb-2.5 mr-16'
                    >
                      {userProfile.company}
                    </p>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <p data-testid='email' className='text-lg text-gray-700 mb-2.5 ml-16'>
                    {userProfile.email}
                  </p>
                </div>
                <div className='flex flex-wrap space-evenly text-left mb-2.5'>
                  <div>
                    <p data-testid='contact-number' className='text-lg text-gray-700 mb-2.5 ml-16'>
                      {userProfile.contact_number}
                    </p>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ViewUserProfile;
