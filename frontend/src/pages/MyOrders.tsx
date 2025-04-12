import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AppBar } from "../components/AppBar";
import { useNavigate } from 'react-router-dom';

export const MyOrdersPage = () => {
  interface Order {
    id: string;
    status: string;
    total: number;
    items: {
      id: string;
      product: {
        name: string;
        imageUrl: string;
      };
      quantity: number;
    }[];
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  const handleCancel = async (orderId: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;
  
    try {
      await axios.post(`${BACKEND_URL}/orders/${orderId}/cancel`, {}, { withCredentials: true });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order
        )
      );
    } catch (err) {
      console.error("Failed to cancel order", err);
      alert("Failed to cancel the order. Please try again.");
    }
  };
  
  useEffect(() => {
    // Check if the user is logged in before fetching orders
    const checkAuthentication = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/me`, { withCredentials: true });
        if (!res.data.user) {
          // If user is not authenticated, redirect to login page
          navigate("/login");
        } else {
          // Fetch orders if user is authenticated
          axios
            .get(`${BACKEND_URL}/orders`, { withCredentials: true })
            .then((res) => setOrders(res.data.orders))
            .catch((err) => console.error("Failed to load orders", err));
        }
      } catch (err) {
        // Redirect to login if error occurs (user is not logged in)
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <AppBar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">My Orders</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-600">You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="text-lg font-semibold">{order.id}</div>
                  </div>
                  <div
                    className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-lg font-bold text-blue-700">Total: ₹{order.total}</div>

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 font-medium px-4 py-2 rounded transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
