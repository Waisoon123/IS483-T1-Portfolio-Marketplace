import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './routes/Login.jsx';
import SignUp from './routes/SignUp.jsx';
import ViewUserProfile from './routes/ViewUserProfile.jsx';
import EditUserProfile from './routes/EditUserProfile.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        children: [
          { path: '/login', element: <Login /> },
          { path: '/sign-up', element: <SignUp /> },
          { path: '/profile', element: <ViewUserProfile /> },
          { path: '/profile-edit', element: <EditUserProfile /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
