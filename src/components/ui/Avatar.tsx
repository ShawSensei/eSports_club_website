import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<AvatarSize, { px: number; className: string }> = {
  xs: { px: 24, className: 'h-6 w-6 text-xs' },
  sm: { px: 32, className: 'h-8 w-8 text-xs' },
  md: { px: 40, className: 'h-10 w-10 text-sm' },
  lg: { px: 56, className: 'h-14 w-14 text-base' },
  xl: { px: 80, className: 'h-20 w-20 text-xl' },
}

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { px, className: sizeClass } = sizeMap[size]
  const initial = name?.[0]?.toUpperCase() ?? '?'

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? 'Avatar'}
        width={px}
        height={px}
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold',
        'bg-[var(--accent-secondary)] text-white',
        sizeClass,
        className
      )}
    >
      {initial}
    </div>
  )
}
