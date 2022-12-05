import { useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const divRef = useRef<HTMLDivElement>(null);
  const originalFontSizeRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

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

  const sendData = () => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.send(JSON.stringify({ type: 'DONE' }));
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
    socketRef.current = new WebSocket('wss://haidoan-art.herokuapp.com:443');
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div ref={divRef} className="dynamic-text" contentEditable onInput={adaptFontSize}>
        Dynamic text
      </div>
      <button type="button" onClick={sendData}>Send data</button>
    </div>
  )
}

export default App
