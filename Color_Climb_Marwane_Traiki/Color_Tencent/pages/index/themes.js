/**
 * Theme System - Smooth Interpolated Color Transition
 */

const THEMES = {
  default: {
    name: 'Gradient',
    icon: '🌈',
    background: {
      top: (hue) => `hsl(${35 + hue * 0.2}, 70%, 45%)`,
      mid: (hue) => `hsl(${25 + hue * 0.2}, 65%, 32%)`,
      bottom: (hue) => `hsl(${15 + hue * 0.2}, 60%, 18%)`
    },
    // Smooth interpolation from orange (hue 40) to red (hue 0)
    // Instead of fixed colors, we interpolate based on block index
    colorStart: { h: 42, s: 88, l: 56 },  // Warm orange
    colorEnd: { h: 0, s: 78, l: 48 },     // Deep red
    ui: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      accent: '#FFD700'
    }
  },

  sunset: {
    name: 'Sunset',
    icon: '🌅',
    background: {
      top: (hue) => `hsl(${35 + hue * 0.25}, 80%, 52%)`,
      mid: (hue) => `hsl(${15 + hue * 0.25}, 70%, 38%)`,
      bottom: (hue) => `hsl(${355 + hue * 0.25}, 60%, 22%)`
    },
    colorStart: { h: 45, s: 90, l: 55 },
    colorEnd: { h: 350, s: 75, l: 45 },
    ui: {
      primary: '#fff5e6',
      secondary: 'rgba(255, 245, 230, 0.7)',
      accent: '#FF6B35'
    }
  },

  ocean: {
    name: 'Ocean',
    icon: '🌊',
    background: {
      top: (hue) => `hsl(${190 + hue * 0.15}, 70%, 48%)`,
      mid: (hue) => `hsl(${200 + hue * 0.15}, 65%, 32%)`,
      bottom: (hue) => `hsl(${210 + hue * 0.15}, 60%, 18%)`
    },
    colorStart: { h: 195, s: 80, l: 55 },
    colorEnd: { h: 220, s: 68, l: 45 },
    ui: {
      primary: '#e0f7fa',
      secondary: 'rgba(224, 247, 250, 0.7)',
      accent: '#00BCD4'
    }
  },

  candy: {
    name: 'Candy',
    icon: '🍬',
    background: {
      top: (hue) => `hsl(${330 + hue * 0.3}, 75%, 52%)`,
      mid: (hue) => `hsl(${310 + hue * 0.3}, 70%, 42%)`,
      bottom: (hue) => `hsl(${290 + hue * 0.3}, 65%, 28%)`
    },
    colorStart: { h: 340, s: 85, l: 60 },
    colorEnd: { h: 290, s: 70, l: 50 },
    ui: {
      primary: '#fce4ec',
      secondary: 'rgba(252, 228, 236, 0.7)',
      accent: '#E91E63'
    }
  },

  monochrome: {
    name: 'Mono',
    icon: '⚫',
    background: {
      top: () => `hsl(0, 0%, 32%)`,
      mid: () => `hsl(0, 0%, 20%)`,
      bottom: () => `hsl(0, 0%, 10%)`
    },
    colorStart: { h: 0, s: 0, l: 72 },
    colorEnd: { h: 0, s: 0, l: 48 },
    ui: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
      accent: '#888888'
    }
  }
};

const THEME_KEYS = Object.keys(THEMES);

function getTheme(name) {
  return THEMES[name] || THEMES.default;
}

function getThemeList() {
  return THEME_KEYS.map(key => ({
    key,
    name: THEMES[key].name,
    icon: THEMES[key].icon
  }));
}

// Smooth interpolation between start and end colors
function generateBlockColor(theme, index) {
  const t = getTheme(theme);
  const start = t.colorStart;
  const end = t.colorEnd;

  // Smooth transition over ~25 blocks, then cycle
  const maxBlocks = 25;
  const progress = Math.min(index / maxBlocks, 1);

  // Ease-in-out for smoother transition
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  // Interpolate hue (handle wrap-around for red)
  let hue;
  if (start.h > end.h && start.h - end.h > 180) {
    // Wrap around through 360
    hue = start.h + eased * (360 - start.h + end.h);
    if (hue >= 360) hue -= 360;
  } else if (end.h > start.h && end.h - start.h > 180) {
    hue = start.h - eased * (start.h + 360 - end.h);
    if (hue < 0) hue += 360;
  } else {
    hue = start.h + eased * (end.h - start.h);
  }

  const sat = start.s + eased * (end.s - start.s);
  const light = start.l + eased * (end.l - start.l);

  return { h: hue, s: sat, l: light };
}

module.exports = {
  THEMES,
  THEME_KEYS,
  getTheme,
  getThemeList,
  generateBlockColor
};
