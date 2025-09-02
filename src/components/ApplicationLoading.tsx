import React from 'react';
import Lottie from 'lottie-react';
import { LoadingComponentProps } from '@/types';

const ApplicationLoading: React.FC<LoadingComponentProps> = ({ animationData }) => (
  <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <Lottie 
      animationData={animationData} 
      loop={true} 
      autoplay={true} 
      style={{ height: 150, width: 150 }} 
    />
  </div>
);

export default ApplicationLoading;