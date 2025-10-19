"use client";

export default function ThemedButton({ 
  children, 
  variant = "primary", 
  className = "", 
  onClick,
  ...props 
}) {
  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)'
        };
      case "secondary":
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)'
        };
      case "destructive":
        return {
          backgroundColor: 'var(--destructive)',
          color: 'var(--destructive-foreground)'
        };
      default:
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)'
        };
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${className}`}
      style={getButtonStyles()}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.target.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.target.style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  );
}




