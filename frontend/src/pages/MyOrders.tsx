import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { AppBar } from "../components/AppBar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export const MyOrdersPage = () => {
  interface Order {
    id: string;
    status: string;
    total: number;
    createdAt?: string; // Adding createdAt field for order date
    items: {
      id: string;
      product: {
        name: string;
        imageUrl: string;
        price?: number; // Adding price field for product price
      };
      quantity: number;
    }[];
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCancel = async (orderId: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    setProcessingOrderId(orderId);

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

      const { message } = response.data;

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
    } finally {
      setProcessingOrderId(null);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
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
        } finally {
          setIsLoading(false);
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUND_PROCESSING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "REFUND_COMPLETED":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "PROCESSING":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "SHIPPED":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case "DELIVERED":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "CANCELLED":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "REFUND_PROCESSING":
      case "REFUND_COMPLETED":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppBar />
      
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md overflow-hidden mb-8">
            <div className="px-6 py-8 md:px-10 text-white">
              <h1 className="text-3xl font-extrabold">My Orders</h1>
              <p className="mt-2 text-indigo-100">
                Track and manage your order history
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
                <p className="text-gray-600 mb-6 text-center">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
        ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 shadow-md hover:shadow-lg"
                >
                  Browse Products
                </button>
              </div>
            </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300"
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Order ID</div>
                        <div className="font-mono text-sm text-gray-700">{order.id}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className={`flex items-center space-x-1 px-3 py-1.5 border rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
  </div>
  </div>
</div>

                  <div className="px-6 py-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Order Items</h3>
                    <div className="space-y-4">
                  {order.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={item.product.imageUrl || "/placeholder.png"}
                        alt={item.product.name || "Product"}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.product.name || "Unknown Product"}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            {item.product.price && (
                              <p className="mt-1 text-xs font-medium text-gray-700">
                                Unit Price: ₹{item.product.price.toLocaleString('en-IN')}
                              </p>
                            )}
                      </div>
                    </div>
                  ))}
                    </div>
                </div>

                  <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Total</p>
                      <p className="text-xl font-bold text-indigo-600">₹{order.total.toLocaleString('en-IN')}</p>
                    </div>

                  {(order.status === "PENDING" || order.status === "PROCESSING") && (
                    <button
                      onClick={() => handleCancel(order.id)}
                        disabled={processingOrderId === order.id}
                        className="flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg transition duration-150 disabled:opacity-50"
                      >
                        {processingOrderId === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                      Cancel Order
                          </>
                        )}
                    </button>
                  )}
                </div>

                {order.status === "REFUND_COMPLETED" && (
                    <div className="px-6 py-4 bg-teal-50 border-t border-teal-100">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-700 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-teal-700">
                    Refund has been successfully processed. The amount will be credited to your account within 5–7 business days depending on your bank/payment method.
                        </p>
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      
      <Footer />
    </div>
  );
};
