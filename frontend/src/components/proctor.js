import React, { useRef, useEffect, useState } from 'react';
import '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const FaceDetectionComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [alertActive, setAlertActive] = useState(false);
  let blazefaceModel;

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;

        return new Promise(resolve => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    const loadBlazefaceModel = async () => {
      blazefaceModel = await blazeface.load();
    };

    const detectFace = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      video.addEventListener('play', async () => {
        await loadBlazefaceModel();

        const checkInterval = setInterval(async () => {
          if (!blazefaceModel) {
            clearInterval(checkInterval);
            return;
          }

          try {
            const predictions = await blazefaceModel.estimateFaces(video);

            if (!predictions || !predictions.length) {
              if (!alertActive) {
                setAlertActive(true);
                alert('Face not detected. Press OK to acknowledge.');
              }
            } else {
              setAlertActive(false);
            }

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            predictions.forEach(prediction => {
              ctx.beginPath();
              ctx.rect(
                prediction.topLeft[0],
                prediction.topLeft[1],
                prediction.bottomRight[0] - prediction.topLeft[0],
                prediction.bottomRight[1] - prediction.topLeft[1]
              );
              ctx.lineWidth = 2;
              ctx.strokeStyle = 'red';
              ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
              ctx.stroke();
              ctx.fill();
            });
          } catch (error) {
            console.error('Error during face detection:', error);
          }
        }, 500); // Check every 0.5 seconds

        return () => clearInterval(checkInterval);
      });
    };

    const handleVideoPause = () => {
      setAlertActive(true);
      alert('Video paused. Press OK to acknowledge.');
    };

    startVideo().then(() => {
      detectFace();
      videoRef.current.addEventListener('pause', handleVideoPause);
    });

    return () => {
      // Cleanup logic if needed
      if (blazefaceModel) {
        blazefaceModel.dispose();
      }
      videoRef.current.removeEventListener('pause', handleVideoPause);
    };
  }, [alertActive]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: 720, height: 560 }} />
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {alertActive && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'blue', padding: '20px', color: 'white' }}>
          Irregular Activity Detected. Cheating Alert. Press Ok to continue.
        </div>
      )}
    </div>
  );
};

export default FaceDetectionComponent;