import { Star } from 'lucide-react'

type StaticStarRatingProps = {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

export const StaticStarRating = ({ rating, size = 'md' }: StaticStarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}
