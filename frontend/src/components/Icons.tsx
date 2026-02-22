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

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
)

export const BoxIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
    <path d="M3.5 7.5V16.5L12 21l8.5-4.5V7.5" />
    <path d="M12 12v9" />
  </svg>
)

export const CartIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4h2l2.2 10.5h11.6L21 7H6.2" />
  </svg>
)

export const FileIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </svg>
)

export const DollarIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 3v18" />
    <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" />
  </svg>
)

export const ShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 3 5 6v6c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const BellIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M15 17H9a3 3 0 0 0 6 0Z" />
    <path d="M18 16H6c1.3-1.3 2-3 2-5V9a4 4 0 1 1 8 0v2c0 2 0.7 3.7 2 5Z" />
  </svg>
)

export const BoltIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />
  </svg>
)

export const MenuIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...baseProps}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const PlusIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const CloseIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const UsersIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="10" r="2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M14 19a4 4 0 0 1 7 0" />
  </svg>
)

export const ClockIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
)

export const ChartIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16v-3M12 16V9M16 16V6" />
  </svg>
)

export const TrendingUpIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M3 17 10 10l4 4 7-7" />
    <path d="M16 7h5v5" />
  </svg>
)

export const TrendingDownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M3 7 10 14l4-4 7 7" />
    <path d="M16 17h5v-5" />
  </svg>
)

export const AlertIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 9v5M12 17h.01" />
  </svg>
)

export const DownloadIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M12 4v10" />
    <path d="m8 10 4 4 4-4" />
    <path d="M4 20h16" />
  </svg>
)

export const EyeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
)

export const EditIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...baseProps}>
    <path d="M3 21h6l10-10a2.1 2.1 0 0 0-3-3L6 18l-3 3Z" />
  </svg>
)

export const CheckCircleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
)

export const XCircleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </svg>
)

export const ThermometerIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="M10 6a2 2 0 1 1 4 0v7.5a4 4 0 1 1-4 0V6Z" />
    <path d="M12 10v5" />
  </svg>
)

export const SparklesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <path d="m12 3 1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3Z" />
    <path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
  </svg>
)

export const BadgeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...baseProps}>
    <circle cx="12" cy="9" r="6" />
    <path d="m9.5 14.5-1 6L12 18l3.5 2.5-1-6" />
  </svg>
)
