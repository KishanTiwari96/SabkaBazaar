import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AppBar } from "../components/AppBar";
import { useNavigate } from "react-router-dom";

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCancel = async (orderId: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Temporarily update the status to 'REFUND_PROCESSING' before calling the backend
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "REFUND_PROCESSING" } : o
        )
      );

      const response = await axios.post(
        `${BACKEND_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {  message } = response.data;

      // After refund is initiated, update the status
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "REFUND_COMPLETED" } : o
        )
      );

      alert(message || "Order cancelled and refund initiated!");
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "PENDING" } : o // Revert status back to 'PENDING'
        )
      );
      alert(`Failed to cancel order: ${err.response?.data?.error || "Server error"}`);
    }
  };


  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data || (!res.data.user && !res.data.id)) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        try {
          const ordersRes = await axios.get(`${BACKEND_URL}/orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const ordersData = ordersRes.data.orders || ordersRes.data || [];
          setOrders(ordersData);
          setError(null);
        } catch (err: any) {
          console.error("Failed to load orders:", err);
          setError(`Failed to load orders: ${err.response?.data?.error || "Server error"}`);
        }
      } catch (err: any) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    };

    checkAuthentication();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUND_PROCESSING":
        return "bg-orange-100 text-orange-800";
      case "REFUND_COMPLETED":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <AppBar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">My Orders</h2>

        {error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600">You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
  <div>
    <div className="text-sm text-gray-500">Order ID</div>
    <div className="text-lg font-semibold break-words">{order.id}</div>
  </div>
  <div
    className={`w-fit text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}
  >
    {order.status}
  </div>
</div>


                <div className="border-t pt-4 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.imageUrl || "/placeholder.png"}
                        alt={item.product.name || "Product"}
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{item.product.name || "Unknown Product"}</span>
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-lg font-bold text-blue-700">Total: ₹{order.total || 0}</div>

                  {(order.status === "PENDING" || order.status === "PROCESSING") && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 font-medium px-4 py-2 rounded transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {order.status === "REFUND_COMPLETED" && (
                  <div className="mt-2 text-sm text-gray-600">
                    Refund has been successfully processed. The amount will be credited to your account within 5–7 business days depending on your bank/payment method.
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
