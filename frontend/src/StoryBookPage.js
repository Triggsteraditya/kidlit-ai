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
  const [resumePageIndex, setResumePageIndex] = useState(null);
  const [resumeWordIndex, setResumeWordIndex] = useState(null);

  const title = localStorage.getItem("storybook_title") || "";
  const coverImage = localStorage.getItem("storybook_cover") || "";
  const pages = JSON.parse(localStorage.getItem("storybook_pages") || "[]");

  const increaseRate = () => setRate(prev => Math.min(prev + 0.1, 2));
  const decreaseRate = () => setRate(prev => Math.max(prev - 0.1, 0.5));

  const readStory = () => {
    if (isReading || !bookRef.current) return;
    setIsReading(true);
    setShowCover(false);

    const total = pages.length;
    let pageIndex = resumePageIndex !== null ? resumePageIndex : 0;
    let wordIndex = resumeWordIndex !== null ? resumeWordIndex : 0;

    const readPage = () => {
      const currentText = pages[pageIndex]?.text || "";
      const words = currentText.split(/\s+/);
      const remainingText = words.slice(wordIndex).join(" ");

      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.rate = rate;

      const hindiVoice = window.speechSynthesis.getVoices().find(v =>
        v.lang === 'hi-IN' && v.name.includes('Google')
      );
      if (hindiVoice) utterance.voice = hindiVoice;

      const pageEls = document.querySelectorAll('.page');
      const pageEl = pageEls[pageIndex + 1];
      const textEl = pageEl.querySelector('.page-text');

      if (textEl) {
        textEl.innerHTML = words.map((word, i) => `<span class="word">${word}</span>`).join(" ");
      }

      utterance.onboundary = (event) => {
        if (event.name === "word" && textEl) {
          const charIndex = event.charIndex;
          const preText = remainingText.substring(0, charIndex);
          wordIndex = wordIndex + preText.trim().split(/\s+/).length - 1;

          const wordSpans = textEl.querySelectorAll(".word");
          wordSpans.forEach((span, i) => {
            span.style.backgroundColor = i === wordIndex ? "#ffff99" : "transparent";
          });
        }
      };

      utterance.onend = () => {
        if (textEl) {
          const wordSpans = textEl.querySelectorAll(".word");
          wordSpans.forEach(span => span.style.backgroundColor = "transparent");
        }

        pageIndex++;
        wordIndex = 0;

        if (pageIndex < total) {
          bookRef.current.pageFlip().flipNext();

          const onFlip = () => {
            bookRef.current.pageFlip().off("flip", onFlip);
            readPage();
          };
          bookRef.current.pageFlip().on("flip", onFlip);
        } else {
          setIsReading(false);
          setResumePageIndex(null);
          setResumeWordIndex(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    bookRef.current.pageFlip().flip(pageIndex + 1);
    const onStartFlip = () => {
      bookRef.current.pageFlip().off("flip", onStartFlip);
      readPage();
    };
    bookRef.current.pageFlip().on("flip", onStartFlip);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setResumePageIndex(currentPage - 1);
    setResumeWordIndex(resumeWordIndex);
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
    // your JSX and UI logic remains the same
  );
}

export default StoryBookPage;
