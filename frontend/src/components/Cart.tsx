import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AppBar } from "./AppBar";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = localStorage.getItem("authToken"); // Fixed: Changed from "token" to "authToken"

    try {
      const res = await axios.get(`${BACKEND_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data.cart);
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("authToken"); // Fixed: Changed from "token" to "authToken"

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data.user) {
          navigate("/login");
        } else {
          fetchCart();
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const updateQuantity = async (id: string, quantity: number) => {
    const token = localStorage.getItem("authToken"); // Fixed: Changed from "token" to "authToken"

    try {
      await axios.put(
        `${BACKEND_URL}/cart/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const removeItem = async (id: string) => {
    const token = localStorage.getItem("authToken"); // Fixed: Changed from "token" to "authToken"

    try {
      await axios.delete(`${BACKEND_URL}/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("authToken"); // Fixed: Changed from "token" to "authToken"

    try {
      await axios.delete(`${BACKEND_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  const handlePlaceOrder = () => {
    navigate("/order-review", {
      state: {
        cartItems,
        total: calculateTotal(cartItems),
      },
    });
  };

  return (
    <div>
      <AppBar />
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4">
              {[...cartItems].reverse().map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center border p-4 rounded-lg shadow-sm gap-4"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full sm:w-24 sm:h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.product.name}</h3>
                    <p className="text-gray-500">₹{item.product.price}</p>
                    <div className="flex items-center mt-2 gap-2">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-200 rounded"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:underline sm:ml-4"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
              <button
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                onClick={handlePlaceOrder}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
              >
                Place Order (₹{calculateTotal(cartItems).toFixed(2)})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
};