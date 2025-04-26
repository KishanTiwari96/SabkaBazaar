import  { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface StateContextType {
  // Add any properties needed for the state context
  // This is a placeholder since we don't know the exact implementation
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
}

// Create the context with default values
const StateContext = createContext<StateContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
});

// Provider component
export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (item: any) => {
    setCart(prevCart => [...prevCart, item]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  return (
    <StateContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </StateContext.Provider>
  );
};

// Custom hook for using the context
export const useStateContext = () => useContext(StateContext); 