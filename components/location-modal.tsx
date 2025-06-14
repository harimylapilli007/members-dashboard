"use client"

import { ArrowLeft, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (city: string, outlet: string, centerId: string) => void
}

// Add this at the top of the file after the imports
const scrollbarHide = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  @keyframes sparkle {
    0%, 100% { 
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% { 
      transform: scale(0.5) rotate(180deg);
      opacity: 0.3;
    }
  }

  .twinkle {
    position: relative;
    overflow: hidden;
  }

  .twinkle::before,
  .twinkle::after {
    content: '';
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.2);
  }

  .twinkle::before {
    top: 20%;
    left: 20%;
    animation: sparkle 4s infinite;
  }

  .twinkle::after {
    top: 60%;
    left: 70%;
    animation: sparkle 4s infinite 2s;
  }

  .twinkle .sparkle-1,
  .twinkle .sparkle-2,
  .twinkle .sparkle-3 {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.2);
  }

  .twinkle .sparkle-1 {
    top: 30%;
    left: 80%;
    animation: sparkle 4.5s infinite 0.5s;
  }

  .twinkle .sparkle-2 {
    top: 70%;
    left: 30%;
    animation: sparkle 4.5s infinite 2.5s;
  }

  .twinkle .sparkle-3 {
    top: 40%;
    left: 50%;
    animation: sparkle 4.5s infinite 3s;
  }
`

export default function LocationModal({ isOpen, onClose, onSelectLocation }: LocationModalProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [showOutlets, setShowOutlets] = useState(false)
  const searchParams = useSearchParams()

  // Add style tag for scrollbar hiding
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = scrollbarHide
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Check if a city is already selected in the URL
  useEffect(() => {
    const city = searchParams.get('city')
    if (city && cityOutlets[city]) {
      setSelectedCity(city)
      setShowOutlets(true)
    } else if (city) {
      // If city exists in URL but not in our data, reset to city selection
      setSelectedCity(null)
      setShowOutlets(false)
    }
  }, [searchParams])

  // City data with outlets and center IDs
  const cityOutlets: Record<string, Array<{ name: string, id: string }>> = {
    "Hyderabad": [
      { name: "Jubilee Hills St", id: "349f181f-5c56-438e-b128-70887eda09be" },
      { name: "RGIA Airport", id: "ea5d4cc7-9466-4135-b66e-02280d2ceb96" },
      { name: "Hyderabad Grand", id: "5b99f92a-53dc-43d9-b0eb-8b29c778bb7d" },
      { name: "Dom Airport Level F", id: "dd2070c6-5935-40b2-b13f-8425fd6915be" },
      { name: "Taj Vivanta", id: "e7def4e3-4f13-4022-85bd-fcbaa89df193" },
      { name: "GVK Mall", id: "43e4e02f-6e8c-4f71-acce-b42ac7ef89ad" },
      { name: "Radisson", id: "db97db51-fa88-40c7-8d14-e0de4a18853c" },
      { name: "Svm Grand", id: "382c7ba3-5db8-4b1a-b61c-820590a8ccef" },
      { name: "Ramada Manohar", id: "fd0b1849-c640-472e-a3de-b56165358e2b" },
      { name: "Royalton", id: "02f4f819-6e1c-49c5-b831-c08fc651d4c8" },
      { name: "Novotel HICC", id: "6f040deb-7bc3-4728-890e-696ad17cdafb" }
    ],
    "Bangalore": [
      { name: "Banashankari St", id: "5bee05b9-b470-4498-a6ad-0accb771ffe0" },
      { name: "Radisson Atria", id: "883ec38d-bf5e-4be0-b1fd-d2d7eb87ed5b" },
      { name: "La Marvella", id: "b6d6e3f0-8621-4717-b79a-370d87f8da89" },
      { name: "Adarsh Nagar", id: "3adc38ff-63ee-4974-9c6e-654fa558c85d" },
      { name: "Royal Orchid", id: "297393d6-ee20-4ebb-b25c-d6066a0b4df3" },
      { name: "Dom Airport", id: "fb82a94d-121f-4007-a42f-003a478e5d03" }
    ],
    "Vadodara": [
      { name: "Genda Circle St", id: "5a3186b6-7bf9-41ca-8d75-6ab0bb4185c0" }
    ],
    "Chennai": [
      { name: "Express Mall", id: "8c745587-427d-473b-9237-c87a35fd9521" },
      { name: "Courtyard Marriott", id: "d722725c-dfad-495f-928a-1fc1edec2674" },
      { name: "Forum Mall", id: "2afb599f-c6e3-400a-b958-51b1342597fa" }
    ],
    "Mumbai": [
      { name: "Niranta Hotel", id: "83f0c9f1-f91b-4201-9c43-edfced132d8f" },
      { name: "Niranta 2", id: "49de6c35-f2f4-48e3-b404-5f10ed007089" },
      { name: "Niranta 3", id: "770491a4-a5d0-4e34-a73f-30a62aad1a15" },
      { name: "Lemon Tree", id: "86a0da45-4cd6-4235-afaf-9e4ab0c3f916" },
      { name: "Courtyard Marriott", id: "4a1c048a-ae0f-44e6-aa06-01b33ffc1e37" }
    ],
    "Cochin": [
      { name: "Dom Airport", id: "a56973f6-704b-46f8-8200-f3c44744507e" },
      { name: "Int Airport", id: "dc404033-9b05-4757-b63c-fd1755395a8f" },
      { name: "Int Airport Lounge", id: "a1352d6c-63df-4bda-8a00-bf3786084155" }
    ],
    "Lucknow": [
      { name: "Int Airport", id: "94ff3df4-25a8-4b53-a61c-69644313926f" },
      { name: "Dom Airport", id: "94078349-47bf-4a3c-8272-7b20008ea266" }
    ],
    "Goa": [
      { name: "Fortune Candolim", id: "d069efee-094e-4a30-ba19-9458effffdd4" }
    ],
    "Ahmedabad": [
      { name: "DoubleTree Hilton", id: "60f37c05-f44a-4dd3-aab7-490c32c61d6e" },
      { name: "Novotel", id: "28d6d1a3-a375-4b7d-87c6-137528e280af" }
    ],
    "Udaipur": [
      { name: "Lemon Tree-Udaipur", id: "1efbbc03-3cb9-4c15-9073-a13482504d29" }
    ],
    "Jaipur": [
      { name: "Airport", id: "b0f2a5c7-2029-4d05-b2eb-4e6929844e27" }
    ],
    "Rajahmundry": [
      { name: "Manjeera", id: "59bf0758-8cd4-47f1-8447-3d3b1dd1e40f" }
    ],
    "NewDelhi": [
      { name: "Lemon Tree Premier", id: "e31deb8a-3d80-4e45-867a-87422f8c691a" }
    ],
    "Kodaikanal": [
      { name: "KODAIKANAL CARLTON HOTEL", id: "b44ece7f-ee8f-493a-a705-7c8edb50751d" }
    ]
  }

  const handleCitySelect = (city: string) => {
    if (cityOutlets[city]) {
      setSelectedCity(city)
      setShowOutlets(true)
    }
  }

  const handleBack = () => {
    setShowOutlets(false)
    setSelectedCity(null)
  }

  const handleOutletSelect = (outlet: { name: string, id: string }) => {
    if (selectedCity) {
      try {
        onSelectLocation(selectedCity, outlet.name, outlet.id)
        onClose()
      } catch (error) {
        console.error('Error selecting outlet:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      {!showOutlets ? (
        // City selection modal
        <div className="bg-[#FAF5EB] rounded-lg overflow-hidden w-full max-w-full sm:max-w-lg max-h-[90vh] sm:max-h-[70vh] flex flex-col">
          <div className="bg-[#ae7735] text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-medium text-center">Select your city</h1>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 sm:p-8 overflow-y-auto scrollbar-hide">
            <h3 className="text-base sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Popular Cities</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Popular Cities Section */}
              <div
                className="flex items-center p-4 bg-gradient-to-r bg-[#ae7735] rounded-lg cursor-pointer hover:opacity-90 transition-all twinkle"
                onClick={() => handleCitySelect("Mumbai")}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mr-4 flex items-center justify-center bg-white rounded-full relative z-10">
                  <Image
                    src="/city_icons/mumbai.png"
                    alt="Mumbai"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium relative z-10 text-[16px] md:text-lg">Mumbai</span>
                <div className="sparkle-1"></div>
                <div className="sparkle-2"></div>
                <div className="sparkle-3"></div>
              </div>

              <div
                className="flex items-center p-4 bg-gradient-to-r bg-[#ae7735] rounded-lg cursor-pointer hover:opacity-90 transition-all twinkle"
                onClick={() => handleCitySelect("Hyderabad")}
              >
                <div className="w-12 h-12 mr-4 flex items-center justify-center bg-white rounded-full relative z-10">
                  <Image
                    src="/city_icons/Hyderabad.png"
                    alt="Hyderabad"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium relative z-10 text-[16px] md:text-lg">Hyderabad</span>
                <div className="sparkle-1"></div>
                <div className="sparkle-2"></div>
                <div className="sparkle-3"></div>
              </div>

              <div
                className="flex items-center p-4 bg-gradient-to-r bg-[#ae7735] rounded-lg cursor-pointer hover:opacity-90 transition-all twinkle"
                onClick={() => handleCitySelect("Chennai")}
              >
                <div className="w-12 h-12 mr-4 flex items-center justify-center bg-white rounded-full relative z-10">
                  <Image
                    src="/city_icons/Chennai.png"
                    alt="Chennai"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium relative z-10 text-[16px] md:text-lg">Chennai</span>
                <div className="sparkle-1"></div>
                <div className="sparkle-2"></div>
                <div className="sparkle-3"></div>
              </div>

              <div
                className="flex items-center p-4 bg-gradient-to-r bg-[#ae7735] rounded-lg cursor-pointer hover:opacity-90 transition-all twinkle"
                onClick={() => handleCitySelect("NewDelhi")}
              >
                <div className="w-12 h-12 mr-4 flex items-center justify-center bg-white rounded-full relative z-10">
                  <Image
                    src="/city_icons/Delhi.png"
                    alt="Delhi"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium relative z-10 text-[16px] md:text-lg">New Delhi</span>
                <div className="sparkle-1"></div>
                <div className="sparkle-2"></div>
                <div className="sparkle-3"></div>
              </div>

              <div
                className="flex items-center p-4 bg-gradient-to-r bg-[#ae7735] rounded-lg cursor-pointer hover:opacity-90 transition-all twinkle"
                onClick={() => handleCitySelect("Bangalore")}
              >
                <div className="w-12 h-12 mr-4 flex items-center justify-center bg-white rounded-full relative z-10">
                  <Image
                    src="/city_icons/Bangalore.png"
                    alt="Bangalore"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium relative z-10 text-[16px] md:text-lg">Bangalore</span>
                <div className="sparkle-1"></div>
                <div className="sparkle-2"></div>
                <div className="sparkle-3"></div>
              </div>
            </div>

            <h3 className="text-base sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">All Cities</h3>
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {/* Row 1 */}
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Ahmedabad")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Ahmedabad.png"
                    alt="Ahmedabad"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Ahmedabad</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Bangalore")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Bangalore.png"
                    alt="Bangalore"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Bangalore</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Chennai")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Chennai.png"
                    alt="Chennai"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Chennai</span>
              </div>

              {/* Row 2 */}
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Cochin")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Cochin.png"
                    alt="Cochin"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Cochin</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("NewDelhi")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Delhi.png"
                    alt="Delhi"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">New Delhi</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Hyderabad")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Hyderabad.png"
                    alt="Hyderabad"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Hyderabad</span>
              </div>

              {/* Row 3 */}
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Jaipur")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/jaipur.png"
                    alt="Jaipur"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Jaipur</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Kodaikanal")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/kodaikanal.png"
                    alt="Kodaikanal"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Kodaikanal</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Lucknow")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/lucknow.png"
                    alt="Lucknow"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Lucknow</span>
              </div>

              {/* Row 4 */}
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Mumbai")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/mumbai.png"
                    alt="Mumbai"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Mumbai</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Rajahmundry")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Rajamundry.png"
                    alt="Rajamahendravaram"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm text-center">Rajahmundry</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Udaipur")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/udaipur.png"
                    alt="Udaipur"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Udaipur</span>
              </div>

              {/* Row 5 */}
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
                onClick={() => handleCitySelect("Vadodara")}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src="/city_icons/Vadodara.png"
                    alt="Vadodara"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-800 text-sm">Vadodara</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Outlet selection modal
        <div className="bg-[#FAF5EB] rounded-lg overflow-hidden max-w-lg w-full max-h-[70vh] flex flex-col">
          <div className="bg-[#ae7735] text-white p-4 flex justify-between items-center">
            <div className="w-6"></div>
            <h1 className="text-xl font-medium">Select your Outlet</h1>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-8 overflow-y-auto scrollbar-hide">
            <div className="flex justify-start items-center mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-700 hover:text-[#a07735] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-[16px]">Back</span>
              </button>
              <div className="flex-1"></div>
              <span className="font-bold text-center ">{selectedCity}</span>
              <div className="flex-1"></div>
            </div>

            <div className="space-y-3">
              {selectedCity && cityOutlets[selectedCity] ? (
                [...cityOutlets[selectedCity]]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((outlet, index) => (
                    <button
                      key={index}
                      className={`w-full p-3 rounded-md text-center transition-colors ${
                          "bg-white/20 font-marcellus backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-[#ae7735] hover:text-white"
                      }`}
                      onClick={() => handleOutletSelect(outlet)}
                    >
                      {outlet.name}
                    </button>
                  ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No outlets available for this city
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
