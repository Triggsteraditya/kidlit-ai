import React, { useRef, useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';

function FullscreenBook() {
  const bookRef = useRef();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const storedPages = JSON.parse(localStorage.getItem('storybook_pages') || '[]');
    const storedTitle = localStorage.getItem('storybook_title') || '';
    const storedCover = localStorage.getItem('storybook_cover') || '';
    setPages(storedPages);
    setTitle(storedTitle);
    setCoverImage(storedCover);
  }, []);

  const readStory = () => {
    if (isReading || !bookRef.current) return;
    setIsReading(true);

    const flip = bookRef.current.pageFlip();
    let pageIndex = 0;

    const readPage = () => {
      const text = pages[pageIndex]?.text || '';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;

      const hindiVoice = window.speechSynthesis.getVoices().find(v => v.lang === 'hi-IN' && v.name.includes('Google'));
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.onend = () => {
        pageIndex++;
        if (pageIndex < pages.length) {
          flip.flipNext();
          setTimeout(readPage, 500);
        } else {
          setIsReading(false);
        }
      };

      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    };

    flip.flip(1);
    setTimeout(readPage, 500);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  return (
    <div style={fullscreenContainer}>
      <div style={toolbarContainer}>
        <div style={leftControls}>
          <button onClick={() => navigate('/storybook')} style={circleButton}>⬅️</button>
        </div>
        <div style={rightControls}>
          <button onClick={readStory} disabled={isReading} style={roundedButton}>📖 Read Aloud</button>
          <button onClick={stopReading} disabled={!isReading} style={roundedButton}>🛑 Stop Reading</button>
          <div style={sliderContainer}>
            <button onClick={() => setRate(prev => Math.max(0.5, prev - 0.1))} style={circleButton}><span style={centerIcon}>➖</span></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                style={{ margin: "0 5px" }}
              />
              <span style={{ minWidth: "30px", textAlign: "center" }}>{rate.toFixed(1)}x</span>
            </div>
            <button onClick={() => setRate(prev => Math.min(2, prev + 0.1))} style={circleButton}><span style={centerIcon}>➕</span></button>
          </div>
        </div>
      </div>

      <HTMLFlipBook
        ref={bookRef}
        width={800}
        height={600}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1536}
        showCover={true}
        mobileScrollSupport={true}
        style={{ margin: "auto" }}
      >
        {/* Centered Book Cover Page */}
        <div className="page" style={{
          ...pageStyle,
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: "48px",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#ffffffbb",
            textAlign: "center"
          }}>{title}</h1>
        </div>

        {/* Story Pages */}
        {pages.map((page, index) => (
          <div key={index} className="page" style={pageStyle}>
            {page.image_url && (
              <img src={page.image_url} alt="Illustration" style={{ maxWidth: "80%", maxHeight: "300px", marginBottom: "20px" }} />
            )}
            <p style={{ fontSize: "38px", textAlign: "center" }}>{page.text}</p>
          </div>
        ))}

        {/* The End Page (centered) */}
        <div className="page" style={{
          ...pageStyle,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "48px", color: "#444" }}>The End</h1>
        </div>
      </HTMLFlipBook>
    </div>
  );
}

const fullscreenContainer = {
  width: "100vw",
  height: "100vh",
  backgroundColor: "#fff8f0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  overflow: "hidden"
};

const toolbarContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  background: "#fff8f0",
  width: "100%",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  zIndex: 10,
  margin:"-15px"
};

const leftControls = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const rightControls = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const sliderContainer = {
  display: "flex",
  alignItems: "center",
  gap: "5px"
};

const circleButton = {
  background: "#fce4ec",
  border: "1px solid #f8bbd0",
  color: "#000",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  fontSize: "18px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  cursor: "pointer",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0
};

const roundedButton = {
  background: "#fce4ec",
  border: "1px solid #f8bbd0",
  borderRadius: "15px",
  padding: "8px 16px",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
};

const centerIcon = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
};

const pageStyle = {
  padding: "20px",
  background: "#fff8f0",
  borderRadius: "15px",
  boxShadow: "0 0 10px #f3c7b5",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%"
};

export default FullscreenBook;
