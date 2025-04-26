import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Home } from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import { Product } from './pages/Product'
import { Cart } from './components/Cart'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { MyOrdersPage } from './pages/MyOrders'
import { OrderReview } from './components/OrderReview'
import { Address } from './components/AddressForm'
import { Payment } from './components/Payment'
import { Profile } from './components/Profile'
import AllProducts from './pages/AllProducts'
import SearchResults from './pages/SearchResults'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Home />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/category/all" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/order-review" element={<OrderReview />} />
        <Route path="/address" element={<Address />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App