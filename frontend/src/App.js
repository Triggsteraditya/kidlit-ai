import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import StoryBookPage from './StoryBookPage';
import './App.css';

function HomePage({ onGenerateStory, name, setName, age, setAge, theme, setTheme, loading, handleCameraUpload, openCameraUpload, fileInputRef }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateStory();
  };

  return (
    <div className="app-container">
      <h2>📚 KidLit AI</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
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

        <button type="button" onClick={openCameraUpload} style={smallCircleButtonStyle}>📷</button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleCameraUpload}
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
  const fileInputRef = useRef();

  const generateStory = async () => {
    if (!name.trim() || !age.trim() || !theme.trim()) {
      alert("Please fill all fields (Name, Age, and Theme)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://kidlit-ai-backend.onrender.com/generate_story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, theme })
      });

      const data = await response.json();

      if (data?.title && data?.pages) {
        localStorage.setItem("storybook_title", data.title);
        localStorage.setItem("storybook_pages", JSON.stringify(data.pages));
        localStorage.setItem("storybook_cover", data.cover_image || "");
      } else {
        throw new Error("Invalid story response");
      }
    } catch (err) {
      console.error("Error:", err);
      localStorage.setItem("storybook_title", "Oops!");
      localStorage.setItem("storybook_pages", JSON.stringify([
        { text: "There was a problem generating your story. Please try again later.", image_url: "" }
      ]));
      localStorage.setItem("storybook_cover", "");
    } finally {
      setLoading(false);
      navigate("/storybook");
    }
  };

  const openCameraUpload = () => {
    fileInputRef.current.click();
  };

  const handleCameraUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await fetch("https://kidlit-ai-backend.onrender.com/generate_story", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      const { title, cover_image_url, pages } = result;

      localStorage.setItem("storybook_title", title);
      localStorage.setItem("storybook_cover", cover_image_url);
      localStorage.setItem("storybook_pages", JSON.stringify(pages));

      navigate("/storybook");
    } catch (error) {
      alert("Error generating story from image.");
      console.error(error);
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
          handleCameraUpload={handleCameraUpload}
          openCameraUpload={openCameraUpload}
          fileInputRef={fileInputRef}
        />
      } />
      <Route path="/storybook" element={<StoryBookPage />} />
    </Routes>
  );
}

const smallCircleButtonStyle = {
  background: "#fff8f0",
  border: "2px solid #ffa0c2",
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  fontSize: "19px",
  lineHeight: "40px",           // Ensures vertical centering
  textAlign: "center",          // Ensures horizontal centering
  verticalAlign: "middle",
  padding: "0",                 // Removes default padding
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  display: "inline-block"
};


export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
