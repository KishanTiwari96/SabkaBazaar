import { useEffect, useState } from 'react'
import axios from 'axios'
import { StarRatingInput } from './StarRatingInput'
import { StaticStarRating } from './StaticStarRating'
import { BACKEND_URL } from '../config'
import { formatDistanceToNow } from 'date-fns'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await axios.get(`${BACKEND_URL}/reviews/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setReviews(res.data.reviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const userHasReviewed = reviews.some(r => r.user.id === currentUser?.id)

  const handleSubmit = async () => {
    if (!comment) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('authToken')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      if (editId) {
        await axios.put(
          `${BACKEND_URL}/reviews/${editId}`,
          { rating, comment },
          config
        )
      } else {
        await axios.post(
          `${BACKEND_URL}/reviews/${productId}`,
          { rating, comment },
          config
        )
      }

      setComment('')
      setRating(5)
      setEditId(null)
      fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (review: Review) => {
    setEditId(review.id)
    setRating(review.rating)
    setComment(review.comment)
    
    // Scroll to the review form
    setTimeout(() => {
      const reviewForm = document.getElementById('review-form')
      if (reviewForm) {
        reviewForm.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      await axios.delete(`${BACKEND_URL}/reviews/${id}`, config)
      setShowConfirmDelete(null)
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const cancelEdit = () => {
    setEditId(null)
    setRating(5)
    setComment('')
  }

  // Filter by rating
  const filterByRating = (targetRating: number | null) => {
    setActiveFilter(targetRating)
  }

  // Get rating stats
  const ratingStats = [5, 4, 3, 2, 1].map(ratingValue => {
    const count = reviews.filter(r => Math.floor(r.rating) === ratingValue).length
    const percentage = reviews.length ? (count / reviews.length) * 100 : 0
    return { rating: ratingValue, count, percentage }
  })

  // Average rating
  const averageRating = reviews.length
    ? reviews.reduce((total, r) => total + r.rating, 0) / reviews.length
    : 0

  let filteredReviews = [...reviews]
  
  // Apply rating filter
  if (activeFilter !== null) {
    filteredReviews = filteredReviews.filter(r => Math.floor(r.rating) === activeFilter)
  }
  
  // Apply sort
  const sortedReviews = filteredReviews.sort((a, b) =>
    sortBy === 'rating' 
      ? b.rating - a.rating 
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Get first letters of name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Review summary section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Customer Reviews</h3>
            <div className="flex items-center mb-1">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-2">
                {averageRating.toFixed(1)}
              </span>
              <StaticStarRating rating={averageRating} />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Based on {reviews.length} reviews</p>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-1 sm:space-y-2">
              {ratingStats.map((stat) => (
                <div key={stat.rating} className="flex items-center">
                  <button 
                    onClick={() => filterByRating(activeFilter === stat.rating ? null : stat.rating)}
                    className={`flex items-center min-w-24 sm:min-w-28 ${activeFilter === stat.rating ? 'font-semibold text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <span className="text-xs sm:text-sm mr-1 sm:mr-2">{stat.rating} stars</span>
                    <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mr-1 sm:mr-2">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{stat.count}</span>
                  </button>
                </div>
              ))}
            </div>
            {activeFilter !== null && (
              <div className="mt-3 sm:mt-4">
                <button 
                  onClick={() => setActiveFilter(null)}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review form */}
      {currentUser && (!userHasReviewed || editId) && (
        <div id="review-form" className="p-4 sm:p-6 border-b bg-white">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-lg mb-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              {editId ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Your Rating</label>
                <StarRatingInput value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Your Review</label>
                <textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                {editId && (
                  <button 
                    onClick={cancelEdit}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleSubmit} 
                  disabled={!comment || isSubmitting}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editId ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      {editId ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sorting options */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 border-b gap-2 sm:gap-0">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            {sortedReviews.length === 0 ? 'No reviews yet' : 
              `${sortedReviews.length} ${sortedReviews.length === 1 ? 'Review' : 'Reviews'}`}
            {activeFilter !== null && ` with ${activeFilter} stars`}
          </h2>
        </div>
        <div className="flex items-center">
          <label className="text-xs sm:text-sm text-gray-600 mr-2">Sort by:</label>
          <select 
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')} 
            value={sortBy}
            className="border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="date">Most Recent</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews list */}
      <div className="divide-y">
        {isLoading ? (
          <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm sm:text-base text-gray-600">Loading reviews...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">Be the first to share your experience with this product</p>
            {currentUser && !userHasReviewed && (
              <button 
                onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Write a Review
              </button>
            )}
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex">
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                    {getInitials(review.user.name)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-0">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center gap-2">
                        <StaticStarRating rating={review.rating} />
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    {currentUser?.id === review.user.id && (
                      <div className="flex space-x-2 mt-1 sm:mt-0">
                        <button 
                          onClick={() => handleEdit(review)} 
                          className="text-indigo-600 hover:text-indigo-800 transition-colors text-xs sm:text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => setShowConfirmDelete(review.id)} 
                          className="text-red-600 hover:text-red-800 transition-colors text-xs sm:text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-700 whitespace-pre-line">
                    {review.comment}
                  </div>
                </div>
              </div>

              {/* Delete confirmation */}
              {showConfirmDelete === review.id && (
                <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-red-700 mb-2 sm:mb-3">Are you sure you want to delete this review?</p>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setShowConfirmDelete(null)}
                      className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
