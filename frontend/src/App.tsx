import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import { Product } from './pages/Product'
import { Cart } from './components/Cart'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { MyOrdersPage } from './pages/MyOrders'
import { OrderReview } from './components/OrderReview'
function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Home />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/order-review" element={<OrderReview />} />z
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App