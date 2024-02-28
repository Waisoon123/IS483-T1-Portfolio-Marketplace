import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AuthContext } from '../App.jsx';

function renderWithRouterAndAuth(
  ui,
  { initialEntries = ['/'], isAuthenticated = true, component: Component = App, ...renderOptions } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={{ isAuthenticated }}>
        <Component />
      </AuthContext.Provider>
    </MemoryRouter>,
    renderOptions,
  );
}

export { renderWithRouterAndAuth };

// Customize initial entries
//   renderWithRouterAndAuth(
//   <App />,
//   { isAuthenticated: false, initialEntries: ['/login'] }
// );
