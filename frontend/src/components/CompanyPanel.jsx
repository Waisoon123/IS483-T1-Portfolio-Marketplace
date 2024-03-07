import { useEffect, useState } from 'react';
import CompanyProfileCard from './CompanyProfileCard';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyPanel = ({ filters, searchQuery, isSearching }) => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);

  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);

      if (filters) {
        filters.sectors.forEach(sector => queryParams.append('tech_sectors', sector));
        filters.countries.forEach(country => queryParams.append('hq_main_offices', country));
      }

      let apiUrl = `${API_URL}companies/?${queryParams.toString()}`;

      // Retrieve searchResults from local storage
      const searchResults = JSON.parse(localStorage.getItem('searchResults')) || [];

      let companiesData = [];

      // If searchResults is provided, fetch each company individually
      if (searchResults.length > 0) {
        for (let i = 0; i < searchResults.length; i++) {
          const companyApiUrl = `${API_URL}companies/?company=${encodeURIComponent(
            searchResults[i],
          )}&${queryParams.toString()}`;

          const response = await fetch(companyApiUrl);
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }

          const data = await response.json();
          companiesData.push(...data.results);
        }
      } else {
        // Fetch all companies if no searchResults is provided
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        companiesData = data.results;
      }

      setCompanies(companiesData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setSemanticSearchLoading(true);
      fetch(`${API_URL}semantic-search-portfolio-companies/?query=${encodeURIComponent(searchQuery)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          localStorage.setItem('searchResults', JSON.stringify(data.company));
          setSemanticSearchLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setSemanticSearchLoading(false);
        });
    } else {
      // If searchQuery is empty, clear searchResults in local storage and fetch all companies
      localStorage.removeItem('searchResults');
      fetchCompanies();
    }
  }, [searchQuery]);

  useEffect(() => {
    const searchResults = JSON.parse(localStorage.getItem('searchResults')) || [];
    if (searchResults.length > 0 || !searchQuery) {
      fetchCompanies(page);
    }
  }, [page, filters, localStorage.getItem('searchResults')]);

  const handleNext = () => {
    setPage(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading || semanticSearchLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className='animate-spin ease-linear border-4 border-t-4 border-secondary-300 h-12 w-12 mb-4'></div>
        <div className='text-secondary-300'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='bg-primary h-screen'>
      <div className='py-8 grid md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 gap-2 justify-items-center items-stretch'>
        {companies.map(company => (
          <div key={company.id}>
            <Link to={`/directory/${company.company}`}>
              <CompanyProfileCard company={company} />
            </Link>
          </div>
        ))}
      </div>
      <div className='flex justify-center items-center mt-20 space-x-4'>
        <button
          className='bg-secondary-200 p-2 font-sans text-white rounded-sm font-bold'
          onClick={handlePrevious}
          disabled={page === 1 || isSearching}
        >
          Previous
        </button>
        <button
          className='bg-secondary-200 p-2 font-sans text-white rounded-sm font-bold'
          onClick={handleNext}
          disabled={isSearching}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CompanyPanel;
