import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import React from 'react';

const AccordionSolutions = () => {
  const [open, setOpen] = useState(solutions[0].id);

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
              {solution.id === open && <Content {...solution} order={index * 2 + 1} />}
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
    >
      <p className='text-base font-light text-secondary-300'>{description}</p>
      {/* <motion.button className='mt-4 rounded-md flex items-center justify-center gap-1 text-secondary-300'>
        <span className='text-base'>Learn more</span>
        <FontAwesomeIcon icon={faArrowRight} className='transition-transform duration-300' />
      </motion.button> */}
    </motion.div>
  );
};

export default AccordionSolutions;

const solutions = [
  {
    id: 1,
    title: 'Product',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  {
    id: 2,
    title: 'Customers and Partners',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  {
    id: 3,
    title: 'Pricing',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  {
    id: 4,
    title: 'Founders',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
];
