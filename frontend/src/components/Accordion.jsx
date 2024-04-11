import { useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';

const AccordionSolutions = ({ founders, pricings, customers_partners, products }) => {
  const solutions = [
    {
      id: 1,
      title: 'Product',
      description: products,
    },
    {
      id: 2,
      title: 'Customers and Partners',
      description: customers_partners,
    },
    {
      id: 3,
      title: 'Pricing',
      description: pricings,
    },
    {
      id: 4,
      title: 'Founders',
      description: founders,
    },
  ];

  const [open, setOpen] = useState(solutions[0]?.id);

  return (
    <section className='bg-primary min-h-full h-auto'>
      <div className='max-w-8xl mx-auto'>
        <h3 className='text-2xl font-bold mb-8 text-left'>More Details</h3>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
          {solutions.map((solution, index) => (
            <React.Fragment key={solution.id}>
              <Tab
                title={solution.title}
                isOpen={solution.id === open}
                setOpen={() => setOpen(solution.id)}
                order={index * 2}
              />
              {solution.id === open && <Content description={solution.description} order={index * 2 + 1} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

const Tab = ({ title, isOpen, setOpen, order }) => {
  return (
    <div
      onClick={setOpen}
      className={`rounded-lg p-4 cursor-pointer order-${order} lg:order-0 ${
        isOpen ? 'bg-secondary-100' : 'border-2 border-secondary-300 bg-white'
      }`}
      data-testid={`tab-${title}`}
    >
      <p className={`text-base font-bold ${isOpen ? 'text-secondary-300' : 'text-black'}`}>{title}</p>
    </div>
  );
};

const Content = ({ description, order }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 mt-4 rounded-lg bg-white order-${order} lg:order-1 lg:col-span-4`}
      data-testid={`content-${order}`}
    >
      <p className='text-base font-light text-secondary-300'>{description}</p>
    </motion.div>
  );
};

export default AccordionSolutions;
