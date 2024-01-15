import { Link } from 'react-router-dom';

// import { useState } from 'react'
// import  styles from './Navbar.module.css';

function Navbar() {
  // adding the states
  // const [isActive, setIsActive] = useState(false);

  //add the active class
  // const toggleActiveClass = () => {
  //   setIsActive(!isActive);
  // };

  //clean up function to remove the active class
  // const removeActive = () => {
  //   setIsActive(false)
  // }

  return (
    // navbar
    <div className='Navbar'>
      <header className='App-header'>
        <nav className='Navbar-body'>
          <Link to='/' className=''>
            Home
          </Link>
          <Link to='/' className=''>
            Home
          </Link>
          <Link to='/login' className=''>
            Login
          </Link>
          <Link to='/sign-up' className=''>
            Sign Up
          </Link>
        </nav>
      </header>
    </div>
    // <div className="App">
    //   <header className="App-header">

    //     <nav className={`${styles.navbar}`}>

    //       {/* logo */}
    //       <a href='#home' className={`${styles.logo}`}>Dev. </a>

    //       <ul className={`${styles.navMenu} ${isActive ? styles.active : ''}`}>
    //         <li onClick={removeActive}>
    //           <a href='#home' className={`${styles.navLink}`}>Home</a>
    //         </li>
    //         <li onClick={removeActive}>
    //           <a href='#home' className={`${styles.navLink}`}>Catalog</a>
    //         </li>
    //         <li onClick={removeActive}>
    //           <a href='#home' className={`${styles.navLink}`}>All products</a>
    //         </li>
    //         <li onClick={removeActive}>
    //           <a href='#home' className={`${styles.navLink}`}>Contact</a>
    //         </li>
    //       </ul>

    //       <div className={`${styles.hamburger} ${isActive ? styles.active : ''}`}  onClick={toggleActiveClass}>
    //         <span className={`${styles.bar}`}></span>
    //         <span className={`${styles.bar}`}></span>
    //         <span className={`${styles.bar}`}></span>
    //       </div>
    //     </nav>

    //   </header>
    // </div>
  );
}

export default Navbar;
