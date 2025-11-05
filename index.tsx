import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { isFirebaseConfigured } from './services/firebase';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (!isFirebaseConfigured) {
    rootElement.innerHTML = `
        <div style="font-family: 'Roboto', sans-serif; color: #e5e7eb; padding: 40px; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1 style="font-family: 'Cinzel', serif; color: #facc15; font-size: 2.5rem; margin-bottom: 2rem; text-shadow: 0 0 8px rgba(251, 191, 36, 0.7);">Configuration Required</h1>
          <p style="font-size: 1.125rem; margin-bottom: 1rem;">Welcome to your Creative Vault! One last step is needed.</p>
          <div style="max-width: 600px; margin: 0 auto; text-align: left; background-color: rgba(31, 41, 55, 0.5); padding: 2rem; border-radius: 0.5rem; border: 1px solid #ca8a04;">
            <p style="margin-bottom: 1.5rem;">To bring your site online, you must connect it to a Firebase project. This is a free, one-time setup.</p>
            <strong style="color: #fbbf24;">Action Required:</strong>
            <ol style="list-style: decimal; margin-left: 2rem; margin-top: 1rem; line-height: 1.7;">
                <li>Open the file <code style="background-color: #111827; padding: 0.2rem 0.5rem; border-radius: 0.25rem; color: #f87171;">services/firebase.ts</code> in your code editor.</li>
                <li>Follow the instructions in the comments at the top of the file to paste in your Firebase project configuration.</li>
                <li>Save the file. Your deployed website will automatically update and go live.</li>
            </ol>
          </div>
        </div>
    `;
} else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}