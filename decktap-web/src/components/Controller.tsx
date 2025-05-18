import { useState } from 'react';
import { Timer } from './Timer';
import '../styles/controller.css';
import { useWebSocket, WebSocketCommand } from '../hooks/useWebSocket';
import { ConnectionStatus } from './ConnectionStatus';

export function Controller() {
  const [isRightHanded, setIsRightHanded] = useState(true);
  const { connectionStatus, sendCommand } = useWebSocket();
  const toggleHand = () => {
    setIsRightHanded(!isRightHanded);
  };

  return (
    <div className="container">
      <h1>DeckTap Controller</h1>

      <div className={`controls ${isRightHanded ? 'right-handed' : ''}`}>
        <button 
          className="control-btn"
          onClick={() => sendCommand(WebSocketCommand.PREV)}
        >
          Previous
        </button>
        
        <button 
          className="control-btn"
          onClick={() => sendCommand(WebSocketCommand.NEXT)}
        >
          Next
        </button>
        
        <button 
          className="hand-toggle-btn"
          onClick={toggleHand}
        >
          <span className="hand-icon">
            {isRightHanded ? '👉' : '👈'}
          </span>
        </button>
      </div>

      <Timer/>
      
      <ConnectionStatus status={connectionStatus} />
    </div>
  );
}

