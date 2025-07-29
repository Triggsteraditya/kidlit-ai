import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

function AboutUs() {


  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="logo-link">
          <div className="logo-section">
            <img src="/kidlit-logo.png" alt="logo" className="logo-icon" />
            <h1 className="logo-text">KidLit Ai</h1>
          </div>
        </Link>
      </header>

     <main className="app-main">
        <div className="center-column">
          <h2 className="About-text">About Us</h2>
          <p className="intro-text">
            Typing...
          </p>
          </div>
          </main>
        </div>
  );
}

export default AboutUs;
