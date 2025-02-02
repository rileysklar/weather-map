export const glassStyles = {
  background: 'bg-black/25',
  border: 'border border-white/20',
  blur: 'backdrop-blur-md',
  text: 'text-white',
  hover: 'hover:bg-black/40',
  focus: 'focus:ring-2 focus:ring-blue-500 focus:outline-none',
  active: 'active:bg-black/30',
  disabled: 'disabled:bg-black/10 disabled:text-white/50',
  card: {
    background: 'bg-black/20',
    border: 'border border-white/10',
    divider: 'border-white/10',
    blur: 'backdrop-blur-lg',
    shadow: 'shadow-xl shadow-black/10',
    hover: 'hover:bg-black/30',
  },
  sheet: {
    background: 'bg-black/20',
    border: 'border-r border-white/10',
    divider: 'border-white/10',
    blur: 'backdrop-blur-lg',
    shadow: 'shadow-xl shadow-black/10',
  },
  input: {
    background: 'bg-white',
    border: 'border border-slate-200',
    blur: '',
    text: 'text-slate-900 placeholder:text-slate-500',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:outline-none',
    hover: 'hover:bg-white/90',
  }
} as const;

export const glassClassName = `${glassStyles.background} ${glassStyles.border} ${glassStyles.blur} ${glassStyles.text}`;

export const glassCardClassName = `${glassStyles.card.background} ${glassStyles.card.border} ${glassStyles.card.blur} ${glassStyles.text} ${glassStyles.card.shadow}`;

export const glassInputClassName = `${glassStyles.input.background} ${glassStyles.input.border} ${glassStyles.input.blur} ${glassStyles.input.text} ${glassStyles.input.focus} ${glassStyles.input.hover}`;

export const glassSheetClassName = `${glassStyles.sheet.background} ${glassStyles.sheet.border} ${glassStyles.sheet.blur} ${glassStyles.text} ${glassStyles.sheet.shadow}`; 