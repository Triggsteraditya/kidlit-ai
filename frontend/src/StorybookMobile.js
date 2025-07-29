/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StorybookMobile.css';

const StorybookMobile = () => {
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const hiddenRef = useRef(null);
  const navigate = useNavigate();
  


  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      const next = currentPageIndex + 1;
      if (next < pages.length) {
        setCurrentPageIndex(next);
      }
      setFade(true);
    }, 300);
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setFade(false);
      setTimeout(() => {
        setCurrentPageIndex((prev) => prev - 1);
        setFade(true);
      }, 300);
    }
  };

const goToQuiz = () => {
  const storyText = localStorage.getItem('generatedStory') || '';
  navigate('/quiz', { state: { story: storyText } });
};






  useEffect(() => {
    const title = localStorage.getItem('generatedTitle') || 'My Story';
    const storyText = localStorage.getItem('generatedStory') || '';

    const paragraphList = storyText
      .replace(/\n+/g, ' ')
      .split(/(?<=[.!?])\s+/g)
      .filter((p) => p.trim().length > 0);

    const hiddenDiv = hiddenRef.current;
    let pagesTemp = [];
    let currentPage = '';

    pagesTemp.push(title);

    paragraphList.forEach((sentence, index) => {
      hiddenDiv.innerText = currentPage + ' ' + sentence;

      if (hiddenDiv.offsetHeight > 350) {
        if (currentPage.trim().length > 0) {
          pagesTemp.push(currentPage.trim());
        }
        currentPage = sentence;
      } else {
        currentPage += ' ' + sentence;
      }

      if (index === paragraphList.length - 1 && currentPage.trim().length > 0) {
        pagesTemp.push(currentPage.trim());
      }
    });

    pagesTemp.push('✨ The End');
    setPages(pagesTemp);
  }, []);

  const isLastPage = currentPageIndex === pages.length - 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowRight') handleNext();
      if (e.code === 'ArrowLeft') handlePrev();
    };

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) handleNext();
      if (touchEndX > touchStartX + 50) handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPageIndex, pages]);

  return (


    
        
        
    <div>
      <header className="apk-header">
        <Link to="/" className="logo1-link">
          <div className="logo1-section">
            <img src="/kidlit-logo.png" alt="logo" className="logo1-icon" />
            <h1 className="logo1-text">KidLit Ai</h1>
          </div>
        </Link>
        
      </header>

      <div className="main-body1">
        <div className="story-box1">
          <div className={`story-content1 ${fade ? 'fade-in' : 'fade-out'}`}>
            {currentPageIndex === 0 ? (
              <h2 className="story-title1">{pages[0]}</h2>
            ) : pages[currentPageIndex] === '✨ The End' ? (
              <h2 className="story-end1">{pages[currentPageIndex]}</h2>
            ) : (
              <p className="story-text1">{(pages[currentPageIndex] || '')}</p>
            )}

          </div>

          
        </div>
        
        

             

      </div>

      <div className="page-controls1">
        <button onClick={handlePrev} disabled={currentPageIndex === 0}>&lt;</button>
        <button onClick={() => handleNext(false)} disabled={isLastPage}>&gt;</button>
      </div>
      
      

      <div
        ref={hiddenRef}
        className="story-text1 measure"
        style={{
              position: 'absolute',
              visibility: 'hidden',
              zIndex: -1,
              width: '90vw',
              padding: 0,
              margin: 0,
              fontSize: '1rem',
              lineHeight: '1.5',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}

            
      ></div>
      <div className="audio-button-containers">
          <button onClick={goToQuiz} className="quiz-button">
          <img src="/quiz-logo.png" alt="quiz" className="quiz-icon1" />
        </button>
      </div>
    </div>
  );
};

export default StorybookMobile;