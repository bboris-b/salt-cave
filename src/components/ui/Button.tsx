'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'ghost'

const variantClass: Record<Variant, string> = {
  solid:
    'rounded-[100px] bg-[var(--accent-cta)] px-6 py-2.5 font-sans text-sm font-medium text-cave-black transition-colors duration-300 hover:bg-[var(--accent-cta-hover)]',
  outline:
    'rounded-[100px] border border-[var(--salt-pink)] bg-transparent px-6 py-2.5 font-sans text-sm font-medium text-[var(--salt-pink)] transition-colors duration-300 hover:bg-[var(--salt-pink)] hover:text-cave-black',
  ghost:
    'rounded-[100px] bg-transparent px-4 py-2 font-sans text-sm font-normal text-text-secondary transition-colors duration-300 hover:text-text-primary',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', className = '', type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={`${variantClass[variant]} ${className}`.trim()} {...rest} />
})
