import { useState, useCallback } from "react";

const TYPING_SPEED_MS = 18;

export const useTypingEffect = () => {
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typeMessage = useCallback((text: string, onDone: () => void) => {
    setIsTyping(true);
    setTypingText("");
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(iv);
        setIsTyping(false);
        setTypingText("");
        onDone();
      }
    }, TYPING_SPEED_MS);
  }, []);

  return { typingText, isTyping, typeMessage };
};
