import React from "react";

interface TopHeaderProps {
  className?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ className }) => {
  return (
    <div className={`top-bar py-22 ${className}`} id="topBar" style={{ background: "#555",  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
      <div className="container px-lg-0 text-light py-1">
        <div className="row d-flex align-items-center">
          <div className="col-md-6 d-md-block d-none">
            <p className="mb-0 text-xs1" />
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-md-end justify-content-between">
              <ul className="list-inline d-block d-md-none mb-0">
                <li className="list-inline-item">
                  <a className="text-xs" href="tel:026444633">
                    <i className="fa fa-phone" />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a className="text-xs" href="mailto:dohcoop@hotmail.com">
                    <i className="fa fa-envelope" />
                  </a>
                </li>
              </ul>
              <ul className="list-inline mb-0">
                <li className="list-inline-item">
                  <a
                    className="text-xs1 text-uppercase fw-bold text-reset"
                    href="https://doh.icoopsiam.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-user me-2" />
                    <span className="d-md-inline-block">
                      เข้าสู่ระบบสมาชิกออนไลน์
                    </span>
                  </a>
                </li>
              </ul>
              <ul className="list-inline mb-0 ms-lg-4">
                <li className="list-inline-item text-gray-600 m-0">
                  <a
                    className="text-xs social-link-hover"
                    href="https://www.facebook.com/profile.php?id=100062755236000"
                    title="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                </li>
                <li className="list-inline-item text-gray-600 m-0">
                  <a
                    className="text-xs social-link-hover"
                    href="https://lin.ee/hbQCmHe"
                    title="Line"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-line" />
                  </a>
                </li>
                <li className="list-inline-item text-gray-600 m-0">
                  <a
                    className="text-xs social-link-hover"
                    href="https://www.youtube.com/@dohcoop..0161/videos"
                    title="Youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-youtube" />
                  </a>
                </li>
                <li className="list-inline-item text-gray-600 m-0">
                  <a
                    className="text-xs social-link-hover"
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
