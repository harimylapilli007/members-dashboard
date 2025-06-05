"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { MapPin, Clock, Tag, Phone } from "lucide-react";
import LocationModal from "@/components/location-modal";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "../components/Header";
import { fetchWithRetry, generateCacheKey } from '../utils/api';
import { DashboardLayout } from "@/components/dashboard-layout";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  price_info?: {
    price_without_tax: number;
  };
}

interface CategorizedServices {
  [key: string]: Array<{
    id: string;
    name: string;
    final_price: number;
    duration?: number;
    description?: string
  }>;
}

interface CategoryImage {
  name: string;
  image: string;
  description: string;
}

const categoryImages: CategoryImage[] = [
  {
    name: "Spa Therapies",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    description: "Experience our signature massage therapies for complete relaxation and rejuvenation"
  },
  {
    name: "Spa Facial",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
    description: "Premium facial treatments using luxury products for radiant, glowing skin"
  },
  {
    name: "Saloon Services",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop&q=80",
    description: "Professional hair styling, coloring, and treatment services"
  },
  {
    name: "Hand & Feet",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
    description: "Luxurious manicure and pedicure treatments for beautiful hands and feet"
  },
  {
    name: "Scrubs & Wraps",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
    description: "Detoxifying body treatments and wraps for smooth, glowing skin"
  },
  {
    name: "Other Services",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80",
    description: "Additional wellness and beauty services to enhance your experience"
  }
];

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch and categorize services
async function fetchAndCategorizeServices(area: string): Promise<CategorizedServices> {
  let allData: Service[] = [];
  let currentPage = 1;
  const pageSize = 100;
  const apiKey = "apikey 061fb3b3f6974acc828ced31bef595cca3f57e5bc194496785492e2b70362283";
  const headers = {
    Authorization: apiKey,
    accept: "application/json",
  };

  while (true) {
    try {
      const url = `https://api.zenoti.com/v1/Centers/${area}/services?page=${currentPage}&size=${pageSize}`;
      const cacheKey = generateCacheKey(url, { area, page: currentPage });
      
      const data = await fetchWithRetry(url, { 
        method: "GET", 
        headers 
      }, cacheKey);

      if (!data.services || data.services.length === 0) break;
      allData = [...allData, ...data.services];
      if (data.services.length < pageSize) break;
      currentPage++;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  // Categorization logic
  const categories: { [key: string]: string[] } = {
    "Spa Therapies": ["massage", "reflexology", "champi", "aromatherapy", "balinese", "deep tissue", "swedish", "thai", "head massage", "foot massage", "neck and back", "neck and back massage", "cream massage", "dry massage", "junior massage"],
    "Spa Facial": ["facial", "mask", "whitening", "detox", "charcoal", "peppermint", "organic", "rejuvenating", "cleansing", "24 carat gold facial", "anti aging facial", "deep cleansing facial", "gentleman's facial", "charcoal facial","bleach", "de-tan"],
    "Saloon Services": ["hair", "styling", "color", "rebonding", "keratin", "straightening", "blow dry", "root touchup", "scalp treatment", "hair fall", "trimming", "shaving", "haircut","mehndi", "bridal mehndi", "mehndi per hand", "special occasion", "stylists","makeup", "saree drape", "beard styling", "mehendi", "bridal"],
    "Hand & Feet": ["manicure", "pedicure", "nailcut", "polish", "filing", "spa manicure", "spa pedicure", "french manicure", "french pedicure"],
    "Scrubs & Wraps": ["whitening wrap", "charcoal scrub", "charcoal wrap", "detox treatment", "scrub","detox", "detox treatment", "body detox","waxing", "threading", "bikini", "underarms", "full body", "arms", "legs"],
    "Other Services": ["balm", "event", "hot rollers", "ironing", "tonging", "cleanser", "peel off"]
  };
  const categorizedServices: CategorizedServices = {};
  for (const category in categories) categorizedServices[category] = [];
  allData.forEach(service => {
    const name = service.name.toLowerCase();
    const description = service.description ? service.description.toLowerCase() : "";
    let matchedCategory = "Other Services";
    for (const category in categories) {
      if (categories[category].some(keyword => name.includes(keyword) || description.includes(keyword))) {
        matchedCategory = category;
        break;
      }
    }
    categorizedServices[matchedCategory].push({
      id: service.id,
      name: service.name,
      final_price: service.price_info?.price_without_tax || service.price || 0,
      duration: service.duration,
      description: service.description
    });
  });
  return categorizedServices;
}

const LoadingSpinner = () => (
  <DashboardLayout membershipType="loading">
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-[#a07735] animate-spin" />
      <span className="ml-2 text-gray-600">Loading services...</span>
    </div>
  </DashboardLayout>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-500 mb-4">{message}</div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-[#a07735] text-white rounded-lg hover:bg-[#8a6930] transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Memoized Service Card Component
const ServiceCard = memo(({ 
  service, 
  categoryImage, 
  onBookNow, 
  onReadMore 
}: { 
  service: any; 
  categoryImage: string; 
  onBookNow: (service: any) => void;
  onReadMore: (service: any) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#a07735]/40 group">
    <div className="relative h-48 w-full">
      <Image
        src={categoryImage}
        alt={service.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h1 className="text-[1rem] font-semibold text-white mb-1 leading-0">{service.name}</h1>
        <div className="flex items-center text-white/90">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm text-white">{service.duration} mins</span>
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="relative">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description || 'Experience our premium service designed to enhance your well-being and relaxation.'}
        </p>
        {service.description && service.description.length > 100 && (
          <button
            onClick={() => onReadMore(service)}
            className="text-[#a07735] text-sm font-medium hover:text-[#8a6930] transition-colors focus:outline-none"
          >
            Read More
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[#a07735] font-semibold flex items-center text-lg">
          <Tag className="h-5 w-5 mr-1" />₹{Math.round(service.final_price)}
        </span>
        <button
          onClick={() => onBookNow(service)}
          className="px-4 py-2 bg-[#a07735] text-white rounded-lg hover:bg-[#8a6930] transition-colors font-semibold shadow hover:scale-105 hover:shadow-lg focus:outline-none"
        >
          Book Now
        </button>
      </div>
    </div>
  </div>
));

// Memoized Category Button Component
const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onClick, 
  image 
}: { 
  category: string; 
  isSelected: boolean; 
  onClick: () => void;
  image: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 border-l-4 hover:bg-[#f7f3ec] focus:outline-none relative group ${
      isSelected
        ? 'bg-[#a07735]/10 border-[#a07735] ring-2 ring-[#a07735] border-l-8'
        : 'border-transparent'
    }`}
    tabIndex={0}
    aria-label={category}
  >
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-gray-200 bg-white">
      <Image
        src={image}
        alt={category}
        width={64}
        height={64}
        className="object-cover w-full h-full"
      />
    </div>
    <span className="text-base font-medium text-gray-900 text-left line-clamp-2">
      {category}
    </span>
  </button>
));

// Memoized Location Selector Component
const LocationSelector = memo(({ 
  selectedLocation, 
  onOpen 
}: { 
  selectedLocation: { city: string; outlet: { name: string } } | null;
  onOpen: () => void;
}) => (
  <div 
    onClick={onOpen}
    className="absolute top-4 right-4 md:top-6 md:right-6 cursor-pointer"
  >
    <div className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white transition-colors rounded-lg shadow-md backdrop-blur-sm">
      <MapPin className="h-4 w-4 text-[#a07735]" />
      <span className="text-sm font-medium text-gray-700">
        {selectedLocation ? `${selectedLocation.city} - ${selectedLocation.outlet.name}` : 'Select Location'}
      </span>
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
));

export default function ServiceBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [area, setArea] = useState("");
  const [bookingFor, setBookingFor] = useState("just me");
  const [services, setServices] = useState<CategorizedServices>({});
  const [selectedCategory, setSelectedCategory] = useState("Spa Therapies");
  const [search, setSearch] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; outlet: {name: string, id: string} } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{ name: string; description: string } | null>(null);

  // Load saved state after component mounts
  useEffect(() => {
    const savedArea = localStorage.getItem('selectedArea');
    const savedBookingFor = localStorage.getItem('bookingFor');
    const savedCategory = localStorage.getItem('selectedCategory');
    const savedLocation = localStorage.getItem('selectedLocation');
    const guestId = searchParams.get('guestId');

    if (guestId) {
      localStorage.setItem('guestId', guestId);
    }

    if (savedArea) setArea(savedArea);
    if (savedBookingFor) setBookingFor(savedBookingFor);
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedLocation) setSelectedLocation(JSON.parse(savedLocation));

    // Check if we should open the modal
    if (searchParams.get('openModal') === 'true') {
      setIsLocationModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (area) {
      localStorage.setItem('selectedArea', area);
      setIsLoading(true);
      fetchAndCategorizeServices(area)
        .then(setServices)
        .catch(setError)
        .finally(() => setIsLoading(false));
    }
  }, [area]);

  useEffect(() => {
    localStorage.setItem('bookingFor', bookingFor);
  }, [bookingFor]);

  useEffect(() => {
    localStorage.setItem('selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  const handleSelectLocation = (city: string, outlet: string, centerId: string) => {
    setSelectedLocation({ city, outlet: { name: outlet, id: centerId } });
    setArea(centerId);
    setIsLocationModalOpen(false);
    router.replace('/ServiceBookingPage', { scroll: false });
  };

  const handleCloseModal = () => {
    setIsLocationModalOpen(false);
    router.replace('/ServiceBookingPage', { scroll: false });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const categories = Object.keys(services).filter(cat => services[cat].length > 0);

  const handleBookNow = useCallback((service: any) => {
    router.push(`/service/${service.id}?id=${service.id}&name=${encodeURIComponent(service.name)}&price=${service.final_price}&duration=${service.duration}&description=${encodeURIComponent(service.description || '')}&location=${encodeURIComponent(selectedLocation?.outlet.name || '')}&outletId=${selectedLocation?.outlet.id || ''}&city=${encodeURIComponent(selectedLocation?.city || '')}`);
  }, [router, selectedLocation]);

  const handleReadMore = useCallback((service: any) => {
    setSelectedService({ name: service.name, description: service.description || '' });
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleLocationOpen = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  return (
    <>
      <div className={`min-h-screen relative overflow-hidden ${isLocationModalOpen || selectedService ? "blur-sm" : ""}`}>
        {/* Background gradient */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(120deg, #f5f1e8 0%, #e5e7eb 60%, #b2d5e4 100%)"
          }}
        />
        {/* Subtle blurred circles */}
        <div className="fixed top-20 -left-60 w-[600px] h-[600px] bg-[#e2c799] opacity-60 rounded-full -z-10 blur-3xl" />
        <div className="fixed bottom-20 right-0 w-[800px] h-[800px] bg-[#b2d5e4] opacity-50 rounded-full -z-10 blur-3xl" />
        <div className="fixed top-1/3 left-1/2 w-[2000px] h-[2000px] bg-[#b2d5e4] opacity-40 rounded-full -z-10 blur-3xl" />

        {/* Main content wrapper */}
        <div className="relative z-10">
          {/* Header */}
          <div className="top-0 left-0 right-0 z-50">
            <Header />
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Replace the Categories Grid and Services List section with a sidebar layout */}
            <div className="flex flex-col md:flex-row gap-8 h-fit">
              {/* Sidebar: Categories */}
              <aside className="w-full md:w-72 flex-shrink-0 md:shadow-lg md:bg-white/50 md:rounded-xl md:p-4 md:mt-2 md:mb-2 h-fit">
                <div className="sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
                  <div className="space-y-3">
                    {categories.map((category, index) => {
                      const categoryInfo = categoryImages.find(img => img.name === category);
                      return (
                        <CategoryButton
                          key={category}
                          category={category}
                          isSelected={selectedCategory === category}
                          onClick={() => handleCategoryClick(category)}
                          image={categoryInfo?.image || '/categories/default.jpg'}
                        />
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main Content: Services */}
              <main className="flex-1 bg-gradient-to-br from-[#f7f3ec] via-[#f7f3ec] to-[#f7f3ec] rounded-xl p-2 md:p-8 shadow-sm relative">
                {/* Divider for desktop */}
                <div className="hidden md:block absolute left-0 top-0 h-full w-px bg-gray-200" style={{ marginLeft: '-2rem' }} />
               
                <div className="flex flex-col gap-2 mt-4">
                  <h1 className="text-2xl font-bold mb-4">Discover Our Services</h1>
                  <p className="text-sm mb-8">Experience luxury wellness treatments tailored for you</p>
                </div>

                <div className="flex flex-col gap-2">
                <LocationSelector 
              selectedLocation={selectedLocation} 
              onOpen={handleLocationOpen} 
             />
             </div>
               
                {/* Sticky Search and Filter Section */}
                <div className="mb-8 sticky top-0.5 z-10 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur-md rounded-xl shadow-sm p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search services..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#a07735] focus:border-transparent"
                        />
                        <svg
                          className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    {/* <div className="flex gap-4">
                      <select
                        value={bookingFor}
                        onChange={(e) => setBookingFor(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#a07735] focus:border-transparent"
                      >
                        <option value="just me">Just Me</option>
                        <option value="someone else">Someone Else</option>
                      </select>
                    </div> */}
                  </div>
                </div>

                {/* Services List */}
                {selectedCategory && services[selectedCategory] && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">{selectedCategory}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services[selectedCategory]
                        .filter(service => 
                          service.name.toLowerCase().includes(search.toLowerCase()) ||
                          service.description?.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            categoryImage={categoryImages.find(img => img.name === selectedCategory)?.image || '/categories/default.jpg'}
                            onBookNow={handleBookNow}
                            onReadMore={handleReadMore}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseModal}
        onSelectLocation={handleSelectLocation}
      />

      {/* Description Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedService.name}</h3>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600">{selectedService.description}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
