import React, { useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

function Appa() {
  const videoRef = useRef();

  useEffect(() => {
    const websocketClient = new W3CWebSocket('ws://localhost:8765/');

    websocketClient.onerror = function() {
      console.log('WebSocket client connection error');
    };

    websocketClient.onclose = function() {
      console.log('WebSocket client connection closed');
    };

    websocketClient.onopen = function() {
      console.log('WebSocket client connected');
    };

    websocketClient.onmessage = function(message) {
      if (typeof message.data === 'string') {
        const imageUrl = data:image/jpeg;base64,${message.data};
        videoRef.current.src = imageUrl;
      }
    };

    return () => {
      websocketClient.close();
    };
  }, []);

  return (
    <div>
      <h1>Video Stream</h1>
      <video ref={videoRef} autoPlay />
    </div>
  );
}

export default Appa;