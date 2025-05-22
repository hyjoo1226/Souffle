// components/common/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';    // 여러 개의 클래스명을 조건부로 깔끔하게 묶어 주는 아주 가벼운 유틸 함수

type Variant = 'outline' | 'solid' | 'sub';
type Size    = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  outline:  'bg-gray-0 border-1 border-primary-500 text-primary-500',
  solid:    'bg-primary-500 text-gray-0',
  sub:  'bg-primary-100 text-gray-800',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-[20px] py-[12px] caption-medium',
  md: 'px-[24px] py-[12px] body-medium',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'outline',
    size = 'md',
    className,
    children,
    ...rest
  },
  ref
) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'rounded-[10px]',      // 공통
        variantStyles[variant],                     // variant 별
        sizeStyles[size],                           // size 별
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';
