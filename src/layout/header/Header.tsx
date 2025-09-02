"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useMenuItems, {
  MenuItemType,
  SectionType,
  ColumnType,
} from "./MenuItems";
import MenuItem from "./MenuItem";
import styles from "./Header.module.css"; // Import the CSS module

interface HeaderProps {
  setMenuName: (name: string) => void;
}

function Header({ setMenuName }: HeaderProps) {
  const [isSticky, setSticky] = useState(false);
  const menuItems = useMenuItems(); // Call the hook to get the menu items

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
        style={{ position: "relative", zIndex: 100 }}
      >
        <div
          className="navbar navbar-light bg-white navbar-expand-lg py-0"
          id="navbar"
        >
          <div className="container py-3 py-lg-0 px-lg-0">
            <Link href="/" className="navbar-brand" onClick={() => handleMenuClick("Home")}>
              <Image
                className="d-none d-md-inline-block"
                src="/image/logo.png"
                alt="DOH Cooperative logo"
                width={300}
                height={60}
                priority
              />
              <Image
                className="d-inline-block d-md-none"
                src="/image/logo-small.png"
                alt="DOH Cooperative logo small"
                width={120}
                height={60}
                priority
              />
            </Link>
            <button
              className="navbar-toggler text-warning border-warning collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navigationCollapse"
              aria-controls="navigationCollapse"
              aria-expanded="false"
              aria-label="เปิด/ปิดเมนูนำทาง"
            >
              <span className="sr-only">Toggle navigation</span>
              <i className="fas fa-align-justify"></i>
            </button>
            <div className="collapse navbar-collapse" id="navigationCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                {menuItems.map((item: MenuItemType, index: number) =>
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
                        id={`dropdown-${index}`}
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        aria-label={`เปิดเมนู ${item.title}`}
                      >
                        {item.title}
                      </a>
                      <ul
                        className="dropdown-menu megamenu p-4"
                        style={{
                          width: `${(item.columns?.length || 0) * 420}px`,
                        }}
                        aria-labelledby={`dropdown-${index}`}
                        role="menu"
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
                                            <Image
                                              className={`img-fluid d-none d-lg-block ${styles.customImgSize}`}
                                              src={section.imageSrc}
                                              alt={`Menu section image for ${section.subheader || 'navigation'}`}
                                              width={200}
                                              height={150}
                                              style={
                                                colIndex === 0
                                                  ? {
                                                      width: "100%",
                                                      height: "auto",
                                                    }
                                                  : { width: "100%", height: "auto" }
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
