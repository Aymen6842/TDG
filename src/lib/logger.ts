const config = {
  isDev: process.env.NODE_ENV === "development",
};

export const logger = {
  log: (...args: any) => {
    if (config.isDev) console.log(...args);
  },
  error: (...args: any) => {
    if (config.isDev) console.error(...args);
  },
  warn: (...args: any) => {
    if (config.isDev) console.warn(...args);
  },
  info: (...args: any) => {
    if (config.isDev) console.info(...args);
  },
  debug: (...args: any) => {
    if (config.isDev) console.debug(...args);
  },
};
