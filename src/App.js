import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import PasswordManager from './components/PasswordManager';

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/password-manager" element={<PasswordManager />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
