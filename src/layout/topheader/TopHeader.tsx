import React from "react";
import styles from "./TopHeader.module.css";

interface TopHeaderProps {
  className?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ className }) => {
  return (
    <div className={`${styles.topBar} ${className || ''}`} id="topBar">
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={`${styles.colMd6} ${styles.hiddenMobile}`}>
            <p className={styles.textContent} />
          </div>
          <div className={styles.colMd6}>
            <div className={`${styles.flexContainer} ${styles.justifyContentMdEnd}`}>
              <ul className={`${styles.listInline} ${styles.mobileOnly}`}>
                <li className={styles.listInlineItem}>
                  <a className={styles.textXs} href="tel:026444633">
                    <i className="fa fa-phone" />
                  </a>
                </li>
                <li className={styles.listInlineItem}>
                  <a className={styles.textXs} href="mailto:dohcoop@hotmail.com">
                    <i className="fa fa-envelope" />
                  </a>
                </li>
              </ul>
              <ul className={styles.listInline}>
                <li className={styles.listInlineItem}>
                  <a
                    className={styles.textXs1}
                    href="https://doh.icoopsiam.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`fas fa-user ${styles.icon}`} />
                    <span className={styles.inlineSpan}>
                      เข้าสู่ระบบสมาชิกออนไลน์
                    </span>
                  </a>
                </li>
              </ul>
              <ul className={`${styles.listInline} ${styles.socialContainer}`}>
                <li className={`${styles.listInlineItem} ${styles.socialItem}`}>
                  <a
                    className={styles.socialLinkHover}
                    href="https://www.facebook.com/profile.php?id=100062755236000"
                    title="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                </li>
                <li className={`${styles.listInlineItem} ${styles.socialItem}`}>
                  <a
                    className={styles.socialLinkHover}
                    href="https://lin.ee/hbQCmHe"
                    title="Line"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-line" />
                  </a>
                </li>
                <li className={`${styles.listInlineItem} ${styles.socialItem}`}>
                  <a
                    className={styles.socialLinkHover}
                    href="https://www.youtube.com/@dohcoop..0161/videos"
                    title="Youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-youtube" />
                  </a>
                </li>
                <li className={`${styles.listInlineItem} ${styles.socialItem}`}>
                  <a
                    className={styles.socialLinkHover}
                    href="mailto:dohcoop@hotmail.com"
                    title="Email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-envelope" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
