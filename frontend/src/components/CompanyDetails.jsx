import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
//for email
import Button from '../components/Button.jsx';
import AccordionSolutions from './Accordion.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyDetails = () => {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async url => {
    console.log('url:', url);
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const foundCompany = await response.json();

      if (foundCompany) {
        setCompany(foundCompany);
        setLoading(false);
      } else if (data.next) {
        await fetchCompanies(data.next);
      } else {
        throw new Error('Company not found');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(`${API_URL}companies/?company=${companyName}`);
  }, [companyName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className=' p-10 bg-primary sm:h-full md:h-screen'>
      <div className='flex'>
        <img src={threadohq_logo} className='mr-4' alt='Logo' />
        <div className='flex flex-col justify-center'>
          <h1 className='font-bold text-4xl mb-4'>{company.company}</h1>
          <div className='flex text-secondary-300'>
            <div className='bg-white p-4'>
              <a
                href='https://www.facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='mr-4'
                data-testid='facebook-link'
              >
                <FontAwesomeIcon icon={faFacebook} size='2x' />
              </a>
              <a
                href='https://www.twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='mr-4'
                data-testid='twitter-link'
              >
                <FontAwesomeIcon icon={faTwitter} size='2x' />
              </a>
              <a
                href='https://www.linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='mr-4'
                data-testid='linkedin-link'
              >
                <FontAwesomeIcon icon={faLinkedin} size='2x' />
              </a>
              <a
                href='https://www.whatsapp.com'
                target='_blank'
                rel='noopener noreferrer'
                className='mr-4'
                data-testid='whatsapp-link'
              >
                <FontAwesomeIcon icon={faWhatsapp} size='2x' />
              </a>
              <a
                href={`https://${company.website}`}
                target='_blank'
                rel='noopener noreferrer'
                data-testid='website-link'
              >
                <FontAwesomeIcon icon={faGlobe} size='2x' />
              </a>
            </div>
          </div>
          {/* for email */}
          <div className='pt-4'>
            <Button
              type='submit'
              className='bg-secondary-100 px-6 py-2 text-black font-sans border-black cursor-pointer rounded-full text-md hover:bg-secondary-300 hover:text-white'
              // onClick={() => navigate(paths.EDIT_USER_PROFILE, { state: userProfile })}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <hr className='my-4 w-full border-gray-700 mt-10 mb-10' />
      <p className='text-gray-700 lg:text-lg md:text-md sm-text:md'>{company.description}</p>

      <div className='mt-10 font-bold text-black lg:text-2xl md:text-lg sm:text-lg mx-auto'>
        {/* <Link className='mr-8'>Pricing</Link>
        <Link className='mr-8'>Usage</Link>
        <Link className='mr-8'>Support Information</Link>
        <Link className='mr-8'>Link to AWS/Google Marketplace</Link>
        <Link className='mr-8'>Current customer</Link> */}
        <AccordionSolutions solutions={company.solutions} />
      </div>
    </div>
  );
};

export default CompanyDetails;
