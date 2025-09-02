"use client"
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import * as animationData from './loading.json'; // Import your Lottie animation
import { Fade } from '@mui/material'; // Ensure Fade is correctly imported

const Loading = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the loading time as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={isLoading} timeout={500}>
      <div className="loading-container">
        <Lottie 
          animationData={animationData} 
          loop={true}
          autoplay={true}
          style={{ height: 100, width: 100 }}
        />
      </div>
    </Fade>
  );
};

export default Loading;
