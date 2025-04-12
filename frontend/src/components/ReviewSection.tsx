import { useEffect, useState } from 'react'
import axios from 'axios'
import { StarRatingInput } from './StarRatingInput'
import { StaticStarRating } from './StaticStarRating'
import { BACKEND_URL } from '../config'


interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface Props {
  productId: string
  currentUser: {
    id: string
    name: string
  } | null
}

export default function ReviewSection({ productId, currentUser }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date')

  const fetchReviews = async () => {
    const res = await axios.get(`${BACKEND_URL}/reviews/${productId}`, { withCredentials: true })
    setReviews(res.data.reviews)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const userHasReviewed = reviews.some(r => r.user.id === currentUser?.id)

  const handleSubmit = async () => {
    if (!comment) return

    if (editId) {
      await axios.put(`${BACKEND_URL}/reviews/${editId}`, { rating, comment }, { withCredentials: true })
    } else {
      await axios.post(`${BACKEND_URL}/reviews/${productId}`, { rating, comment }, { withCredentials: true })
    }

    setComment('')
    setRating(5)
    setEditId(null)
    fetchReviews()
  }

  const handleEdit = (review: Review) => {
    setEditId(review.id)
    setRating(review.rating)
    setComment(review.comment)
  }

  const handleDelete = async (id: string) => {
    await axios.delete(`${BACKEND_URL}/reviews/${id}`, { withCredentials: true })
    fetchReviews()
  }

  const sortedReviews = [...reviews].sort((a, b) =>
    sortBy === 'rating' ? b.rating - a.rating : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <select onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')} className="border p-1 rounded">
          <option value="date">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      {currentUser && (!userHasReviewed || editId) && (
        <div className="mb-4 space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Rating:</label>
            <StarRatingInput value={rating} onChange={setRating} />
        </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border w-full p-2 rounded"
          />
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {editId ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      )}

      {sortedReviews.map((r) => (
        <div key={r.id} className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{r.user.name}</p>
              <StaticStarRating rating={r.rating} />

              <p>{r.comment}</p>
            </div>
            {currentUser?.id === r.user.id && (
              <div className="space-x-2">
                <button onClick={() => handleEdit(r)} className="text-blue-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
