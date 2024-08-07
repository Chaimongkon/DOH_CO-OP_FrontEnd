"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import MenuItems, { MenuItemType, SectionType, ColumnType } from "./MenuItems";
import MenuItem from "./MenuItem";
import styles from "./Header.module.css"; // Import the CSS module

interface HeaderProps {
  setMenuName: (name: string) => void;
}

function Header({ setMenuName }: HeaderProps) {
  const [isSticky, setSticky] = useState(false);

  const handleScroll = () => {
    const scrolled = window.scrollY > 0;
    setSticky(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenuClick = (name: string) => {
    setMenuName(name);
  };

  return (
    <>
      <header
        className={`${styles.navHolder} ${
          isSticky ? `${styles.makeSticky} ${styles.isFixed}` : ""
        }`}
      >
        <div
          className="navbar navbar-light bg-white navbar-expand-lg py-0"
          id="navbar"
        >
          <div className="container py-3 py-lg-0 px-lg-0">
            <Link href="/" legacyBehavior>
              <a className="navbar-brand" onClick={() => handleMenuClick("Home")}>
                <img
                  className="d-none d-md-inline-block"
                  src="/image/logo.png"
                  alt="Universal logo"
                />
                <img
                  className="d-inline-block d-md-none"
                  src="/image/logo-small.png"
                  alt="Universal logo"
                />
              </a>
            </Link>
            <button
              className="navbar-toggler text-warning border-warning collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navigationCollapse"
              aria-controls="navigationCollapse"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="sr-only">Toggle navigation</span>
              <i className="fas fa-align-justify"></i>
            </button>
            <div className="collapse navbar-collapse" id="navigationCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {MenuItems.map((item: MenuItemType, index: number) =>
                  item.navlabel ? (
                    <li key={index} className="nav-item nav-label">
                      <span className="nav-link-sub py-2 text-uppercase">
                        {item.title}
                      </span>
                    </li>
                  ) : item.dropdown ? (
                    <li key={index} className="nav-item dropdown menu-large">
                      <a
                        className="nav-link dropdown-toggle"
                        id="featuresMegamenu"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {item.title}
                      </a>
                      <ul
                        className="dropdown-menu megamenu p-4"
                        style={{
                          width: `${(item.columns?.length || 0) * 420}px`,
                        }}
                        aria-labelledby="featuresMegamenu"
                      >
                        <li>
                          <div className="row">
                            {item.columns?.map(
                              (column: ColumnType, colIndex: number) => (
                                <div
                                  key={colIndex}
                                  className={
                                    colIndex === 0
                                      ? styles.firstColumn
                                      : styles.otherColumn
                                  }
                                  style={
                                    colIndex === 0
                                      ? { width: "450px", height: "auto" }
                                      : { width: "280px", height: "auto" }
                                  }
                                >
                                  {column.sections.map(
                                    (
                                      section: SectionType,
                                      secIndex: number
                                    ) => (
                                      <div key={secIndex}>
                                        {section.imageSrc && (
                                          <div className="col-lg-12">
                                            <img
                                              className={`img-fluid d-none d-lg-block ${styles.customImgSize}`}
                                              src={section.imageSrc}
                                              alt=""
                                              style={
                                                colIndex === 0
                                                  ? {
                                                      width: "100%",
                                                      height: "100%",
                                                    }
                                                  : {}
                                              }
                                            />
                                          </div>
                                        )}
                                        {section.subheader && (
                                          <h5 className="text-dark text-uppercase pb-2 border-bottom">
                                            {section.subheader}
                                          </h5>
                                        )}
                                        {section.items && (
                                          <ul className="list-unstyled mb-3">
                                            {section.items.map(
                                              (subItem, subIndex) => (
                                                <MenuItem
                                                  key={subIndex}
                                                  title={subItem.title}
                                                  href={subItem.href}
                                                  className="nav-link-sub py-2 text-uppercase"
                                                  onClick={() =>
                                                    handleMenuClick(
                                                      subItem.title
                                                    )
                                                  }
                                                />
                                              )
                                            )}
                                          </ul>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </li>
                      </ul>
                    </li>
                  ) : (
                    <MenuItem
                      key={index}
                      title={item.title}
                      href={item.href || "/"} // Provide a default value or handle undefined href
                      className={
                        item.title === "ติดต่อเรา"
                          ? "nav-link toggle"
                          : "nav-link-sub py-2 text-uppercase"
                      }
                      onClick={() => handleMenuClick(item.title)}
                    />
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
