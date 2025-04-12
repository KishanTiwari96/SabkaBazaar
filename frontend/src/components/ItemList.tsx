
const Items = [
  {
    brand : "Apple",
    name : "Laptop",
    Price : "₹49,999",
    DiscountPrice : "₹44,999",
    rating : 4.5,
    image : "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Samsung",
    name : "Mobile",
    Price : "₹24,999",
    DiscountPrice : "₹21,999",
    rating : 3.7,
    image : "https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.}0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Fastrack",
    name : "Watch",
    Price : "₹5,999",
    DiscountPrice : "₹4,999",
    rating : 4.7,
    image : "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Fastrack",
    name : "Watch",
    Price : "₹5,999",
    DiscountPrice : "₹4,999",
    rating : 4.7,
    image : "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Apple",
    name : "Laptop",
    Price : "₹49,999",
    DiscountPrice : "₹44,999",
    rating : 4.5,
    image : "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Samsung",
    name : "Mobile",
    Price : "₹24,999",
    DiscountPrice : "₹21,999",
    rating : 3.7,
    image : "https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.}0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Fastrack",
    name : "Watch",
    Price : "₹5,999",
    DiscountPrice : "₹4,999",
    rating : 4.7,
    image : "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    brand : "Fastrack",
    name : "Watch",
    Price : "₹5,999",
    DiscountPrice : "₹4,999",
    rating : 4.7,
    image : "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
]

export const ItemList = () => {
    return <div className="grid grid-cols-4 p-8 mt-5">
      <div className='col-span-1'>
        <div className="">
          Fliter Logic
        </div>
        
      </div>
      <div className="col-span-3 relative">
        <h2 className="text-3xl font-bold mb-6">Item List</h2>
        <div className="">
        <div className="grid grid-cols-4 gap-3 ">
            {Items.map((item, index) => (
                <div key={index} className=" relative rounded-xl overflow-hidden shadow cursor-pointer mt-3 hover:scale-103 transition-transform duration-300 hover:shadow-lg">
                <img src={item.image} alt={item.name} className="p-3 w-60 h-60 object-cover" />
                    <h3 className="ml-5 text-gray-500 text-lg font-medium ">{item.brand}</h3>
                    <h3 className="ml-5 text-black text-md font-medium ">{item.name}</h3>
                    <h3 className="ml-5 text-black text-xl font-semibold line-through decoration-red-500">{item.Price}</h3>
                    <h3 className="ml-5 text-green-400 text-xl font-semibold ">{item.DiscountPrice}</h3>
              </div>
            ))}
        </div>
    </div>
    
      </div>
    
</div>
}