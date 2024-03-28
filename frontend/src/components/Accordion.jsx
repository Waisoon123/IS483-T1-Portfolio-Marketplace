import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const AccordionSolutions = () => {
  const [open, setOpen] = useState(solutions[0].id);
  return (
    <section className='bg-primary h-full'>
      <div className='w-full max-w-8xl mx-auto h-full'>
        <h3 className='text-2xl font-bold mb-8'>More Details</h3>
        <div className='flex flex-col lg:flex-row gap-2'>
          {solutions.map(q => {
            return <Solution {...q} key={q.id} open={open} setOpen={setOpen} index={q.id} />;
          })}
        </div>
      </div>
    </section>
  );
};

const Solution = ({ title, description, index, open, setOpen }) => {
  const isOpen = index === open;

  return (
    <div onClick={() => setOpen(index)} className='p-0.5 rounded-lg relative overflow-hidden cursor-pointer'>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : '72px',
        }}
        className='p-6 rounded-[7px] bg-white flex flex-col justify-between relative z-20'
      >
        <div>
          <motion.p
            initial={false}
            animate={{
              color: isOpen ? 'black' : '',
            }}
            className='text-base font-medium w-fit bg-gradient-to-r text-secondary-300 bg-clip-text'
          >
            {title}
          </motion.p>
          <motion.p
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
            }}
            className='mt-4 bg-gradient-to-r bg-clip-text text-secondary-300 text-base font-light'
          >
            {description}
          </motion.p>
        </div>
        <motion.button
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          className='-ml-6 -mr-6 -mb-6 mt-4 py-2 rounded-b-md flex items-center justify-center gap-1 group transition-[gap] bg-gradient-to-r from-secondary-300 to-secondary-200 text-white'
        >
          <span className='text-base'>Learn more</span>
          <FontAwesomeIcon icon={faArrowRight} className='group-hover:translate-x-1 transition-transform' />
        </motion.button>
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
        }}
        className='absolute inset-0 z-10 bg-gradient-to-r from-secondary-300 to-secondary-200'
      />
      <div className='absolute inset-0 z-0 mb-20' />
    </div>
  );
};

export default AccordionSolutions;

const solutions = [
  {
    id: 1,
    title: 'Product',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos laudantium in iusto iure aliquam commodi possimus eaque sit recusandae incidunt?',
  },
  {
    id: 2,
    title: 'Customers and Partners',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos laudantium in iusto iure aliquam commodi possimus eaque sit recusandae incidunt?',
  },
  {
    id: 3,
    title: 'Pricing',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos laudantium in iusto iure aliquam commodi possimus eaque sit recusandae incidunt?',
  },
  {
    id: 4,
    title: 'Founders',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos laudantium in iusto iure aliquam commodi possimus eaque sit recusandae incidunt?',
  },
];
