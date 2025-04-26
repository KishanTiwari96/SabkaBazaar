import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import ReviewSection from "../components/ReviewSection";
import { StaticStarRating } from "../components/StaticStarRating";
import { ProductSkeleton } from "../components/ProductSkeleton";
import Footer from "../components/Footer";
import { useUser } from "../components/UserContext";


interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  brand?: {
    name: string;
  };
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  images?: { url: string }[];
  category: string;
  avgRating?: number;
  reviews?: Review[];
  returnable?: boolean;
  model?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  material?: string;
  connectivity?: string;
  powerSource?: string;
  batteryLife?: string;
  os?: string;
  storage?: string;
  memory?: string;
  waterResistant?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  _id?: string;
}

interface SimilarProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  rating: number;
}

// Add this interface for structured product descriptions
interface ParsedDescription {
  main: string;
  keyFeatures: string[];
  specifications: Array<{key: string, value: string}>;
}

export const Product = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [reviewsLength, setReviewsLength] = useState(0);
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToRecentlyViewed } = useUser();

  const [isSticky, setIsSticky] = useState(true);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const specificationsRef = useRef<HTMLDivElement | null>(null);
  const productRef = useRef<HTMLDivElement | null>(null);

  // Fixed: Use 'authToken' to match Login
  const token = localStorage.getItem("authToken");

  // Function to render merged specifications
  const renderMergedSpecifications = () => {
    if (!product) return null;
    
    // Merge parsed specifications into grouped specifications
    const groupedSpecs = groupSpecifications(product);
    const parsedSpecs = parseProductDescription(product.description).specifications;
    
    // Add parsed specifications to the General group or create it if it doesn't exist
    if (parsedSpecs.length > 0) {
      if (!groupedSpecs["General"]) {
        groupedSpecs["General"] = [];
      }
      // Avoid duplicates by checking if the key already exists
      parsedSpecs.forEach(spec => {
        const existsInGeneral = groupedSpecs["General"].some(
          item => item.key.toLowerCase() === spec.key.toLowerCase()
        );
        if (!existsInGeneral) {
          groupedSpecs["General"].push(spec);
        }
      });
    }
    
    return Object.entries(groupedSpecs).map(([groupName, specs]) => (
      <div key={groupName} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 transform hover:scale-[1.01]">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-3 border-b border-indigo-200">
          <h3 className="text-sm font-medium text-indigo-900 flex items-center">
            {groupName === "General" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {groupName === "Technical" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {groupName === "Features" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )}
            {groupName}
          </h3>
        </div>
        <div className="p-4 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {specs.map((spec, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                  <td className="px-3 py-3 text-xs font-medium text-gray-500 w-1/3">{spec.key}</td>
                  <td className="px-3 py-3 text-xs text-gray-900">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  // Function to scroll to reviews section
  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(2); // Set the active tab to Reviews
    
    // Add a small delay to ensure the tab content is rendered before scrolling
    setTimeout(() => {
    if (reviewRef.current) {
      reviewRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    }, 100);
  };

  // Function to scroll to specifications section
  const scrollToSpecifications = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(1); // Set the active tab to Specifications
    
    // Add a small delay to ensure the tab content is rendered before scrolling
    setTimeout(() => {
      if (specificationsRef.current) {
        specificationsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (reviewRef.current) observer.observe(reviewRef.current);

    return () => {
      if (reviewRef.current) observer.unobserve(reviewRef.current);
    };
  }, []);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/${id}`);
        const prod = res.data.product;
        setProduct(prod);
        setSelectedImage(prod.images?.[0]?.url || prod.imageUrl);
        if (prod.reviews) {
          setReviewsLength(prod.reviews.length);
        }
        
        // Add to recently viewed products - only when product is initially loaded
        if (prod) {
          addToRecentlyViewed({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.images?.[0]?.url || prod.imageUrl,
            category: prod.category
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch product", error);
        setIsLoading(false);
      }
    };

    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await axios.get(`${BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };

    fetchProduct();
    fetchUser();
  }, [id, token]); // Remove addToRecentlyViewed from the dependency array

  useEffect(() => {
    if (id) {
      axios
        .get(`${BACKEND_URL}/products/${id}/similar`)
        .then((res) => {
          const mappedProducts = res.data.products.map((p: any) => ({
            ...p,
            rating: p.avgRating || 0,
          }));
          setSimilarProducts(mappedProducts);
        })
        .catch((err) => console.error("Failed to fetch similar products", err));
    }
  }, [id]);

  const addToCart = async () => {
    if (!token) {
      alert("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    if (!product?.id) {
      alert("Product not available");
      return;
    }

    setIsAddingToCart(true);
    try {
      await axios.post(
        `${BACKEND_URL}/cart`,
        {
          productId: product.id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Success notification
      const notification = document.getElementById('cartNotification');
      if (notification) {
        notification.classList.remove('translate-y-full');
        notification.classList.add('translate-y-0');
        
        setTimeout(() => {
          notification.classList.remove('translate-y-0');
          notification.classList.add('translate-y-full');
        }, 3000);
      }
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        alert(`Failed to add to cart: ${err.response?.data?.error || "Server error"}`);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("authToken");
  
      if (!token) {
        alert("You need to log in to place an order");
        navigate("/login");
        return;
      }
    if (!product) return;
    navigate("/order-review", {
      state: {
        cartItems: [
          {
            id: product.id,
            product,
            quantity,
          },
        ],
        total: product.price * quantity,
        productId: product.id,
      },
    });
  };

  const increaseQty = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };


  // Function to extract warranty information
  const extractWarrantyInfo = (description: string) => {
    const warrantyLine = description.split('\n').find(line => 
      line.toLowerCase().includes('warranty') || 
      line.toLowerCase().includes('guarantee')
    );
    return warrantyLine || 'Standard manufacturer warranty applies';
  };

  // Function to get category-specific specification fields
  const getCategorySpecFields = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    // Mobile phones specifications
    if (categoryLower.includes('phone') || categoryLower.includes('mobile') || categoryLower.includes('smartphone')) {
      return [
        { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
        { key: 'Model', value: product?.name.split(' ').slice(0, 2).join(' ') },
        { key: 'Display', value: extractSpecValue(product?.description, ['display', 'screen'], '6.5 inch') },
        { key: 'Processor', value: extractSpecValue(product?.description, ['processor', 'chipset', 'cpu'], 'Not specified') },
        { key: 'RAM', value: extractSpecValue(product?.description, ['ram', 'memory'], '4GB') },
        { key: 'Storage', value: extractSpecValue(product?.description, ['storage', 'rom'], '64GB') },
        { key: 'Battery', value: extractSpecValue(product?.description, ['battery', 'mah'], '4000mAh') },
        { key: 'Camera', value: extractSpecValue(product?.description, ['camera', 'mp'], '48MP') },
        { key: 'Operating System', value: extractSpecValue(product?.description, ['os', 'android', 'ios'], 'Android') },
        { key: 'Resolution', value: extractSpecValue(product?.description, ['resolution', 'ppi'], 'HD+') },
        { key: 'SIM', value: extractSpecValue(product?.description, ['sim'], 'Dual SIM') },
        { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour'], 'Black') }
      ];
    }
    
    // Laptop specifications
    else if (categoryLower.includes('laptop') || categoryLower.includes('computer') || categoryLower.includes('pc')) {
      return [
        { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
        { key: 'Model', value: product?.name.split(' ').slice(0, 2).join(' ') },
        { key: 'Processor', value: extractSpecValue(product?.description, ['processor', 'cpu', 'intel', 'amd'], 'Not specified') },
        { key: 'RAM', value: extractSpecValue(product?.description, ['ram', 'memory'], '8GB') },
        { key: 'Storage', value: extractSpecValue(product?.description, ['storage', 'ssd', 'hdd'], '256GB SSD') },
        { key: 'Display', value: extractSpecValue(product?.description, ['display', 'screen'], '15.6 inch') },
        { key: 'Graphics', value: extractSpecValue(product?.description, ['graphics', 'gpu'], 'Integrated') },
        { key: 'Operating System', value: extractSpecValue(product?.description, ['os', 'windows', 'macos'], 'Windows') },
        { key: 'Battery Life', value: extractSpecValue(product?.description, ['battery', 'backup'], 'Up to 6 hours') },
        { key: 'Weight', value: extractSpecValue(product?.description, ['weight', 'kg'], 'Not specified') },
        { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour'], 'Silver') }
      ];
    }
    
    // Clothing specifications
    else if (categoryLower.includes('cloth') || categoryLower.includes('apparel') || 
             categoryLower.includes('shirt') || categoryLower.includes('pant') || 
             categoryLower.includes('dress') || categoryLower.includes('wear')) {
      return [
        { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
        { key: 'Material', value: extractSpecValue(product?.description, ['material', 'fabric'], 'Cotton') },
        { key: 'Size', value: extractSpecValue(product?.description, ['size', 'fit'], 'Medium') },
        { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour'], 'Black') },
        { key: 'Pattern', value: extractSpecValue(product?.description, ['pattern', 'design'], 'Solid') },
        { key: 'Sleeve', value: extractSpecValue(product?.description, ['sleeve'], 'Full Sleeve') },
        { key: 'Neck Type', value: extractSpecValue(product?.description, ['neck', 'collar'], 'Round Neck') },
        { key: 'Fit', value: extractSpecValue(product?.description, ['fit', 'style'], 'Regular Fit') },
        { key: 'Occasion', value: extractSpecValue(product?.description, ['occasion', 'suitable'], 'Casual') },
        { key: 'Care Instructions', value: extractSpecValue(product?.description, ['care', 'wash', 'clean'], 'Machine wash') }
      ];
    }
    
    // Electronics specifications
    else if (categoryLower.includes('electronic') || categoryLower.includes('appliance') || 
             categoryLower.includes('tv') || categoryLower.includes('headphone') || 
             categoryLower.includes('speaker') || categoryLower.includes('camera')) {
      return [
        { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
        { key: 'Model', value: product?.name.split(' ').slice(0, 2).join(' ') },
        { key: 'Power Source', value: extractSpecValue(product?.description, ['power', 'battery', 'electric'], 'Electric') },
        { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour'], 'Black') },
        { key: 'Dimensions', value: extractSpecValue(product?.description, ['dimensions', 'size'], 'Not specified') },
        { key: 'Weight', value: extractSpecValue(product?.description, ['weight', 'kg'], 'Not specified') },
        { key: 'Warranty', value: extractSpecValue(product?.description, ['warranty'], '1 Year') },
        { key: 'Connectivity', value: extractSpecValue(product?.description, ['connectivity', 'bluetooth', 'wifi'], 'Not specified') },
        { key: 'Special Features', value: extractSpecValue(product?.description, ['features', 'special'], 'Not specified') }
      ];
    }
    
    // Furniture specifications
    else if (categoryLower.includes('furniture') || categoryLower.includes('chair') || 
             categoryLower.includes('table') || categoryLower.includes('sofa') || 
             categoryLower.includes('bed')) {
      return [
        { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
        { key: 'Material', value: extractSpecValue(product?.description, ['material', 'wood', 'metal'], 'Wood') },
        { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour', 'finish'], 'Brown') },
        { key: 'Dimensions', value: extractSpecValue(product?.description, ['dimensions', 'size', 'measurement'], 'Not specified') },
        { key: 'Weight', value: extractSpecValue(product?.description, ['weight', 'kg'], 'Not specified') },
        { key: 'Assembly Required', value: extractSpecValue(product?.description, ['assembly'], 'Yes') },
        { key: 'Style', value: extractSpecValue(product?.description, ['style', 'design'], 'Modern') },
        { key: 'Weight Capacity', value: extractSpecValue(product?.description, ['capacity', 'weight capacity'], 'Not specified') },
        { key: 'Warranty', value: extractSpecValue(product?.description, ['warranty'], '1 Year') }
      ];
    }
    
    // Default specifications for other categories
    return [
      { key: 'Brand', value: product?.brand?.name || 'Unbranded' },
      { key: 'Category', value: product?.category || 'General' },
      { key: 'Color', value: extractSpecValue(product?.description, ['color', 'colour'], 'Not specified') },
      { key: 'Material', value: extractSpecValue(product?.description, ['material'], 'Not specified') },
      { key: 'Dimensions', value: extractSpecValue(product?.description, ['dimensions', 'size'], 'Not specified') },
      { key: 'Weight', value: extractSpecValue(product?.description, ['weight'], 'Not specified') },
      { key: 'Warranty', value: extractSpecValue(product?.description, ['warranty'], '1 Year') },
      { key: 'In Stock', value: (product?.stock ?? 0) > 0 ? 'Yes' : 'No' },
      { key: 'Rating', value: (product?.avgRating?.toFixed(1) || 'No ratings yet') }
    ];
  };

  // Function to extract a specific value from product description based on keywords
  const extractSpecValue = (description: string = '', keywords: string[], defaultValue: string = 'Not specified') => {
    
    const descLower = description.toLowerCase();
    const lines = description.split('\n');
    
    // First try to find a line with key: value format
    for (const line of lines) {
      for (const keyword of keywords) {
        const regex = new RegExp(`${keyword}[s]?[:\\s-]+([^,\\.\\n]+)`, 'i');
        const match = line.match(regex);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    
    // If no key:value format, try to find the keyword in the description with nearby numbers/specs
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[s]?[\\s:-]*([\\w\\d\\s\\.\\-]+)`, 'i');
      const match = descLower.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return defaultValue;
  };


  const generateCareInstructions = (category: string): string => {
    // Generate care instructions based on product category
    const instructions: {[key: string]: string} = {
      "electronics": "Clean with soft, dry cloth. Avoid exposure to moisture and extreme temperatures.",
      "clothing": "Machine wash cold with like colors. Tumble dry low. Do not bleach.",
      "furniture": "Dust regularly with a soft, dry cloth. Avoid direct sunlight to prevent fading.",
      "kitchen": "Hand wash recommended. Dishwasher safe on top rack only.",
      "beauty": "Store in a cool, dry place away from direct sunlight.",
      "default": "Follow manufacturer's care instructions for best results and to maintain warranty coverage."
    };
    
    return instructions[category?.toLowerCase()] || instructions.default;
  };

  const generatePackageContents = (category: string, productName: string): string[] => {
    // Generate package contents based on product category
    const defaultContents = [`1 x ${productName}`, "User manual", "Warranty card"];
    
    const categoryContents: {[key: string]: string[]} = {
      "electronics": [...defaultContents, "Power adapter", "Quick start guide"],
      "clothing": [...defaultContents.slice(0, 1), "Care instructions"],
      "furniture": [...defaultContents, "Assembly instructions", "Assembly tools"],
      "kitchen": [...defaultContents, "Recipe booklet"],
      "beauty": [...defaultContents.slice(0, 1), "Usage instructions"]
    };
    
    return categoryContents[category?.toLowerCase()] || defaultContents;
  };

  const generateCertifications = (category: string): string[] => {
    // Generate certifications based on product category
    const defaultCerts = ["Quality tested", "Manufacturer certified"];
    
    const categoryCerts: {[key: string]: string[]} = {
      "electronics": [...defaultCerts, "CE certified", "RoHS compliant", "Energy Star rated"],
      "clothing": [...defaultCerts, "OEKO-TEX® certified", "Fair Trade certified"],
      "furniture": [...defaultCerts, "FSC certified wood", "CARB compliant"],
      "kitchen": [...defaultCerts, "FDA approved", "BPA free"],
      "beauty": [...defaultCerts, "Dermatologically tested", "Not tested on animals"]
    };
    
    return categoryCerts[category?.toLowerCase()] || defaultCerts;
  };

  const groupSpecifications = (product: any) => {
    // In a real app, you would have structured specifications data
    // This function simulates grouping specifications into categories
    const specs: {[key: string]: {key: string, value: string}[]} = {
      "General": [
        { key: "Brand", value: product.brand?.name || "N/A" },
        { key: "Model", value: product.model || product.name || "N/A" },
        { key: "Release Date", value: "2023" },
      ],
      "Technical": [
        { key: "Connectivity", value: product.connectivity || "N/A" },
        { key: "Power Source", value: product.powerSource || "N/A" },
        { key: "Battery Life", value: product.batteryLife || "N/A" },
        { key: "Operating System", value: product.os || "N/A" },
        { key: "Storage", value: product.storage || "N/A" },
        { key: "Memory", value: product.memory || "N/A" },
      ],
      "Features": [
        { key: "Water Resistant", value: product.waterResistant ? "Yes" : "No" },
        { key: "Warranty", value: "1 year manufacturer warranty" },
        { key: "Returnable", value: product.returnable ? "Yes" : "No" },
        { key: "In The Box", value: generatePackageContents(product.category, product.name).join(", ") },
      ],
    };

    // Add dimensions, weight, color and material only if they exist and aren't already added through other means
    if (product.dimensions) {
      specs["General"].push({ key: "Dimensions", value: product.dimensions });
    }
    
    if (product.weight) {
      specs["General"].push({ key: "Weight", value: product.weight });
    }
    
    if (product.color) {
      specs["General"].push({ key: "Color", value: product.color });
    }
    
    if (product.material) {
      specs["General"].push({ key: "Material", value: product.material });
    }
    
    // Filter out specs that have "N/A" value if they're in the Technical section
    const filteredSpecs = {...specs};
    filteredSpecs.Technical = specs.Technical.filter(spec => spec.value !== "N/A");
    
    // If Technical section is empty, remove it
    if (filteredSpecs.Technical.length === 0) {
      delete filteredSpecs.Technical;
    }
    
    return filteredSpecs;
  };

  // Function to parse structured product descriptions with sections
  const parseProductDescription = (description: string = ''): ParsedDescription => {
    const sections: ParsedDescription = {
      main: '',
      keyFeatures: [],
      specifications: []
    };

    // Split by newlines and process
    const lines = description.split('\n');
    let currentSection = 'main';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section headers
      if (line === '#KEY_FEATURES#') {
        currentSection = 'keyFeatures';
        continue;
      } else if (line === '#SPECIFICATIONS#') {
        currentSection = 'specifications';
        continue;
      }

      // Process line based on current section
      if (currentSection === 'main') {
        if (line) sections.main += (sections.main ? '\n' : '') + line;
      } 
      else if (currentSection === 'keyFeatures') {
        if (line) {
          // Clean bullet points if they exist
          const cleanedLine = line.replace(/^[•●◦○⦿⦾-]\s*/, '').trim();
          if (cleanedLine) sections.keyFeatures.push(cleanedLine);
        }
      } 
      else if (currentSection === 'specifications') {
        if (line) {
          // Look for key-value pairs (Key: Value)
          const match = line.match(/^([^:]+):\s*(.+)$/);
          if (match) {
            sections.specifications.push({
              key: match[1].trim(),
              value: match[2].trim()
            });
          }
        }
      }
    }

    return sections;
  };

  if (isLoading)
    return <ProductSkeleton />;

  if (!product)
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
            Browse all products
          </Link>
        </div>
        <Footer />
      </div>
    );


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppBar />
      
      {/* Remove Breadcrumbs */}
      {/* <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/products" className="text-gray-400 hover:text-gray-600 transition-colors">Products</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">{product.name}</span>
          </nav>
        </div>
      </div> */}
      
      <div className="flex-grow" ref={productRef}>
        {/* Removing the Hero Section for Desktop */}
        {/* We'll use the mobile version layout for all screen sizes */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Image Section */}
              <div className="p-3 sm:p-6 lg:p-8 lg:border-r border-gray-100">
                <div className="sticky top-24">
                  <div className="relative group bg-gradient-to-b from-gray-50 to-white p-3 sm:p-6 rounded-xl">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 lg:h-[460px] object-contain rounded-lg border border-gray-200 cursor-zoom-in transition-all duration-300 hover:scale-[1.05] shadow-md"
                    onClick={() => setShowImageModal(true)}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
                  <div className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md z-10 transform transition-transform hover:scale-110 hover:bg-indigo-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                    
                    {/* Brand tag */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-indigo-100">
                      <p className="text-sm font-medium text-indigo-700">{product.brand?.name || "Unknown Brand"}</p>
                  </div>
                </div>
                
          {/* Thumbnails */}
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2 ml-1">Product Images</h3>
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto py-2 pb-4">
            {(product.images?.length ? product.images : [{ url: product.imageUrl }]).map(
              (img, idx) => (
                        <div
                          key={idx}
                            className={`relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden ${
                              selectedImage === img.url ? 'ring-2 ring-indigo-500 scale-105 shadow-md' : 'border border-gray-200 hover:border-indigo-300'
                            } transition-all duration-200 hover:shadow-lg`}
                          onClick={() => setSelectedImage(img.url)}
                        >
                          <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
              )
            )}
                    </div>
                  </div>
                  
                  {/* Badge Section - Desktop Only */}
                  <div className="hidden lg:flex mt-8 justify-between">
                    <div className="flex items-center space-x-1 bg-green-50 px-3 py-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium text-green-700">100% Genuine</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 bg-blue-50 px-3 py-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                      </svg>
                      <span className="text-xs font-medium text-blue-700">Easy Returns</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 bg-purple-50 px-3 py-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      <span className="text-xs font-medium text-purple-700">Fast Delivery</span>
                    </div>
          </div>
          </div>
        </div>

        {/* Product Info */}
              <div className="p-3 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-100 mb-4 sm:mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                      {/* Show brand name on all screens */}
                      <span className="text-gray-700 text-lg font-medium">{product.brand?.name || "Unknown Brand"}</span>
                    {product.stock > 0 ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm">In Stock ({product.stock})</span>
                    ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200 shadow-sm">Out of Stock</span>
                    )}
                    </div>
                    <div className="hidden sm:flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium text-indigo-700">Genuine Product</span>
                    </div>
                  </div>
                  
                  {/* Product title for all screen sizes */}
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center">
            <StaticStarRating rating={product.avgRating || 0} />
                      <span className="ml-2 text-gray-600 text-sm">
              ({product.avgRating?.toFixed(1) || "0.0"})
            </span>
          </div>
                    <a 
                      href="#reviews-section" 
                      onClick={scrollToReviews}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      See {reviewsLength} reviews
                    </a>
                  </div>
                  
                  {/* Price for all screen sizes */}
                  <div className="mt-2 mb-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                      ₹{product.price.toLocaleString('en-IN')}
                      <span className="ml-2 text-sm text-green-600 font-normal">
                        Best price
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-green-600 text-sm font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Free delivery
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Specs - Enhanced */}
                <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm mb-4 sm:mb-6 hover:border-indigo-200 transition-colors duration-300">
                  <h3 className="text-md font-medium text-gray-900 flex items-center mb-3 sm:mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Key Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-2 sm:gap-x-4">
                    {getCategorySpecFields(product.category).slice(0, 6).map((spec, idx) => (
                      <div key={idx} className="flex items-center text-xs sm:text-sm bg-gray-50 p-2 rounded-md border border-gray-100">
                        <span className="font-medium text-gray-500 mr-1 sm:mr-2">{spec.key}:</span>
                        <span className="text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button 
                      onClick={scrollToSpecifications}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center group"
                    >
                      View all specifications
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Quantity selector and Buttons */}
                <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl p-3 sm:p-5 border border-indigo-100 mb-4 sm:mb-6 shadow-sm">
                  <div className="mb-3 sm:mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Quantity</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex">
                        <button
                          onClick={decreaseQty}
                          disabled={quantity <= 1}
                          className="p-2 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          readOnly
                          className="w-14 p-2 text-center border-t border-b border-gray-300 text-gray-900 font-medium"
                        />
                        <button
                          onClick={increaseQty}
                          disabled={quantity >= (product.stock || 1)}
                          className="p-2 border border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-gray-600 text-xs">
                        {product.stock > 0 ? (
                          <span className="bg-gray-100 px-2 py-1 rounded">{product.stock} units available</span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">Currently unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={addToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow"
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
              </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Buy Now
              </button>
                  </div>
            </div>

                {/* Warranty & Payment - Mobile & Desktop */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-3 sm:mt-4">
                  <div className="flex-1 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 sm:p-5 border border-indigo-200 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center text-indigo-900 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
                      <span className="font-medium text-sm sm:text-base">Warranty Protection</span>
                    </div>
                    <p className="text-xs text-indigo-800 bg-white/60 p-2 rounded-md">{extractWarrantyInfo(product.description)}</p>
                  </div>
                  
                  {/* Payment options - Mobile & Desktop */}
                  <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
                      Payment Options
                    </p>
                    <div className="flex flex-wrap space-x-2 bg-white/70 p-2 rounded-md">
                      <div className="w-10 sm:w-12 h-6 sm:h-7 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium">VISA</div>
                      <div className="w-10 sm:w-12 h-6 sm:h-7 bg-red-500 rounded flex items-center justify-center text-white text-xs font-medium">MC</div>
                      <div className="w-10 sm:w-12 h-6 sm:h-7 bg-green-500 rounded flex items-center justify-center text-white text-xs font-medium">AMEX</div>
                      <div className="w-10 sm:w-12 h-6 sm:h-7 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-medium">UPI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description & Specifications Section */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-16">
              {/* Hidden scroll target divs */}
              <div id="specifications-section" ref={specificationsRef} className="scroll-mt-24"></div>
              <div id="reviews-section" ref={reviewRef} className="scroll-mt-24"></div>
              
              {/* Tabs for description, specs, reviews */}
              <div className="border-b border-gray-200 mb-5 sm:mb-10 overflow-x-auto">
                <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Product details">
                  {['Description', 'Specifications', 'Reviews'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(index)}
                      className={`
                        whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200
                        ${activeTab === index
                          ? 'border-indigo-600 text-indigo-600 scale-105 transform'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-center">
                        {index === 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {index === 1 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        )}
                      {tab}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Description tab content */}
              {activeTab === 0 && (
                <div className="space-y-6">
                  {/* About This Item */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-indigo-50 to-white px-5 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About This Item
                      </h3>
                    </div>
                    
                    <div className="p-5">
                      {product?.description && (
                        <div className="space-y-6">
                          {/* Main description */}
                          {parseProductDescription(product.description).main && (
                            <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                              {parseProductDescription(product.description).main.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-3">{paragraph}</p>
                              ))}
                            </div>
                          )}
                            
                          {/* Key Features */}
                          {parseProductDescription(product.description).keyFeatures.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Key Features
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {parseProductDescription(product.description).keyFeatures.map((feature, idx) => (
                                  <div key={idx} className="flex items-start bg-gradient-to-r from-indigo-50 to-white p-3 rounded-lg border border-indigo-100 hover:shadow-sm transition-all duration-200 transform hover:scale-[1.01]">
                                    <div className="flex-shrink-0 text-indigo-600 mr-2 mt-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <circle cx="10" cy="10" r="5" />
                                      </svg>
                                    </div>
                                    <span className="text-gray-700">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                              
                          {/* View specifications button */}
                          <div className="mt-6 flex justify-end">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveTab(1); // Set the active tab to Specifications
                                
                                // Add a small delay to ensure the tab content is rendered before scrolling
                                setTimeout(() => {
                                  if (specificationsRef.current) {
                                    specificationsRef.current.scrollIntoView({ 
                                      behavior: 'smooth',
                                      block: 'start'
                                    });
                                  }
                                }, 100);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              View Full Specifications
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Care Instructions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Care Instructions
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-gray-700">{generateCareInstructions(product?.category || "")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Package Contents */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-green-50 to-white px-5 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Package Contents
                      </h3>
                    </div>
                    <div className="p-5">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatePackageContents(product?.category || "", product?.name || "Product").map((item, idx) => (
                          <li key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
                            <div className="flex-shrink-0 text-green-600 mr-2 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <circle cx="10" cy="10" r="5" />
                              </svg>
                            </div>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Certifications */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-purple-50 to-white px-5 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Certifications
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-3">
                        {generateCertifications(product?.category || "").map((cert, idx) => (
                          <div key={idx} className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-white border border-purple-100 shadow-sm hover:shadow transition-all duration-200 transform hover:scale-[1.02]">
                            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-800 font-medium">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          
              {/* Specifications tab content */}
              {activeTab === 1 && (
                <div id="all-specs" className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    All Specifications
                  </h2>
                  
                  {/* Grouped specifications based on category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                    {renderMergedSpecifications()}
                  </div>
                </div>
              )}
              
              {/* Reviews tab content */}
              {activeTab === 2 && (
                <div id="reviews" className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Customer Reviews
                  </h2>
                  
                  {/* Use the imported ReviewSection component */}
                  <ReviewSection productId={product.id} currentUser={user} />
                          </div>
                        )}
                      </div>
                    </div>
        </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-8 sm:mt-12 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md overflow-hidden p-4 sm:p-8 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                You may also like
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {similarProducts.slice(0, 4).map((prod) => (
                  <Link
                    to={`/products/${prod.id}`}
                    key={prod.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:scale-[1.03]"
                  >
                    <div className="relative overflow-hidden">
                      <div className="h-36 sm:h-48 overflow-hidden relative">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-indigo-700 shadow-sm">
                        {prod.price > 1000 ? 'Premium' : 'Best Seller'}
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {prod.name}
                      </h3>
                      
                      <div className="mt-2 flex items-center gap-1">
                        <StaticStarRating rating={prod.rating} />
                        <span className="text-xs text-gray-500">
                          ({prod.rating.toFixed(1)})
                        </span>
                      </div>

                      <p className="text-indigo-600 font-bold mt-2 bg-indigo-50 px-2 py-1 rounded-md inline-block text-sm">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </p>

                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-green-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Free delivery
                        </span>
                        <span className="text-xs text-gray-500">In Stock</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
      
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="max-w-5xl max-h-screen p-4 relative">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl border border-gray-700"
            />
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={() => setShowImageModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Success notification */}
      <div 
        id="cartNotification" 
        className="fixed bottom-0 inset-x-0 flex justify-center items-center transform translate-y-full transition-transform duration-300 ease-in-out z-50"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-t-lg shadow-lg flex items-center border-t border-x border-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Item added to cart successfully!</span>
          <Link to="/cart" className="ml-4 px-3 py-1 bg-white text-green-600 rounded-full text-sm font-medium hover:bg-green-50 transition-colors duration-200 shadow-sm">
            View Cart
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};