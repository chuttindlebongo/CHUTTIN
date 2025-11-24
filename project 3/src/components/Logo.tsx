interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { container: 'text-lg', bolt: 'w-3 h-3' },
  md: { container: 'text-2xl', bolt: 'w-4 h-4' },
  lg: { container: 'text-3xl', bolt: 'w-5 h-5' },
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <span className={`font-semibold tracking-tight inline-flex items-center ${sizes.container} ${className}`}>
      Chu
      <svg
        viewBox="0 0 24 24"
        fill="#FFD700"
        className={`${sizes.bolt} inline-block mx-0.5`}
        style={{ transform: 'translateY(-0.5px)' }}
      >
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
      tin
    </span>
  );
}
