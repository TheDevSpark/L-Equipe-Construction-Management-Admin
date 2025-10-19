"use client";

export default function ThemedInput({ 
  className = "", 
  style = {},
  ...props 
}) {
  return (
    <input
      className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      style={{
        backgroundColor: 'var(--input)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
        ...style
      }}
      {...props}
    />
  );
}




