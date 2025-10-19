"use client";

export default function ThemedCard({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-lg p-6 transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)'
      }}
      {...props}
    >
      {children}
    </div>
  );
}
