import { useEffect, useRef, KeyboardEventHandler, useState, ChangeEventHandler } from 'react'
import './App.css'

function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const originalFontSizeRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOverflown = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight;
  }

  const adaptFontSize = () => {
    const textArea = textAreaRef.current;
    const originalFontSize = originalFontSizeRef.current;

    if (!textArea || !originalFontSize) {
      return;
    }

    let currentSize = parseInt(window.getComputedStyle(textArea, null).getPropertyValue('font-size'));
    if (isOverflown(textArea)) {
      while (isOverflown(textArea)) {
        currentSize--;
        textArea.style.fontSize = `${currentSize}px`;
      }
    } else if (currentSize < originalFontSize) {
      while (!isOverflown(textArea)) {
        currentSize++;
        if (currentSize > originalFontSize) {
          break;
        }
        textArea.style.fontSize = `${currentSize}px`;
      }
      currentSize = Math.min(originalFontSize, currentSize - 1);
      textArea.style.fontSize = `${currentSize}px`;
    }
  }

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setInput(event.target.value);
    adaptFontSize();
  }

  const detectEnterKeypress: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    const socket = socketRef.current;
    if (!socket || event.key !== 'Enter') {
      return;
    }
    socket.send(JSON.stringify({ type: 'FORM_DONE' }));
    setIsSubmitting(true);
  }

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) {
      return;
    }
    const size = parseInt(window.getComputedStyle(textArea, null).getPropertyValue('font-size'));
    originalFontSizeRef.current = size;
  }, []);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);

    socket.addEventListener('message', (event) => {
      if (event.data === 'ping') {
        socket.send('pong');
        return;
      }

      let parsedData;

      try {
        parsedData = JSON.parse(event.data);
      } catch {
        return;
      }

      if (parsedData.type === 'TD_DONE') {
        setIsSubmitting(false);
        setInput('');
        setTimeout(() => {
          if (textAreaRef.current && originalFontSizeRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.style.fontSize = `${originalFontSizeRef.current}px`;
          }
        }, 0);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="App">
      <textarea
        ref={textAreaRef}
        className="dynamic-text"
        placeholder="Your answer"
        autoFocus
        value={input}
        onChange={handleChange}
        onKeyDown={detectEnterKeypress}
        disabled={isSubmitting}
      />
    </div>
  )
}

export default App
