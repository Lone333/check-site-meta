/* eslint-disable @typescript-eslint/no-namespace */
import type * as React from 'react';

/**
 * This is required to allow custom CSS properties in React inline styles.
 */
declare module 'react' {
  interface CSSProperties {
    [index: `--${ string }`]: string;
  }
}