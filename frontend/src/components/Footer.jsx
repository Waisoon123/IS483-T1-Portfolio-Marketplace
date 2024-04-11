import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/Vertex_holdings_logo-bg.png';

function Footer() {
  return (
    <footer className='bg-secondary-200 text-white' data-testid='footer'>
      <div className='container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8'>
        <div className='mb-6 md:mb-0'>
          <img src={logo} alt='Vertex Holdings Logo' className='mb-4' />
          <p className='text-white text-sm'>
            The Vertex global network of venture capital funds comprises Vertex Ventures, Vertex Ventures HC and Vertex
            Growth. With funds based across innovation hubs in China, Israel, Southeast Asia and India, and the US, we
            create a unique platform for portfolio companies to realize their full potential by leveraging the combined
            experience and resources of our extensive network of global partners.
          </p>
        </div>
        <div className='mb-6 md:mb-0'>
          <h5 className='uppercase mb-2 font-bold'>Entities</h5>
          <a
            href='https://www.vertexgrowth.com/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vgf-link'
          >
            Vertex Growth (VGF)
          </a>
          <a
            href='https://www.vertexventures.cn/en/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vvcn-link'
          >
            Vertex Ventures China (VVCN)
          </a>
          <a
            href='https://www.vertexventureshc.com/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vvhc-link'
          >
            Vertex Ventures HC (VVHC)
          </a>
          <a
            href='https://www.vertexventures.co.il/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vvil-link'
          >
            Vertex Ventures Israel (VVIL)
          </a>
          <a
            href='https://www.vertexventures.sg/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vvsea-link'
          >
            Vertex Ventures SEA & India (VVSEAI)
          </a>
          <a
            href='https://vvus.com/'
            className='block mb-2 text-sm'
            target='_blank'
            rel='noopener noreferrer'
            data-testid='vvus-link'
          >
            Vertex Ventures US (VVUS)
          </a>
        </div>
        <div className='mb-6 md:mb-0'>
          <h5 className='uppercase mb-2 font-bold'>Quick Links</h5>
          <Link to='' className='block mb-2 text-sm' data-testid='footer-home'>
            Home
          </Link>
          <Link to='/directory' className='block mb-2 text-sm' data-testid='footer-directory'>
            Directory
          </Link>
        </div>
        <div className='mb-6 md:mb-0'>
          <h5 className='uppercase mb-2 font-bold'>Contact Us</h5>
          <p className='text-white mb-4 text-sm'>250 North Bridge Road #11-01, Raffles City Tower Singapore 179101</p>
          <p className='text-white mb-4 text-sm'>TEL +65 6828 8088</p>
          <p className='text-white mb-4 text-sm'>FAX +65 6828 8090</p>
          <div className='flex mt-4'>
            <a href='https://www.facebook.com/vertexholdingsjapan/' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faFacebook} className='mr-2' />
            </a>
            <a href='https://www.linkedin.com/company/vertex-holdings' target='_blank' rel='noopener noreferrer'>
              <FontAwesomeIcon icon={faLinkedin} className='mr-2' />
            </a>
            <a href='mailto:communications@vertexholdings.com'>
              <FontAwesomeIcon icon={faEnvelope} className='mr-2' />
            </a>
          </div>
        </div>
      </div>
      <div className='border-t border-white pt-4 text-white text-center text-xs'>
        © 2019 by Vertex Holdings. All rights reserved. Legal
      </div>
    </footer>
  );
}

export default Footer;
