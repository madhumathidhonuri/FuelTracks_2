import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const themeScript = `(function(){const theme=localStorage.getItem('ft_theme')||'light';document.documentElement.classList.toggle('dark',theme==='dark');document.body.classList.toggle('dark',theme==='dark');})();`;
const script = document.createElement('script');
script.textContent = themeScript;
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider>
  </React.StrictMode>
);
