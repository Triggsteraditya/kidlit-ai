import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HTMLFlipBook from "react-pageflip";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function StoryBookPage() {
  const navigate = useNavigate();
  const bookRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [rate, setRate] = useState(1);
  const [showCover, setShowCover] = useState(true);
  const [showThanks, setShowThanks] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const title = localStorage.getItem("storybook_title") || "";
  const coverImage = localStorage.getItem("storybook_cover") || "";
  const pages = JSON.parse(localStorage.getItem("storybook_pages") || "[]");

  const increaseRate = () => setRate(prev => Math.min(prev + 0.1, 2));
  const decreaseRate = () => setRate(prev => Math.max(prev - 0.1, 0.5));

  const readStory = () => {
    if (isReading || !bookRef.current) return;
    setIsReading(true);
    setShowCover(false);

    let pageIndex = currentPage - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) pageIndex = 0;

    const readPage = () => {
      const pageText = pages[pageIndex]?.text || "";
      const chunks = pageText.match(/[^.!?]+[.!?]+/g) || [pageText]; // sentences

      let chunkIndex = 0;

      const speakChunk = () => {
        if (chunkIndex >= chunks.length) {
          pageIndex++;
          if (pageIndex < pages.length) {
            bookRef.current.pageFlip().flipNext();
            setTimeout(readPage, 1000);
          } else {
            setIsReading(false);
            setHighlightedWord("");
          }
          return;
        }

        const textChunk = chunks[chunkIndex].trim();
        const words = textChunk.split(" ");
        let wordPos = 0;

        const utterance = new SpeechSynthesisUtterance(textChunk);
        utterance.rate = rate;
        const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'hi-IN' || v.lang.startsWith('en'));
        if (voice) utterance.voice = voice;

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setHighlightedIndex(pageIndex);
            setHighlightedWord(words[wordPos] || "");
            wordPos++;
          }
        };

        utterance.onend = () => {
          chunkIndex++;
          speakChunk();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakChunk();
    };

    bookRef.current.pageFlip().flip(pageIndex + 1);
    setTimeout(readPage, 500);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setHighlightedWord("");
  };

  const downloadPDF = () => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const flipPages = document.querySelectorAll(".page");

    let promises = Array.from(flipPages).map((page, i) =>
      html2canvas(page).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        if (i !== 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
      })
    );

    Promise.all(promises).then(() => {
      pdf.save("storybook.pdf");
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowRight") bookRef.current.pageFlip().flipNext();
    else if (e.key === "ArrowLeft") bookRef.current.pageFlip().flipPrev();
  }, []);

  useEffect(() => {
    setTotalPages(pages.length + 2);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown, pages.length]);

  return (
    <>
      <div style={{ position: "fixed", top: "10px", left: "10px", display: "flex", flexWrap: "wrap", gap: "10px", zIndex: 1000 }}>
        <button onClick={() => navigate("/")} style={buttonStyle}>🏠 Home</button>
        <button onClick={readStory} disabled={isReading} style={buttonStyle}>📖 Read</button>
        <button onClick={stopReading} disabled={!isReading} style={buttonStyle}>🛑 Stop</button>
        <button onClick={downloadPDF} style={buttonStyle}>💾 PDF</button>
        <button onClick={decreaseRate} style={circleButtonStyle}>➖</button>
        <button onClick={increaseRate} style={circleButtonStyle}>➕</button>
        <span style={{ alignSelf: "center", fontWeight: "bold", marginLeft: "10px" }}>🔊 {rate.toFixed(1)}x | Page {currentPage + 1}/{totalPages}</span>
      </div>

      <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <HTMLFlipBook
          ref={bookRef}
          width={600}
          height={400}
          size="fixed"
          showCover={true}
          mobileScrollSupport={true}
          onFlip={(e) => {
            setCurrentPage(e.data);
            setShowCover(e.data === 0);
            if (e.data === totalPages - 1) setShowThanks(true);
            else setShowThanks(false);
          }}
        >
          <div className="page" style={{ ...pageStyle, backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center", color: "#fff", textShadow: "2px 2px 6px #000" }}>
            <h1 style={{ fontSize: "50px", padding: "20px", textAlign: "center", marginTop: "90px" }}>{title}</h1>
          </div>

          {pages.map((page, index) => (
            <div key={index} className="page" style={pageStyle}>
              {page.image_url && (
                <img src={page.image_url} alt="Page Illustration" style={{ maxWidth: "90%", maxHeight: "180px", marginBottom: "15px", borderRadius: "10px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }} />
              )}
              <p style={{ fontSize: "30px", textAlign: "center", margin: "30px", wordWrap: "break-word", wordBreak: "break-word", maxWidth: "90%", overflowY: "auto" }}>
                {page.text.split(" ").map((word, i) => (
                  <span key={i} style={{ backgroundColor: highlightedIndex === index && highlightedWord === word ? "#ffff00" : "transparent" }}>
                    {word + " "}
                  </span>
                ))}
              </p>
            </div>
          ))}

          <div className="page" style={{ ...pageStyle, justifyContent: "center", alignItems: "center" }}>
            <h2 style={{ fontSize: "clamp(36px, 6vw, 60px)", color: "#000000", textAlign: "center", marginTop: "150px" }}>
              The End
            </h2>
          </div>
        </HTMLFlipBook>
      </div>
    </>
  );
}

const buttonStyle = {
  background: "#fce4ec",
  border: "1px solid #f8bbd0",
  padding: "8px 15px",
  borderRadius: "15px",
  cursor: "pointer"
};

const circleButtonStyle = {
  background: "#fce4ec",
  border: "1px solid #f8bbd0",
  padding: "8px",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  textAlign: "center",
  cursor: "pointer"
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
  overflow: "hidden"
};

export default StoryBookPage;
