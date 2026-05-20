import React, { useEffect, useState } from 'react';

interface TypingTitleProps {
  text: string;
}

export const TypingTitle: React.FC<TypingTitleProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    const chars = [...text];
    
    // Small delay before starting to feel more natural
    const startTimeout = setTimeout(() => {
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => {
          const prevChars = [...prev];
          if (prevChars.length < chars.length) {
            return prev + chars[prevChars.length];
          }
          clearInterval(intervalId);
          return prev;
        });
      }, 100);
      
      return () => clearInterval(intervalId);
    }, 300);

    return () => clearTimeout(startTimeout);
  }, [text]);

  return (
    <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 drop-shadow-sm">
      {displayedText}
      <span className="animate-pulse ml-1 text-blue-500">|</span>
    </h1>
  );
};