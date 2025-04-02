/* eslint-disable @typescript-eslint/no-namespace */
import type * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties{
    [index: `--${ string }`]: string;
  }
}

declare module 'react' {
  interface CSSProperties {
    [index: `--${ string }`]: string;
  }
}