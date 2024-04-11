import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import * as paths from './constants/paths.js';
import Login from './routes/Login.jsx';
import SignUp from './routes/SignUp.jsx';
import ViewUserProfile from './routes/ViewUserProfile.jsx';
import EditUserProfile from './routes/EditUserProfile.jsx';
import Directory from './routes/Directory.jsx';
import CompanyDetails from './components/CompanyDetails.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        children: [
          { path: paths.LOGIN, element: <Login /> },
          { path: paths.SIGN_UP, element: <SignUp /> },
          { path: paths.VIEW_USER_PROFILE, element: <ViewUserProfile /> },
          { path: paths.EDIT_USER_PROFILE, element: <EditUserProfile /> },
          { path: paths.DIRECTORY, element: <Directory /> },
          { path: `/${paths.DIRECTORY}/:companyName`, element: <CompanyDetails /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
