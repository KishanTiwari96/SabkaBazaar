import Footer from "../components/Footer"
import { AppBar } from "../components/AppBar"
import { CategoryGrid } from "../components/CategoriesGrid"
import ImageSlider from "../components/ImageSlider"
import BestSeller from "../components/BestSeller"

export const Home = () => {
    return <div className="">
        <AppBar></AppBar>
        <ImageSlider></ImageSlider>
        <CategoryGrid ></CategoryGrid>
        <BestSeller></BestSeller>
        <Footer></Footer>
    </div>
}