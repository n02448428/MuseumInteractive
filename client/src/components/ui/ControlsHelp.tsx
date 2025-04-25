import { useState, useEffect } from 'react';

export default function ControlsHelp() {
  const [visible, setVisible] = useState(true);
  
  // Hide the help after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="controls-help">
      <div className="controls-help-inner">
        <h3>Controls:</h3>
        <ul>
          <li><strong>W/S or Up/Down</strong>: Move forward/backward</li>
          <li><strong>A/D or Left/Right</strong>: Turn left/right</li>
          <li><strong>Right Mouse Button + Move</strong>: Look around</li>
          <li><strong>Click on exhibits</strong>: View details</li>
          <li><strong>E</strong>: Interact</li>
        </ul>
        <button onClick={() => setVisible(false)}>Got it!</button>
      </div>
    </div>
  );
}