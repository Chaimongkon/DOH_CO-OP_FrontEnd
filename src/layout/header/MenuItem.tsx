import React from 'react';
import Link from 'next/link';

interface MenuItemProps {
  title: string;
  href: string;
  className: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(({ title, href, className, onClick }) => (
  <li className="nav-item">
    <Link href={href} className={className} onClick={onClick}>
      {title}
    </Link>
  </li>
));

MenuItem.displayName = 'MenuItem';

export default MenuItem;
