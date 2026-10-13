import React from 'react';

interface DaarulAbidinLogoProps {
  className?: string;
  size?: number;
}

export const DaarulAbidinLogo: React.FC<DaarulAbidinLogoProps> = ({
  className = '',
  size = 56,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={`shrink-0 drop-shadow-xs select-none ${className}`}
    >
      {/* Outer Green 8-Pointed Star */}
      <path
        d="M 250,20 
           L 305,85 L 395,45 L 395,145 L 485,185 L 435,265 L 485,345 L 395,385 L 395,485 L 305,445 L 250,510 
           L 195,445 L 105,485 L 105,385 L 15,345 L 65,265 L 15,185 L 105,145 L 105,45 L 195,85 Z"
        fill="none"
        stroke="#047857"
        strokeWidth="14"
        strokeLinejoin="round"
      />

      {/* Inner Blue 8-Pointed Star */}
      <path
        d="M 250,42 
           L 298,98 L 378,64 L 378,148 L 454,182 L 412,250 L 454,318 L 378,352 L 378,436 L 298,402 L 250,458 
           L 202,402 L 122,436 L 122,352 L 46,318 L 88,250 L 46,182 L 122,148 L 122,64 L 202,98 Z"
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="12"
        strokeLinejoin="round"
      />

      {/* Crescent Moon and Star (Green) */}
      <g transform="translate(250, 85)" fill="#047857">
        <polygon points="0,-32 7,-16 24,-16 11,-5 16,11 0,1 -16,11 -11,-5 -24,-16 -7,-16" />
        <path d="M 0,-8 A 22 22 0 1 1 0,36 A 28 28 0 1 0 0,-8 Z" />
      </g>

      {/* Open Quran on Rehal (Wooden Stand) */}
      <g
        transform="translate(250, 215)"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M -75,65 L 0,15 L 75,65 L 60,95 L 0,55 L -60,95 Z" fill="#1e293b" />
        <path d="M -15,75 L 0,85 L 15,75 L 0,45 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />

        <path d="M 0,0 C -45,-30 -85,-10 -95,20 C -90,45 -50,30 0,55 Z" fill="#ffffff" />
        <path d="M 0,0 C 45,-30 85,-10 95,20 C 90,45 50,30 0,55 Z" fill="#ffffff" />

        <path d="M 0,0 L 0,55" stroke="#1e293b" strokeWidth="7" />
        <line x1="-20" y1="12" x2="-75" y2="2" stroke="#1e293b" strokeWidth="4" />
        <line x1="-18" y1="22" x2="-80" y2="12" stroke="#1e293b" strokeWidth="4" />
        <line x1="-15" y1="32" x2="-75" y2="22" stroke="#1e293b" strokeWidth="4" />
        <line x1="-12" y1="42" x2="-65" y2="32" stroke="#1e293b" strokeWidth="4" />

        <line x1="20" y1="12" x2="75" y2="2" stroke="#1e293b" strokeWidth="4" />
        <line x1="18" y1="22" x2="80" y2="12" stroke="#1e293b" strokeWidth="4" />
        <line x1="15" y1="32" x2="75" y2="22" stroke="#1e293b" strokeWidth="4" />
        <line x1="12" y1="42" x2="65" y2="32" stroke="#1e293b" strokeWidth="4" />
      </g>

      {/* Typography: TAHFIDZ QUR'AN DAARUL ABIDIN */}
      <text
        x="250"
        y="345"
        fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontSize="28"
        fontWeight="900"
        fill="#1e293b"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        TAHFIDZ QUR’AN
      </text>
      <text
        x="250"
        y="380"
        fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontSize="28"
        fontWeight="900"
        fill="#1e293b"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        DAARUL ABIDIN
      </text>
    </svg>
  );
};
