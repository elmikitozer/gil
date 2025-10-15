export {};

declare global {
  interface Window {
    storyblok?: {
      init: () => void;
      on?: (event: string | string[], cb: (...args: unknown[]) => void) => void;
      off?: (event: string | string[], cb: (...args: unknown[]) => void) => void;
    };
  }
}

// Allow importing CSS (and CSS modules) without TS errors
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.css';
