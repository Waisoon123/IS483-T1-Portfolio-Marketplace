import { useEffect, useState } from 'react';
import CompanyProfileCard from './CompanyProfileCard';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyPanel = ({ filters, searchQuery, isSearching }) => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [semanticSearchLoading, setSemanticSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

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

        // Calculate total pages
        // Assuming each page has 6 items
        setTotalPages(Math.ceil(data.count / 6));
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
    setPage(1);
  }, [filters]);

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

  let startPage, endPage;

  if (page === 1) {
    startPage = 0;
    endPage = Math.min(5, totalPages);
  } else if (page >= totalPages - 4) {
    startPage = Math.max(0, totalPages - 6);
    endPage = totalPages;
  } else {
    startPage = Math.max(0, page - 2);
    endPage = Math.min(page + 3, totalPages);
  }

  return (
    <div className='bg-primary h-full'>
      <div className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4'>
        {companies.map(company => (
          <div key={company.id}>
            <Link to={`/directory/${company.company}`}>
              <CompanyProfileCard company={company} />
            </Link>
          </div>
        ))}
      </div>
      {!isSearching && totalPages > 1 && (
        <div className='flex justify-center items-center mt-12 py-12 space-x-4'>
          <button
            className={`font-sans text-secondary-300 rounded-sm font-bold ${
              page === 1 || isSearching ? '' : 'hover:opacity-65'
            }`}
            onClick={handlePrevious}
            disabled={page === 1 || isSearching}
          >
            {'<'} Prev
          </button>
          {totalPages && totalPages > 0
            ? [...Array(totalPages).keys()].slice(startPage, endPage).map(i => (
                <button
                  key={i}
                  className={`p-3 font-sans text-secondary-300 rounded-sm font-bold ${
                    page === i + 1 ? 'bg-secondary-300 text-white text-sm' : 'border-2 border-secondary-300 text-sm'
                  }`}
                  onClick={() => setPage(i + 1)}
                  disabled={isSearching}
                >
                  {i + 1}
                </button>
              ))
            : null}
          {page <= totalPages - 5 && (
            <>
              <div>...</div>
              <button
                className={`p-3 font-sans text-secondary-300 rounded-sm font-bold ${
                  page === totalPages ? 'bg-secondary-300 text-white text-sm' : 'border-2 border-secondary-300 text-sm'
                }`}
                onClick={() => setPage(totalPages)}
                disabled={isSearching}
              >
                {Number.isInteger(totalPages) ? totalPages : 0}
              </button>
            </>
          )}
          <button
            className={`font-sans text-secondary-300 rounded-sm font-bold ${
              page === totalPages || isSearching ? '' : 'hover:opacity-65'
            }`}
            onClick={handleNext}
            disabled={page === totalPages || isSearching}
          >
            Next {'>'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyPanel;
