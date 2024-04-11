import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import companyPlaceholderImage from '../utils/companyPlaceholderImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import notFound from '../assets/data-not-found.png';
//for email
import Button from '../components/Button.jsx';
import AccordionSolutions from './Accordion.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyDetails = () => {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async url => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const foundCompany = await response.json();

      if (foundCompany && foundCompany.results.length > 0) {
        setCompany(foundCompany.results[0]);
        setLoading(false);
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
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='animate-spin ease-linear border-4 border-t-4 border-secondary-300 h-12 w-12 mb-4'></div>
        <div className='text-secondary-300'>Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-primary'>
        <div className='mb-4'>
          <img src={notFound} className='w-64' />
        </div>
        <div className='text-black text-xl font-extrabold mb-4'>Company Not Found</div>
        <div>
          <p className='text-black text-lg mb-4'>
            It seems that the company page has been removed. Please try again in the near future.
          </p>
        </div>
        <Button
          type='submit'
          className='bg-secondary-100 px-6 py-2 text-black font-sans border-black cursor-pointer rounded-full text-md hover:bg-secondary-300 hover:text-white transition duration-300 ease-in-out'
        >
          <Link to='/'>Return to Home</Link>
        </Button>
      </div>
    );
  }

  const email = company.email; // This should be the actual contact email address

  // Construct the email body with structured content
  const body = encodeURIComponent(
    `---\n` + // Separator line
      `This email was sent based on a recommendation from Vertex Holdings.`, // Footer
  );

  const handleContactClick = () => {
    window.location.href = `mailto:${email}?body=${body}`;
  };

  return (
    <div className=' p-10 bg-primary min-h-screen h-auto'>
      <div className='flex'>
        <img src={companyPlaceholderImage(company.company)} className='mr-4' alt='Logo' />
        <div className='flex flex-col justify-center'>
          <h1 className='font-bold text-4xl mb-4'>{company.company}</h1>
          <div className='flex text-secondary-300'>
            <div className='bg-white p-4 rounded-sm'>
              {company.facebook_url && (
                <a
                  href={`${company.facebook_url}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mr-4 hover:opacity-65'
                  data-testid='facebook-link'
                >
                  <FontAwesomeIcon icon={faFacebook} size='2x' />
                </a>
              )}
              {company.twitter_url && (
                <a
                  href={`${company.twitter_url}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mr-4 hover:opacity-65'
                  data-testid='twitter-link'
                >
                  <FontAwesomeIcon icon={faTwitter} size='2x' />
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={`${company.linkedin_url}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mr-4 hover:opacity-65'
                  data-testid='linkedin-link'
                >
                  <FontAwesomeIcon icon={faLinkedin} size='2x' />
                </a>
              )}
              {company.instagram_url && (
                <a
                  href={`${company.instagram_url}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mr-4 hover:opacity-65'
                  data-testid='instagram-link'
                >
                  <FontAwesomeIcon icon={faInstagram} size='2x' />
                </a>
              )}
              <a
                href={`https://${company.website}`}
                target='_blank'
                rel='noopener noreferrer'
                data-testid='website-link'
                className='hover:opacity-65'
              >
                <FontAwesomeIcon icon={faGlobe} size='2x' />
              </a>
            </div>
          </div>
          {/* for email */}
          <div className='pt-4' data-testid='contact-button'>
            <Button
              type='submit'
              className='bg-secondary-100 px-6 py-2 text-black font-sans border-black cursor-pointer rounded-full text-md hover:bg-secondary-300 hover:text-white'
              onClick={handleContactClick}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <hr className='my-4 w-full border-gray-700 mt-10 mb-10' />
      <p className='text-gray-700 lg:text-lg md:text-md sm-text:md'>{company.description}</p>

      <div className='mt-10 font-bold text-black lg:text-2xl md:text-lg sm:text-lg mx-auto'>
        <AccordionSolutions
          founders={company.founders}
          pricings={company.pricings}
          customers_partners={company.customers_partners}
          products={company.products}
        />
      </div>
    </div>
  );
};

export default CompanyDetails;
