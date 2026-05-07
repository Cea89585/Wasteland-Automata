const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

export const warn = (...args: any[]) => {
  if (DEBUG) console.warn(...args);
};

export const error = (...args: any[]) => {
  // Always log errors
  console.error(...args);
};

export default { log, warn, error };
