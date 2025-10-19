"use client";

export default function ThemedPage({ children, className = "" }) {
  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)' 
      }}
    >
      {children}
    </div>
  );
}




