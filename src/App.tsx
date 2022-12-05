import { useEffect, useRef, KeyboardEventHandler, useState } from 'react'
import './App.css'

function App() {
  const divRef = useRef<HTMLDivElement>(null);
  const originalFontSizeRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOverflown = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight;
  }

  const adaptFontSize = () => {
    const div = divRef.current;
    const originalFontSize = originalFontSizeRef.current;

    if (!div || !originalFontSize) {
      return;
    }

    let currentSize = parseInt(window.getComputedStyle(div, null).getPropertyValue('font-size'));
    if (isOverflown(div)) {
      while (isOverflown(div)) {
        currentSize--;
        div.style.fontSize = `${currentSize}px`;
      }
    } else if (currentSize < originalFontSize) {
      while (!isOverflown(div)) {
        currentSize++;
        if (currentSize > originalFontSize) {
          break;
        }
        div.style.fontSize = `${currentSize}px`;
      }
      currentSize = Math.min(originalFontSize, currentSize - 1);
      div.style.fontSize = `${currentSize}px`;
    }
  }

  const detectEnterKeypress: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const socket = socketRef.current;
    if (!socket || event.key !== 'Enter') {
      return;
    }
    socket.send(JSON.stringify({ type: 'FORM_DONE' }));
    setIsSubmitting(true);
  }

  useEffect(() => {
    const div = divRef.current;
    if (!div) {
      return;
    }
    const size = parseInt(window.getComputedStyle(div, null).getPropertyValue('font-size'));
    originalFontSizeRef.current = size;
  }, []);

  useEffect(() => {
    const socket = new WebSocket('wss://haidoan-art.herokuapp.com:443');

    socket.addEventListener('message', (event) => {
      let parsedData;

      try {
        parsedData = JSON.parse(event.data);
      } catch {
        return;
      }

      if (parsedData.type === 'TD_DONE') {
        setIsSubmitting(false);
        if (divRef.current) {
          divRef.current.textContent = '';
          divRef.current.focus();
        }
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
      <div
        ref={divRef}
        className={`${isSubmitting ? 'is-submitting' : ''} dynamic-text`}
        contentEditable={!isSubmitting}
        onInput={adaptFontSize}
        onKeyDown={detectEnterKeypress}
        tabIndex={0}
      >
        Dynamic text
      </div>
    </div>
  )
}

export default App
