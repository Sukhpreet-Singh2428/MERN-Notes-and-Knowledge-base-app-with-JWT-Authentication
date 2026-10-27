import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotesProvider } from './context/NotesContext.jsx';
import './styles/tokens.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotesProvider>
        <App />
      </NotesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
