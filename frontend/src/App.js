import React from 'react';
import SpeakingTest from './components/SpeakingTest';
import FaceDetectionComponent from './components/proctor';

function App() {
  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        width: '500px',
        height: '500px', 
        overflow: 'hidden' 
      }}>
        <FaceDetectionComponent />
      </div>
      <SpeakingTest />
    </>
  );
}

export default App;
