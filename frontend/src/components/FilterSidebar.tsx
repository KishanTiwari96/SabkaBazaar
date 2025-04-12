import { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useSearchParams, useParams } from 'react-router-dom';

interface FilterSidebarProps {
  onFilterChange: (filters: { brand: string; sort: string }) => void;
  onClose?: () => void; // Optional close callback for mobile
}

export function FilterSidebar({
  onFilterChange,
  onClose,
}: FilterSidebarProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchParams] = useSearchParams();
  const { categoryName } = useParams();

  useEffect(() => {
    const search = searchParams.get('search');

    let url = `${BACKEND_URL}/brands?category=${categoryName}`;
    if (search) url += `&search=${search}`;

    axios
      .get(url)
      .then((res) => {
        const brandNames = res.data.map((b: any) => b.name);
        setBrands(brandNames);
      })
      .catch((err) => console.error(err));
  }, [categoryName, searchParams]);

  const handleApply = () => {
    onFilterChange({ brand: selectedBrand, sort: sortOrder });
    if (onClose) onClose(); // close on mobile
  };

  return (
    <div className="p-4 border-r w-full md:w-60 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Brand</label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full border p-1 rounded"
        >
          <option value="">All</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Sort by Price</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full border p-1 rounded"
        >
          <option value="">Default</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      <button
        onClick={handleApply}
        className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Apply Filters
      </button>
    </div>
  );
}

