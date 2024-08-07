import React from 'react';
import Link from 'next/link';

interface MenuItemProps {
  title: string;
  href: string;
  className: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, href, className, onClick }) => (
  <li className="nav-item">
    <Link href={href} legacyBehavior>
      <a className={className} onClick={onClick}>{title}</a>
    </Link>
  </li>
);

export default MenuItem;
