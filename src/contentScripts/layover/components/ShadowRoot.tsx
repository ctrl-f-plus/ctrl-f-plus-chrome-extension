import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function ShadowRoot({ children, styles }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (hostRef.current) {
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' });

      // Add styles to the shadow root
      const style = document.createElement('style');
      style.textContent = styles;
      shadowRoot.appendChild(style);

      // Render children inside the shadow root
      const root = document.createElement('div');
      shadowRoot.appendChild(root);

      const reactRoot = createRoot(root);
      reactRoot.render(children);
    }
  }, [children, styles]);

  return <div ref={hostRef} />;
}

export default ShadowRoot;
