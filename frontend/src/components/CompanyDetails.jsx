import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyDetails = () => {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = url => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const foundCompany = data.results.find(comp => comp.company === companyName);
        if (foundCompany) {
          setCompany(foundCompany);
          setLoading(false);
        } else if (data.next) {
          fetchCompanies(data.next);
        } else {
          throw new Error('Company not found');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies(`${API_URL}companies/`);
  }, [companyName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className=' p-10 bg-primary'>
      <div className='flex'>
        <img src={threadohq_logo} className='mr-4' alt='Logo' />
        <div className='flex flex-col justify-center'>
          <h1 className='font-bold text-4xl mb-4'>{company.company}</h1>
          <div className='bg-white p-4 rounded flex justify-between text-secondary-300 w-1/3'>
            <a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faFacebook} size='2x' />
            </a>
            <a href='https://www.twitter.com' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faTwitter} size='2x' />
            </a>
            <a href='https://www.linkedin.com' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faLinkedin} size='2x' />
            </a>
            <a href='https://www.whatsapp.com' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faWhatsapp} size='2x' />
            </a>
            <a href='https://www.instagram.com' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faInstagram} size='2x' />
            </a>
          </div>
        </div>
      </div>
      <hr className='my-4 w-full border-gray-700 mt-10 mb-10' />
      <p className='text-gray-700'>{company.description}</p>
    </div>
  );
};

export default CompanyDetails;
