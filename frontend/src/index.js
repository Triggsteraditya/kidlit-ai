import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import AboutUs from './AboutUs';
import ChooseOptionPage from './ChooseOptionPage';
import CreateStorybookPage from './CreateStorybookPage';
import Storybook from './Storybook';
import StorybookMobile from './StorybookMobile';
import Quiz from './Quiz';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/ChooseOptionPage" element={<ChooseOptionPage />} />
      <Route path="/create/storybook" element={<CreateStorybookPage />} />
      <Route path="/storybook" element={<Storybook />} />
      <Route path="/storybook-mobile" element={<StorybookMobile />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  </BrowserRouter>
);
