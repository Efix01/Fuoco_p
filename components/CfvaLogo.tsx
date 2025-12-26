
import React from 'react';
import logo from '../assets/logo.png';

interface LogoProps {
  className?: string;
}

const CfvaLogo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <img
      src={logo}
      alt="CFVA Logo"
      className={`object-contain ${className}`}
    />
  );
};

export default CfvaLogo;
