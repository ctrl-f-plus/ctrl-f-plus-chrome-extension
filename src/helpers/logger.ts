// src/helpers/logger.ts

export default function log(
  // message: string
  // level?: 'info' | 'warn' | 'error' = 'info',
  ...messages: any[]
) {
  if (process.env.NODE_ENV === 'development') {
    // console[level](message);

    // eslint-disable-next-line no-console
    console.log(...messages);
  }
}
