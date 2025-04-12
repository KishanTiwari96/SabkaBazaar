import { Star } from 'lucide-react'

type StaticStarRatingProps = {
  rating: number
}

export const StaticStarRating = ({ rating }: StaticStarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}
