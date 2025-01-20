import React, { useRef, useEffect, useState } from "react";

export function Webcam({ lastFrame, setLastFrame }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const captureIntervalRef = useRef(null);

  // Setup webcam
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    if (!isStreaming) {
      setupCamera();
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current); 
      }
    };
  }, [isStreaming]);

  // Capture frame periodically
  useEffect(() => {
    if (isStreaming && videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      
      captureIntervalRef.current = setInterval(() => {
        context.drawImage(videoRef.current, 0, 0, 400, 300);
        const dataUrl = canvasRef.current.toDataURL();  

        if (dataUrl !== lastFrame) {
          setLastFrame(dataUrl); 
        }
      }, 100);

      return () => {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
      };
    }
  }, [isStreaming, setLastFrame, lastFrame]);

  return (
    <div className="relative">
      <video  ref={videoRef} autoPlay playsInline className="rounded-lg w-[28rem] mx-auto shadow-md w-full" />
      <canvas ref={canvasRef} width={400} height={300} className="hidden" />
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">Loading webcam...</p>
        </div>
      )}
    </div>
  );
}
