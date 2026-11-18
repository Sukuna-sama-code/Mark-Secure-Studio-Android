import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MobileStudioApp from './MobileStudioApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileStudioApp />
  </StrictMode>,
);
