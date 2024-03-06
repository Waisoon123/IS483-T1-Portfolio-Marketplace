import React from 'react';
import { AuthContext } from '../App.jsx';
import { render } from '@testing-library/react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import checkAuthentication from '../utils/checkAuthentication';
import fetchMock from 'fetch-mock';
import * as storageKeys from '../constants/storageKeys.js';

const API_URL = import.meta.env.VITE_API_URL;

export const renderWithAuthContext = (
  routes,
  initialEntries = ['/'],
  // initialPage,
  isAuthenticated,
) => {
  if (isAuthenticated) {
    let originalCheckAuthentication;
    let localStorageMock;
    let setIsAuthenticated;

    originalCheckAuthentication = checkAuthentication.checkAuthentication;
    checkAuthentication.checkAuthentication = () => Promise.resolve(true);
    localStorageMock = (function () {
      let store = {};
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value;
        },
        removeItem: function (key) {
          delete store[key];
        },
        clear: function () {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    fetchMock.reset();

    fetchMock.get(API_URL + 'users/63', () => {
      const profile = {
        id: 63,
        first_name: 'test',
        last_name: 'ing',
        email: '6@email.com',
        company: 'smu',
        interests: [
          {
            id: 1,
            name: 'fintech',
          },
        ],
        contact_number: '+65 9129 9999',
      };

      console.log('Fetched profile:', profile);

      return {
        status: 200,
        body: JSON.stringify(profile),
      };
    });

    fetchMock.patchOnce(API_URL + 'users/63/', () => {
      return {
        status: 200,
        body: JSON.stringify({
          id: 63,
          first_name: 'newFirstName',
          last_name: 'newLastName',
          email: 'newtestemail@test.com',
          company: 'newCompany',
          interests: [
            {
              id: 2,
              name: 'BA',
            },
          ],
          contact_number: '+65 9111 1111',
        }),
      };
    });

    // Mock document.cookie to return a specific user ID
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `${storageKeys.USER_ID}=63`,
    });

    localStorage.setItem('refreshToken', 'mockRefreshToken');

    fetchMock.post(`${API_URL}token/refresh/`, {
      ok: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        access: 'mockAccessToken',
      },
    });

    isAuthenticated = true;
    setIsAuthenticated = value => {
      isAuthenticated = value;
    };

    // Render the component
    return render(
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        <Router initialEntries={initialEntries}>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Router>
      </AuthContext.Provider>,
    );
  } else {
    let setIsAuthenticated;
    setIsAuthenticated = value => {
      isAuthenticated = value;
    };
    fetchMock.restore();
    fetchMock.get(`${API_URL}interests/`, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: [
        { id: 1, name: 'fintech' },
        { id: 2, name: 'BA' },
        { id: 3, name: 'school' },
      ],
    });
    fetchMock.post(
      API_URL + 'users/',
      () => {
        return {
          status: 201,
          ok: true,
          body: JSON.stringify({
            id: 1,
            // "first_name": 'test',
            // lastName: 'test',
            first_name: 'test',
            last_name: 'test',
            email: 'test@test.test',
            company: 'SMU',
            interests: [
              {
                id: 2,
                name: 'BA',
              },
            ],
            profile_pic: null,
            contact_number: '+65 9123 4567',
          }),
          headers: { 'Content-Type': 'application/json' }, // Response headers
        };
      },
      { overwriteRoutes: true },
    );
    return render(
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        <Router initialEntries={initialEntries}>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Router>
      </AuthContext.Provider>,
    );
  }
};
// // Example usage in testfile:
// const routes = [
//   { path: '/', element: <App /> },
//   { path: '/login', element: <Login /> },
// ];
// renderWithAuthContext(routes, ['/'], false);

// ------------------------------------------------------------------------
// function renderWithRouterAndAuth(
//   ui,
//   { initialEntries = ['/'], initialAuthState = true, component: Component = App, ...renderOptions } = {},
// ) {
//   // return render(
//   const Wrapper = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);

//     const [navbarRendered, setNavbarRendered] = useState(false);

//     useEffect(() => {
//       setNavbarRendered(true);
//     }, []);

//     return (
//       <MemoryRouter initialEntries={initialEntries}>
//         <AuthContext.Provider
//           value={{
//             // isAuthenticated: initialAuthState,
//             // setIsAuthenticated: () => {
//             //   initialAuthState;
//             // },
//             isAuthenticated,
//             setIsAuthenticated,
//           }}
//         >
//           {!navbarRendered && <Navbar />}
//           {children}
//         </AuthContext.Provider>
//       </MemoryRouter>
//     );

//     // renderOptions,
//   };

//   return render(ui, { wrapper: Wrapper, ...renderOptions });
// }

// export { renderWithRouterAndAuth };

// Customize initial entries
//   renderWithRouterAndAuth(
//   <App />,
//   { isAuthenticated: false, initialEntries: ['/login'] }
// );
