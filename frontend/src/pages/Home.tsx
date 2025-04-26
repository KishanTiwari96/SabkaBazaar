import Footer from "../components/Footer"
import { AppBar } from "../components/AppBar"
import { CategoryGrid } from "../components/CategoriesGrid"
import ImageSlider from "../components/ImageSlider"
import BestSeller from "../components/BestSeller"
import RecentlyViewed from "../components/RecentlyViewed"

export const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <AppBar />
            
            {/* Hero Slider */}
            <section className="w-full">
                <ImageSlider />
            </section>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 sm:pb-16">
                {/* Category Section */}
                <CategoryGrid />
                
                {/* Recently Viewed Section */}
                <RecentlyViewed />
                
                {/* Best Sellers Section */}
                <BestSeller />
                
                {/* Feature Highlights */}
                <section className="my-10 sm:my-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800">Premium Quality</h3>
                                <p className="text-gray-600 text-xs sm:text-sm">Curated products from top brands</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800">Fast Delivery</h3>
                                <p className="text-gray-600 text-xs sm:text-sm">Get your order in 2-3 business days</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center sm:col-span-2 md:col-span-1">
                            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800">Secure Payments</h3>
                                <p className="text-gray-600 text-xs sm:text-sm">Multiple payment options available</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <Footer />
        </div>
    )
}