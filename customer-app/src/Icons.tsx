import React from 'react'

type IconProps = {
  className?: string
}

const baseProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const MenuIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const BellIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M15 17H9a3 3 0 0 0 6 0Z" />
    <path d="M18 16H6c1.3-1.3 2-3 2-5V9a4 4 0 1 1 8 0v2c0 2 0.7 3.7 2 5Z" />
  </svg>
)

export const BoxIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
    <path d="M3.5 7.5V16.5L12 21l8.5-4.5V7.5" />
    <path d="M12 12v9" />
  </svg>
)

export const FileIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </svg>
)

export const UsersIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="10" r="2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M14 19a4 4 0 0 1 7 0" />
  </svg>
)
