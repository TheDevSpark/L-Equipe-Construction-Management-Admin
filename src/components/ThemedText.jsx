"use client";

export default function ThemedText({ 
  children, 
  variant = "primary", 
  className = "", 
  ...props 
}) {
  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return { color: 'var(--foreground)' };
      case "muted":
        return { color: 'var(--muted-foreground)' };
      case "card":
        return { color: 'var(--card-foreground)' };
      case "accent":
        return { color: 'var(--accent-foreground)' };
      default:
        return { color: 'var(--foreground)' };
    }
  };

  return (
    <span 
      className={`transition-colors duration-300 ${className}`}
      style={getTextStyle()}
      {...props}
    >
      {children}
    </span>
  );
}




