import React from "react";
import styles from "./Header.module.css";

interface SubHeaderProps {
  menuName: string;
}

function SubHeader({ menuName }: SubHeaderProps) {
  return (
    <div>
      <section className={`bg-pentagon py-4 ${styles.bgPentagon}`}>
        <div className="container py-3">
          <div className="row d-flex align-items-center gy-4">
            <div className="col-md-7 col-12">
              <h1 className={`h2 mb-0 text-uppercase ${styles.textSm}`}>
                {menuName}
              </h1>
            </div>
            <div className="col-md-5 col-12">
              {/* Breadcrumb */}
              <ol className={`text-sm2 justify-content-start justify-content-md-end mb-0 breadcrumb ${styles.textSm}`}>
                <li className="breadcrumb-item">
                  <a className="text-uppercase" href="/">
                    หน้าหลัก
                  </a>
                </li>
                <li className="breadcrumb-item text-uppercase active">
                  {menuName}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Memoize SubHeader to prevent unnecessary re-renders when menuName doesn't change
export default React.memo(SubHeader);
