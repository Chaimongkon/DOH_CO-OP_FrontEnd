// components/Slideshow.js
import React from 'react';
import styles from './Slideshow.module.css';
import CheckSeoScore from '../../layout/application/HomeApplication';

const Slideshow = () => {
  return (
    <div className={styles.slideshow}>
      <div className={styles.slide}>
        <div className={styles.slideContent}>
          <div className={styles.slideText}>
            <h2>Rank On Top & Stay On Top With SEO Crack</h2>
            <p>
              There are many variations of passages of Lorem Ipsum available, but the majority have
              suffered alteration in some form, by injected humour, or randomised sage of Lorem Ipsum,
              you need to be sure there isn't anything.
            </p>
            <button className={styles.learnMoreButton}>Learn More</button>
          </div>
          <div className={styles.slideImage}>
            {/* Add your image or any other content here */}
          </div>
        </div>
      </div>
      <CheckSeoScore />
    </div>
  );
};

export default Slideshow;
