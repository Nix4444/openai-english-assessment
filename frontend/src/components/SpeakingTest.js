import React, { useState, useRef } from 'react';
import './SpeakingTest.css'; 
import logo from './logo.png'; 
import loadingAnimation from './loading.gif'; 

const SpeakingTest = () => {
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [question, setQuestion] = useState('');
  const [userInput, setUserInput] = useState(''); 
  const [transcribedAnswer, setTranscribedAnswer] = useState(''); 
  const [analysisResult, setAnalysisResult] = useState(null);
  const [responseMode, setResponseMode] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1));
  };

  const startTest = async () => {
    setIsLoading(true);
    setUserInput('');
    setTranscribedAnswer('');
    setAnalysisResult(null);
    setResponseMode(null);

    const apiUrl = `http://127.0.0.1:5000/generateques?difficulty=${encodeURIComponent(difficulty.toLowerCase())}`;
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
      } else {
        console.error("API call failed:", response.status);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    }
    setIsLoading(false);
  };

  const startRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          setIsLoading(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await sendAudioToServer(audioBlob);
          setIsLoading(false);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        console.error("Audio recording is not supported by your browser.");
      }
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    try {
      const response = await fetch('http://127.0.0.1:5000/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setTranscribedAnswer(data.transcript);
        await analyzeAnswer(question, data.transcript);
      } else {
        console.error("Transcription API call failed:", response.status);
      }
    } catch (error) {
      console.error("Error sending audio to server:", error);
    }
  };

  const analyzeAnswer = async (question, answer) => {
    setIsLoading(true);
    const apiUrl = `http://127.0.0.1:5000/analyze?question=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}`;
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(JSON.stringify(data, null, 2));
      } else {
        console.error("Analysis API call failed:", response.status);
      }
    } catch (error) {
      console.error("Error analyzing answer:", error);
    }
    setIsLoading(false);
  };

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmitTypedResponse = () => {
    analyzeAnswer(question, userInput);
  };

  return (
    <div className="test-container">
      <img src={logo} alt="WordWave Logo" className="logo" />
      <h1 className="animated-heading">English Assessment with NLP</h1>

      {(isLoading) && (
        <div className="loading-container">
          <img src={loadingAnimation} alt="Loading..." className="loading-gif" />
        </div>
      )}

      <div className="controls-container">
        <div className="difficulty-selector">
          <button className="btn btn-secondary dropdown-toggle" type="button">
            {difficulty}
          </button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => handleDifficultyChange('easy')}>Easy</button></li>
            <li><button className="dropdown-item" onClick={() => handleDifficultyChange('medium')}>Medium</button></li>
            <li><button className="dropdown-item" onClick={() => handleDifficultyChange('hard')}>Hard</button></li>
          </ul>
        </div>

        <button type="button" className="btn btn-primary" onClick={startTest} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Start Test'}
        </button>

        {question && (
          <>
            <button className="btn btn-secondary" onClick={() => setResponseMode('type')}>Type Response</button>
            <button className="btn btn-info" onClick={startRecording} disabled={isLoading || (isRecording && responseMode === 'speak')}>
              {isRecording ? 'Stop Recording' : 'Speak Response'}
            </button>
          </>
        )}

        {responseMode === 'type' && (
          <button className="btn btn-primary" onClick={handleSubmitTypedResponse}>Submit</button>
        )}
      </div>

      {!isLoading && question && (
        <div className="question-container">
          <h2>Question:</h2>
          <p>{question}</p>
        </div>
      )}

      {responseMode === 'type' && (
        <textarea
        value={userInput}
        onChange={handleUserInput}
        className="typed-response-textarea"
        style={{ width: '100%', height: '200px', resize: 'vertical', padding: '10px' }}
      ></textarea>
      )}

      {!isLoading && transcribedAnswer && (
        <div className="transcribed-answer-container">
          <h2>Answer:</h2>
          <p>{transcribedAnswer}</p>
        </div>
      )}

      {!isLoading && analysisResult && (
        <div className="analysis-result-container">
          <h2>Analysis Result</h2>
          <pre>{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SpeakingTest;
