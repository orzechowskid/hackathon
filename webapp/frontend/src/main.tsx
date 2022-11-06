import React, {
  type ParentComponent
} from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import {
  IdentityProvider
} from './hooks/useIdentity';
import {
  RemoteDataProvider
} from './hooks/useRemoteData';
import Index from './pages/Index';

const AppProvider: ParentComponent = ({ children }) => {
  return (
    <BrowserRouter>
      <IdentityProvider>
        <RemoteDataProvider>
          {children}
        </RemoteDataProvider>
      </IdentityProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <Routes>
        <Route index element={<Index />} />
      </Routes>
    </AppProvider>
  </React.StrictMode>
);
