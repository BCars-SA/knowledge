// Console colors helper
export const consoleColors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};

export const colorizeConsole = (
    color: string,
    text: string,
    bold = false,
): string => {
    const prefix = bold ? consoleColors.bright + color : color;
    return `${prefix}${text}${consoleColors.reset}`;
};
