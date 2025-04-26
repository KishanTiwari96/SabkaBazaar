import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface User {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  emailVerified?: boolean;
  address?: any;
  isAdmin?: boolean;
  createdAt?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    // Check if there's a token in localStorage before making the request
    const token = localStorage.getItem('authToken');
    if (token) {
      axios
        .get(`${BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.user) {
            // Ensure profilePicture is properly handled
            const userData = res.data.user;

            // Create user object with all fields from response
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              profilePicture: userData.profilePicture || null,
              emailVerified: userData.emailVerified || false,
              address: userData.address || null,
              isAdmin: userData.isAdmin || false,
              createdAt: userData.createdAt || null
            });

            console.log('User loaded from token:', {
              name: userData.name,
              email: userData.email,
              hasProfilePic: !!userData.profilePicture
            });
          } else {
            setUser(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setUser(null);
        })
        .finally(() => {
          setLoading(false); // Done loading
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      } catch (error) {
        console.error('Failed to parse recently viewed products', error);
      }
    }
  }, []);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      // Remove product if it already exists
      const filtered = prev.filter(item => item.id !== product.id);
      // Add to beginning of array, limit to 8 items
      const updated = [product, ...filtered].slice(0, 8);
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        loading,
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
