import { useState } from 'react'
import { Star } from 'lucide-react'

type StarRatingInputProps = {
  value?: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export const StarRatingInput = ({ value = 0, onChange, disabled = false }: StarRatingInputProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hoveredStar !== null ? star <= hoveredStar : star <= value
        return (
          <Star
            key={star}
            onMouseEnter={() => !disabled && setHoveredStar(star)}
            onMouseLeave={() => !disabled && setHoveredStar(null)}
            onClick={() => !disabled && onChange(star)}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          />
        )
      })}
    </div>
  )
}
