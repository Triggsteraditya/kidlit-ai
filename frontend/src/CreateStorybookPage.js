import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CreateStorybookPage.css';

const CreateStorybookPage = () => {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const [language, setLanguage] = useState('english'); // 'english' or 'hindi'
  const [isGenerating, setIsGenerating] = useState(false);



  const themes = [
    'Sci-Fi', 'Adventure', 'Fantasy',
    'Mystery', 'Fairytale', 'Educational',
    'Funny', 'Action', 'Magic'
  ];

  const buildPrompt = () => {
    let prompt = `Write a children's story in the theme of "${selectedTheme}".`;
    if (name) {
      prompt += ` The main character's name is ${name}.`;
    }
    if (ageGroup === '3–5') {
      prompt += ` Use very simple words and short sentences. The story should be fun, easy to understand, and engaging for a child aged 3 to 5.`;
    } else if (ageGroup === '6–8') {
      prompt += ` Make it fun, magical, and suitable for children aged 6 to 8 with a light adventure.`;
    } else if (ageGroup === '9–12') {
      prompt += ` Include imaginative elements, humor or suspense for ages 9 to 12.`;
    }
    return prompt;
  };

const isMobile = () => window.innerWidth <= 768;

const handleGenerate = async () => {
  if (isGenerating) return;
  setIsGenerating(true);

  const defaultStory = `Oops! Something went wrong, but don't worry! Here's a fun little story: Once upon a time, a curious child clicked the Generate button. Even though the magic hiccupped, their imagination soared, and a new adventure began anyway!`;

  if (!selectedTheme) {
    alert("Please select a theme.");
    setIsGenerating(false);
    return;
  }

  const navigateTo = isMobile() ? '/storybook-mobile' : '/storybook';

  try {
    if (name || ageGroup) {
      const prompt = buildPrompt();
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language })
      });
      const data = await res.json();
      localStorage.setItem('generatedTitle', data.title || 'My Story');
      localStorage.setItem('generatedStory', data.story || defaultStory);
      navigate(navigateTo);
    } else if (photo) {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('theme', selectedTheme);
      formData.append('language', language);
      const res = await fetch('/api/generate-from-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      localStorage.setItem('generatedTitle', data.title || 'My Story');
      localStorage.setItem('generatedStory', data.story || defaultStory);
      navigate(navigateTo);
    } else {
      alert("Please enter name or age group, OR upload a photo.");
    }
  } catch (err) {
    console.error(err);
    localStorage.setItem('generatedTitle', 'My Story');
    localStorage.setItem('generatedStory', defaultStory);
    navigate(navigateTo);
  } finally {
    setIsGenerating(false);
  }
};




  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="logo-link">
          <div className="logo-section">
            <img src="/kidlit-logo.png" alt="logo" className="logo-icon" />
            <h1 className="logo-text">KidLit Ai</h1>
          </div>
        </Link>
        <Link to="/AboutUs" className="about-btn">About Us</Link>
      </header>

      <div className="storybook-container">
        <div className="left-panel">
          <h2 className="main-title">Create Storybook</h2>
          <p className="subtitle"><strong>Select a story theme and fill out the form</strong></p>
          <p className="description">Let KidLit AI turn your ideas into a delightful storybook adventure!</p>

          <div className="theme-buttons">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`theme-btn ${selectedTheme === theme ? 'active' : ''}`}
                onClick={() => setSelectedTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <p className="right-instruction">
            <strong>Type the name of the child in the text box below</strong>
          </p>
          <p className="description1">So we can make the story truly yours!</p>

          <label>Name</label>
          <input
            type="text"
            placeholder="Enter Child name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Age</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
            <option value="">Choose Age Group</option>
            <option value="3–5">3–5</option>
            <option value="6–8">6–8</option>
            <option value="9–12">9–12</option>
          </select>
          <label>Language</label>
<select value={language} onChange={(e) => setLanguage(e.target.value)}>
  <option value="english">English</option>
  <option value="hindi">Hindi</option>
</select>


          <p className="or-text">OR</p>

          <div className="camera-upload">
            <label htmlFor="camera" className="camera-icon">
              <img src="/cam-logo.png" alt="cam" className="cam-icon" />
            </label>
            <input
            id="camera"
            type="file"
            accept="image/*"
            capture="environment" // ✅ Add this line!
            style={{ display: 'none' }}
            onChange={(e) => setPhoto(e.target.files[0])}
            />
          </div>

          <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStorybookPage;
