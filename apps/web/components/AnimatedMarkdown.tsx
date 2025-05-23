import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const AnimatedMarkdown = ({ text }: { text: string }) => {
  const [animatedText, setAnimatedText] = useState('');

  useEffect(() => {
    let i = 0;
    setAnimatedText('');
    const interval = setInterval(() => {
      setAnimatedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <ReactMarkdown>{animatedText}</ReactMarkdown>;
};

export default AnimatedMarkdown;
