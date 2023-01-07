import {
  defaultTheme,
  Provider as SpectrumProvider
} from '@adobe/react-spectrum';
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
import Index from './pages/Index';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PublicHome from './pages/PublicHome';
import Timeline from './components/Timeline';

import './reset.css';
import './global.css';
import './theme.css';

const AppProvider: ParentComponent = ({ children }) => {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <BrowserRouter>
        <IdentityProvider>
          {children}
        </IdentityProvider>
      </BrowserRouter>
    </SpectrumProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AppProvider>
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<PublicHome />} path="/public" />
      <Route element={<Index />} path="/">
        <Route element={<Profile />} path="/profile/:id" />
        <Route element={<Timeline />} index />
      </Route>
    </Routes>
  </AppProvider>
);
