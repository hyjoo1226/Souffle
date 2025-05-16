declare module 'react-katex' {
  import * as React from 'react';

  export interface MathProps {
    math: string;
  }

  export const InlineMath: React.FC<MathProps>;
  export const BlockMath: React.FC<MathProps>;
}
