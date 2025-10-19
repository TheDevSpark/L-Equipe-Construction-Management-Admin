// Utility functions for consistent theming across all components

export const getThemeStyles = (elementType = 'default') => {
  const baseStyles = {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    borderColor: 'var(--border)'
  };

  const elementStyles = {
    card: {
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)',
      borderColor: 'var(--border)'
    },
    input: {
      backgroundColor: 'var(--input)',
      color: 'var(--card-foreground)',
      borderColor: 'var(--border)'
    },
    button: {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
      borderColor: 'var(--border)'
    },
    sidebar: {
      backgroundColor: 'var(--sidebar)',
      color: 'var(--sidebar-foreground)',
      borderColor: 'var(--border)'
    },
    muted: {
      color: 'var(--muted-foreground)'
    },
    accent: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)'
    }
  };

  return elementStyles[elementType] || baseStyles;
};

export const applyThemeToElement = (element, themeType = 'default') => {
  const styles = getThemeStyles(themeType);
  Object.assign(element.style, styles);
};

// CSS classes for common themed elements
export const themedClasses = {
  container: 'transition-colors duration-300',
  card: 'rounded-lg p-6 transition-colors duration-300',
  input: 'w-full border rounded-lg px-3 py-2 transition-colors duration-300',
  button: 'px-4 py-2 rounded-lg font-medium transition-colors duration-300',
  text: {
    primary: 'transition-colors duration-300',
    muted: 'transition-colors duration-300',
    heading: 'transition-colors duration-300'
  }
};

// Helper function to create themed inline styles
export const createThemedStyle = (themeType, additionalStyles = {}) => ({
  ...getThemeStyles(themeType),
  ...additionalStyles
});




