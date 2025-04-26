// Helper function to get auth headers with token for API requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Check if user is logged in
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Log user out
export const logout = () => {
  localStorage.removeItem('authToken');
  // You can also clear other user data from localStorage if needed
};

// Determine if user is a Google user based on profile attributes
export const isGoogleUser = (user: any) => {
  return !!user && !!user.profilePicture && !!user.emailVerified;
}; 