"use client";

import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { MapPin, Clock, Tag, Phone, ChevronDown } from "lucide-react";
import LocationModal from "@/components/location-modal";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "../components/Header";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Service {
  id: string;
  name: string;
  final_price: number;
  duration: number;
  description: string;
  image_path?: string;
}

interface CategorizedServices {
  [key: string]: Service[];
}

interface CategoryImage {
  name: string;
  image: string;
  description: string;
}

interface Location {
  city: string;
  outlet: {
    name: string;
    id: string;
  };
  centerId: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (city: string, outlet: string, centerId: string) => void;
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a07735]"></div>
  </div>
);

// Service Card Skeleton for loading states
const ServiceCardSkeleton = () => (
  <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="relative h-40 md:h-48 w-full bg-gray-200"></div>
    <div className="p-3 md:p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="text-red-600 mb-4">{message}</div>
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
  service: Service; 
  categoryImage: string; 
  onBookNow: (service: Service) => void;
  onReadMore: (service: Service) => void;
}) => (
  <div onClick={() => onBookNow(service)} className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#a07735]/40 group">
    <div className="relative h-40 md:h-48 w-full">
      <Image
        src={service.image_path || categoryImage}
        alt={service.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
        <h1 className="text-[0.9rem] md:text-[1rem] font-semibold text-white mb-1 leading-0">{service.name}</h1>
        <div className="flex items-center text-white/90">
          <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          <span className="text-xs md:text-sm text-white">{service.duration} mins</span>
        </div>
      </div>
    </div>
    <div className="p-3 md:p-4">
      <div className="relative h-16">
        <p className="text-gray-600 text-md font-marcellus md:text-sm mb-3 md:mb-4 line-clamp-2">
          {service.description || 'Experience our premium service designed to enhance your well-being and relaxation.'}
        </p>
        {service.description && service.description.length > 100 && (
          <button
            onClick={() => onReadMore(service)}
            className="text-[#a07735] text-xs md:text-sm font-medium hover:text-[#8a6930] transition-colors focus:outline-none"
          >
            Read More
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 md:mt-4">
        <span className="text-[#a07735] font-semibold flex items-center text-base md:text-lg">
          <Tag className="h-4 w-4 md:h-5 md:w-5 mr-1" />₹{Math.round(service.final_price)}
        </span>
        <button
          onClick={() => onBookNow(service)}
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-[#a07735] text-white rounded-lg hover:bg-[#8a6930] transition-colors font-semibold shadow hover:scale-105 hover:shadow-lg focus:outline-none"
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
  selectedLocation: Location | null;
  onOpen: () => void;
}) => (
  <div 
    onClick={onOpen}
    className="cursor-pointer"
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

// Add this new component for mobile categories dropdown
const MobileCategoriesDropdown = memo(({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  categoryImages 
}: { 
  categories: string[]; 
  selectedCategory: string; 
  onSelectCategory: (category: string) => void;
  categoryImages: CategoryImage[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden w-full mb-2">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Select Category</h1>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/70 transition-colors rounded-lg shadow-md backdrop-blur-sm border border-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white/50">
            <Image
              src={categoryImages.find(img => img.name === selectedCategory)?.image || '/categories/default.jpg'}
              alt={selectedCategory}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-base font-medium text-gray-900">{selectedCategory}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="z-50 w-full mt-1 bg-white/50 backdrop-blur-md rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto">
              {categories.map((category) => {
                const categoryInfo = categoryImages.find(img => img.name === category);
                return (
                  <button
                    key={category}
                    onClick={() => {
                      onSelectCategory(category);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-white/50 transition-colors ${
                      selectedCategory === category ? 'bg-[#a07735]/10' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white/50 flex-shrink-0">
                      <Image
                        src={categoryInfo?.image || '/categories/default.jpg'}
                        alt={category}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-base font-medium text-gray-900 truncate">{category}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Add this new component for tablet categories dropdown
const TabletCategoriesDropdown = memo(({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  categoryImages 
}: { 
  categories: string[]; 
  selectedCategory: string; 
  onSelectCategory: (category: string) => void;
  categoryImages: CategoryImage[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="hidden md:block lg:hidden w-full mb-6">
      <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800">Select Category</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/70 transition-colors rounded-lg shadow-sm backdrop-blur-sm border border-gray-100"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 bg-white/50">
            <Image
              src={categoryImages.find(img => img.name === selectedCategory)?.image || '/categories/default.jpg'}
              alt={selectedCategory}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-base font-medium text-gray-900">{selectedCategory}</span>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="z-50 w-full bg-white/50 backdrop-blur-md rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-2">
              {categories.map((category) => {
                const categoryInfo = categoryImages.find(img => img.name === category);
                return (
                  <button
                    key={category}
                    onClick={() => {
                      onSelectCategory(category);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 hover:bg-white/50 transition-colors rounded-lg ${
                      selectedCategory === category ? 'bg-[#a07735]/10' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-white/50 flex-shrink-0">
                      <Image
                        src={categoryInfo?.image || '/categories/default.jpg'}
                        alt={category}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{category}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function ServiceBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [area, setArea] = useState("");
  const [bookingFor, setBookingFor] = useState("just me");
  const [services, setServices] = useState<CategorizedServices>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Spa Therapies");
  const [search, setSearch] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  
  // Pagination state
  const [visibleServices, setVisibleServices] = useState<{ [key: string]: Service[] }>({});
  const [servicesPerPage] = useState(6); // Show 6 services initially
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const [hasMoreServices, setHasMoreServices] = useState<{ [key: string]: boolean }>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);


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
      setLoading(true);
      fetchServices();
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

  // Add useEffect for title management
  useEffect(() => {
    if (selectedLocation) {
      document.title = `${selectedLocation.outlet.name} - ${selectedLocation.city} | Spa Services`;
    } else {
      document.title = 'Spa Services';
    }
  }, [selectedLocation]);

  const handleSelectLocation = (city: string, outlet: string, centerId: string) => {
    setSelectedLocation({
      city,
      outlet: {
        name: outlet,
        id: outlet
      },
      centerId
    });
    setArea(centerId);
    setIsLocationModalOpen(false);
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

  const handleBookNow = useCallback((service: Service) => {
    // Add dataLayer push for service booking click
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'service_booking_click',
        service_id: service.id,
        service_name: service.name,
        service_price: service.final_price,
        event_category: 'Service',
        event_action: 'Book Now Click',
        event_label: service.name
      });
    }
    
    router.push(`/service/${service.id}?id=${service.id}&name=${encodeURIComponent(service.name)}&price=${service.final_price}&duration=${service.duration}&description=${encodeURIComponent(service.description || '')}&image_path=${encodeURIComponent(service.image_path || '')}&location=${encodeURIComponent(selectedLocation?.outlet.name || '')}&outletId=${selectedLocation?.centerId || ''}&city=${encodeURIComponent(selectedLocation?.city || '')}`);
  }, [router, selectedLocation]);

  const handleReadMore = useCallback((service: Service) => {
    setSelectedService({
      id: service.id || '',
      name: service.name || '',
      final_price: service.final_price || 0,
      duration: service.duration || 0,
      description: service.description || '',
      image_path: service.image_path || ''
    });
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleLocationOpen = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  // Function to initialize pagination for a category
  const initializePagination = useCallback((category: string, allServices: Service[]) => {
    const filteredServices = allServices.filter(service => 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase())
    );
    
    const initialServices = filteredServices.slice(0, servicesPerPage);
    const hasMore = filteredServices.length > servicesPerPage;
    
    setVisibleServices(prev => ({
      ...prev,
      [category]: initialServices
    }));
    
    setCurrentPage(prev => ({
      ...prev,
      [category]: 1
    }));
    
    setHasMoreServices(prev => ({
      ...prev,
      [category]: hasMore
    }));
  }, [search, servicesPerPage]);

  // Function to load more services
  const loadMoreServices = useCallback(async (category: string) => {
    if (loadingMore || !hasMoreServices[category]) return;
    
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allServices = services[category] || [];
    const filteredServices = allServices.filter(service => 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase())
    );
    
    const currentPageNum = currentPage[category] || 1;
    const nextPage = currentPageNum + 1;
    const startIndex = (nextPage - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    const newServices = filteredServices.slice(startIndex, endIndex);
    
    setVisibleServices(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), ...newServices]
    }));
    
    setCurrentPage(prev => ({
      ...prev,
      [category]: nextPage
    }));
    
    setHasMoreServices(prev => ({
      ...prev,
      [category]: endIndex < filteredServices.length
    }));
    
    setLoadingMore(false);
  }, [loadingMore, hasMoreServices, services, search, servicesPerPage, currentPage]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && selectedCategory && hasMoreServices[selectedCategory] && !loadingMore) {
          loadMoreServices(selectedCategory);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [selectedCategory, hasMoreServices, loadingMore, loadMoreServices]);

  // Update visible services when category or search changes
  useEffect(() => {
    if (selectedCategory && services[selectedCategory]) {
      initializePagination(selectedCategory, services[selectedCategory]);
    }
  }, [selectedCategory, services, search, initializePagination]);

  const fetchServices = async () => {
    if (!selectedLocation?.centerId) {
      setError('Please select a location first');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setServices({}); // Reset services state
    setVisibleServices({}); // Reset visible services
    setCurrentPage({}); // Reset pagination
    setHasMoreServices({}); // Reset has more state
    
    try {
      const response = await fetch(`/api/services?centerId=${selectedLocation.centerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch services');
      }
      
      if (!data || !data.services || typeof data.services !== 'object') {
        throw new Error('Invalid response format');
      }

      // Validate that we have at least one category with services
      const hasServices = Object.values(data.services).some(
        (categoryServices: any) => Array.isArray(categoryServices) && categoryServices.length > 0
      );

      if (!hasServices) {
        throw new Error('No services available for this location');
      }

      setServices(data.services as CategorizedServices);
      // Set the first category as selected if none is selected
      if (!selectedCategory && Object.keys(data.services).length > 0) {
        setSelectedCategory(Object.keys(data.services)[0]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices({}); // Reset services on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocation?.centerId) {
      fetchServices();
    }
  }, [selectedLocation?.centerId]);

  // Add dataLayer push for service view list
  useEffect(() => {
    if (selectedLocation && Object.keys(services).length > 0 && !loading) {
      const currentCategory = selectedCategory || Object.keys(services)[0];
      const servicesInCategory = services[currentCategory] || [];
      
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'service_view_list',
          service_category: currentCategory,
          location: `${selectedLocation.city} - ${selectedLocation.outlet.name}`,
          service_count: servicesInCategory.length
        });
      }
    }
  }, [selectedLocation, services, selectedCategory, loading]);

  const handleServiceClick = (service: Service) => {
    if (!service || typeof service !== 'object') return;
    
    setSelectedService({
      id: service.id || '',
      name: service.name || '',
      final_price: service.final_price || 0,
      duration: service.duration || 0,
      description: service.description || '',
      image_path: service.image_path || ''
    });
    setIsServiceModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-30"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          minHeight: "100vh",
          width: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background: "linear-gradient(120deg, rgba(245, 241, 232, 0.85) 0%, rgba(229, 231, 235, 0.85) 60%, rgba(178, 213, 228, 0.85) 100%)"
        }}
      />
      {/* Subtle blurred circles */}
      <div className="absolute top-20 -left-60 w-96 h-96 bg-[#e2c799] opacity-40 rounded-full blur-sm -z-30" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[400px] bg-[#b2d5e4] opacity-30 rounded-full blur-xl -z-30" />
      <div className="absolute top-1/3 left-1/2 w-[1600px] h-[1600px] bg-[#b2d5e4] opacity-50 rounded-full blur-3xl -z-30" />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage 
          message={typeof error === 'string' ? error : 'An error occurred while fetching services'} 
          onRetry={() => {
            setError(null);
            if (selectedLocation?.centerId) {
              setLoading(true);
              fetchServices();
            }
          }}
        />
      ) : (
        <div className={`min-h-screen relative overflow-hidden ${isLocationModalOpen || selectedService ? "blur-sm" : ""}`}>
          <div className="relative z-10">
            <div className="top-0 left-0 right-0 z-50">
              <Header />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex flex-col md:flex-row  h-fit">
              

                {/* Desktop Categories Sidebar */}
                <aside className="hidden lg:block w-72 flex-shrink-0 shadow-lg bg-white/50 rounded-xl p-4 mt-2 mb-2 h-fit mr-8">
                  <div className="sticky top-24">
                    <h1 className="text-lg font-semibold text-gray-800 mb-4">Categories</h1>
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
                <main className="flex-1 bg-transparent rounded-xl p-2 sm:p-4 md:p-6 lg:p-8 shadow-sm relative">
                  {/* Divider for desktop */}
                 
                  <div className="flex bg-white/50 backdrop-blur-sm rounded-lg shadow p-3 sm:p-4 md:hidden flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-x-6 mt-4 mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold m-0">Discover Our Services</h1>
                    <div className="w-full sm:w-auto flex-shrink-0">
                      <LocationSelector 
                        selectedLocation={selectedLocation} 
                        onOpen={handleLocationOpen} 
                      />
                    </div>
                  </div>

                  {/* Mobile Header Section */}
                  <div className="md:hidden flex flex-col gap-4 mb-6">
                   
                   
                    <MobileCategoriesDropdown
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={handleCategoryClick}
                      categoryImages={categoryImages}
                    />
                     <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#a07735]/20 to-[#b2d5e4]/20 rounded-lg blur transition-all duration-300 group-hover:blur-md group-focus-within:blur-md"></div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search services..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border-2 bg-white/40 backdrop-blur-sm border-gray-200/50 focus:outline-none focus:border-[#a07735] focus:ring-2 focus:ring-[#a07735]/20 transition-all duration-300 placeholder:text-gray-500 text-gray-700"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {search && (
                            <button
                              onClick={() => setSearch('')}
                              className="p-1 rounded-full hover:bg-gray-100/50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <svg
                            className="h-5 w-5 text-[#a07735] transition-transform duration-300 group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      {search && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 p-2 text-sm text-gray-500">
                          Showing results for "{search}"
                        </div>
                      )}
                    </div>
                  </div>

                 

                  {/* Tablet and Desktop Search Section */}
                  <div className="hidden md:block mb-8 sticky top-0.5 z-10 bg-white/20 backdrop-blur-md rounded-xl shadow-sm p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4">
                        <h1 className="text-xl lg:text-2xl font-bold">Discover Our Services</h1>
                        <LocationSelector 
                          selectedLocation={selectedLocation} 
                          onOpen={handleLocationOpen} 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#a07735]/20 to-[#b2d5e4]/20 rounded-lg blur transition-all duration-300 group-hover:blur-md group-focus-within:blur-md"></div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full px-4 py-3 lg:py-3.5 rounded-lg border-2 bg-white/40 backdrop-blur-sm border-gray-200/50 focus:outline-none focus:border-[#a07735] focus:ring-2 focus:ring-[#a07735]/20 transition-all duration-300 placeholder:text-gray-500 text-gray-700"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {search && (
                                <button
                                  onClick={() => setSearch('')}
                                  className="p-1 rounded-full hover:bg-gray-100/50 transition-colors"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <svg
                                className="h-5 w-5 text-[#a07735] transition-transform duration-300 group-hover:scale-110"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                         
                        </div>
                      </div>
                    </div>
                  </div>

                   {/* Tablet Categories Dropdown */}
                   <TabletCategoriesDropdown
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategoryClick}
                    categoryImages={categoryImages}
                  />

                  {/* Services List */}
                  {selectedCategory && (visibleServices[selectedCategory] || loading) && (
                    <div className="space-y-6">
                      <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6">
                        {selectedCategory}
                        {!loading && services[selectedCategory] && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({visibleServices[selectedCategory]?.length || 0} of {services[selectedCategory].length} services)
                          </span>
                        )}
                      </h1>
                      
                      {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                          {[...Array(6)].map((_, index) => (
                            <ServiceCardSkeleton key={index} />
                          ))}
                        </div>
                      ) : visibleServices[selectedCategory]?.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {visibleServices[selectedCategory].map((service) => (
                              <ServiceCard
                                key={service.id}
                                service={service}
                                categoryImage={categoryImages.find(img => img.name === selectedCategory)?.image || '/categories/default.jpg'}
                                onBookNow={handleBookNow}
                                onReadMore={handleReadMore}
                              />
                            ))}
                          </div>
                          
                          {/* Load More Section */}
                          {hasMoreServices[selectedCategory] && (
                            <div 
                              ref={loadMoreRef}
                              className="flex justify-center py-8"
                            >
                              {loadingMore ? (
                                <div className="w-full">
                                  <div className="flex items-center justify-center gap-3 text-gray-600 mb-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#a07735]"></div>
                                    <span>Loading more services...</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                                    {[...Array(3)].map((_, index) => (
                                      <ServiceCardSkeleton key={index} />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => loadMoreServices(selectedCategory)}
                                  className="px-6 py-3 bg-[#a07735] text-white rounded-lg hover:bg-[#8a6930] transition-colors font-semibold shadow hover:scale-105 hover:shadow-lg focus:outline-none"
                                >
                                  Load More Services
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-500 text-lg mb-4">
                            {search ? `No services found for "${search}"` : 'No services available in this category'}
                          </div>
                          {search && (
                            <button
                              onClick={() => setSearch('')}
                              className="px-4 py-2 bg-[#a07735] text-white rounded-lg hover:bg-[#8a6930] transition-colors"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}