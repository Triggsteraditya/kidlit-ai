import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import StoryBookPage from './StoryBookPage';
import FullscreenBook from './FullscreenBook';
import './App.css';

function HomePage({ onGenerateStory, name, setName, age, setAge, theme, setTheme, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateStory();
  };

  return (
    <div className="app-container">
      <h2>📚 KidLit AI</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Child's Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Age"
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
        <input
          placeholder="Story Theme"
          value={theme}
          onChange={e => setTheme(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Story"}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const generateStory = async () => {
    if (!name.trim() || !age.trim() || !theme.trim()) {
      alert("Please fill all fields (Name, Age, and Theme)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, theme })
      });

      const data = await response.json();
      if (!data.title || !data.pages) throw new Error("Invalid story");

      localStorage.setItem("storybook_title", data.title);
      localStorage.setItem("storybook_pages", JSON.stringify(data.pages));
      localStorage.setItem("storybook_cover", data.cover_image || "");

      navigate("/storybook");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate story. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          onGenerateStory={generateStory}
          name={name} setName={setName}
          age={age} setAge={setAge}
          theme={theme} setTheme={setTheme}
          loading={loading}
        />
      } />
      <Route path="/storybook" element={<StoryBookPage />} />
      <Route path="/fullscreen" element={<FullscreenBook />} />
    </Routes>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
