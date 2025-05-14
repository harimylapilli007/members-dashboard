"use client"

import React, { useState, use } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Wifi, Coffee, Utensils, Car, Tv, Bath, Dumbbell } from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: string;
  bedType: string;
  images: string[];
  amenities: string[];
}

const ROOM_TYPES: { [key: string]: RoomType[] } = {
  '1': [ // Maldives Paradise Resort
    {
      id: 'deluxe-overwater',
      name: 'Deluxe Overwater Villa',
      description: 'Luxurious overwater villa with direct ocean access and private sundeck',
      price: 1500,
      capacity: 2,
      size: '125 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578682010664-f0012d5dd4bc?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Ocean View', 'Butler Service', 'Mini Bar', 'Rain Shower', 'Smart TV']
    },
    {
      id: 'premium-beach',
      name: 'Premium Beach Villa',
      description: 'Spacious beachfront villa with private garden and direct beach access',
      price: 1200,
      capacity: 3,
      size: '150 sqm',
      bedType: '1 King Bed + 1 Single Bed',
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Beach Access', 'Private Garden', 'Outdoor Shower', 'Mini Bar', 'Smart TV']
    }
  ],
  '2': [ // Swiss Alpine Lodge
    {
      id: 'mountain-suite',
      name: 'Mountain View Suite',
      description: 'Elegant suite with panoramic mountain views and private balcony',
      price: 1000,
      capacity: 2,
      size: '100 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1601701119533-fde78fc5a0c9?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1601701119469-c8e80fd7ba0c?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Mountain View', 'Fireplace', 'Balcony', 'Mini Bar', 'Spa Bath']
    },
    {
      id: 'chalet-suite',
      name: 'Alpine Chalet Suite',
      description: 'Traditional Swiss chalet with modern amenities and ski-in access',
      price: 1300,
      capacity: 4,
      size: '180 sqm',
      bedType: '2 King Beds',
      images: [
        'https://images.unsplash.com/photo-1595274459742-4a41d35784ee?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595274459772-5e6f562f4fdd?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Ski Access', 'Private Hot Tub', 'Kitchen', 'Fireplace', 'Boot Warmers']
    }
  ],
  '3': [ // Dubai Desert Oasis
    {
      id: 'royal-suite',
      name: 'Royal Desert Suite',
      description: 'Opulent suite with desert views and private infinity pool',
      price: 2000,
      capacity: 2,
      size: '200 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1631049035182-249067d7618e?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Desert View', 'Butler Service', 'Mini Bar', 'Private Terrace']
    },
    {
      id: 'bedouin-villa',
      name: 'Bedouin-Inspired Villa',
      description: 'Traditional Arabian villa with modern luxury and desert views',
      price: 1800,
      capacity: 4,
      size: '250 sqm',
      bedType: '2 King Beds',
      images: [
        'https://images.unsplash.com/photo-1630460550401-b9d935782f91?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1630460550472-d5981b7dc922?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1630460550503-e5f2f2f2f2f2?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Garden', 'Plunge Pool', 'Majlis Seating', 'Outdoor Dining']
    }
  ],
  '4': [ // Santorini Retreat
    {
      id: 'infinity-cave',
      name: 'Infinity Cave Suite',
      description: 'Cave-style suite with private infinity pool and caldera views',
      price: 1500,
      capacity: 2,
      size: '120 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1570213489059-0aac6626cade?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Caldera View', 'Terrace', 'Mini Bar', 'Jacuzzi']
    },
    {
      id: 'sunset-villa',
      name: 'Sunset View Villa',
      description: 'Traditional Cycladic villa with panoramic sunset views',
      price: 1300,
      capacity: 3,
      size: '150 sqm',
      bedType: '1 King Bed + 1 Sofa Bed',
      images: [
        'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1602343168076-92d5905c0b17?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Terrace', 'Outdoor Dining', 'Plunge Pool', 'Wine Cellar']
    }
  ],
  '5': [ // Bali Resort
    {
      id: 'jungle-villa',
      name: 'Jungle Pool Villa',
      description: 'Private villa surrounded by tropical jungle with infinity pool',
      price: 900,
      capacity: 2,
      size: '180 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Jungle View', 'Outdoor Shower', 'Yoga Deck']
    },
    {
      id: 'rice-villa',
      name: 'Rice Terrace Villa',
      description: 'Traditional Balinese villa overlooking rice paddies',
      price: 800,
      capacity: 3,
      size: '200 sqm',
      bedType: '1 King Bed + 1 Single Bed',
      images: [
        'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Rice Field View', 'Private Garden', 'Open-air Bathroom', 'Meditation Space']
    }
  ],
  '6': [ // Kyoto Resort
    {
      id: 'zen-suite',
      name: 'Zen Garden Suite',
      description: 'Traditional Japanese suite with private zen garden',
      price: 1200,
      capacity: 2,
      size: '100 sqm',
      bedType: 'Traditional Futons',
      images: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Garden', 'Tea Room', 'Onsen Bath', 'Tatami Floors']
    },
    {
      id: 'imperial-suite',
      name: 'Imperial Suite',
      description: 'Luxurious suite combining traditional and modern Japanese aesthetics',
      price: 1500,
      capacity: 4,
      size: '150 sqm',
      bedType: '2 King Beds or Traditional Futons',
      images: [
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Onsen', 'Garden View', 'Tea Ceremony Room', 'Modern Kitchen']
    }
  ],
  '7': [ // Seychelles Beach Haven
    {
      id: 'ocean-view-villa',
      name: 'Ocean View Villa',
      description: 'Luxurious villa with breathtaking ocean views and private beach access',
      price: 1000,
      capacity: 2,
      size: '150 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Ocean View', 'Private Beach', 'Outdoor Shower', 'Mini Bar']
    },
    {
      id: 'garden-villa',
      name: 'Garden Villa',
      description: 'Tropical villa surrounded by lush gardens and private pool',
      price: 900,
      capacity: 3,
      size: '180 sqm',
      bedType: '1 King Bed + 1 Sofa Bed',
      images: [
        'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Garden View', 'Outdoor Dining', 'Mini Bar']
    }
  ],
  '8': [ // Canadian Wilderness Lodge
    {
      id: 'mountain-lodge',
      name: 'Mountain Lodge',
      description: 'Cozy mountain lodge with private hot tub and forest views',
      price: 800,
      capacity: 2,
      size: '100 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Hot Tub', 'Forest View', 'Fireplace', 'Mini Bar']
    },
    {
      id: 'forest-cabin',
      name: 'Forest Cabin',
      description: 'Secluded forest cabin with private deck and BBQ facilities',
      price: 700,
      capacity: 3,
      size: '120 sqm',
      bedType: '1 King Bed + 1 Sofa Bed',
      images: [
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Deck', 'BBQ Facilities', 'Forest View', 'Mini Bar']
    }
  ],
  '9': [ // Tuscan Vineyard Estate
    {
      id: 'vineyard-suite',
      name: 'Vineyard Suite',
      description: 'Luxurious suite with private vineyard views and wine tasting experiences',
      price: 1100,
      capacity: 2,
      size: '150 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Vineyard View', 'Wine Tasting', 'Private Garden', 'Mini Bar']
    },
    {
      id: 'olive-grove-villa',
      name: 'Olive Grove Villa',
      description: 'Traditional Tuscan villa surrounded by olive groves and private pool',
      price: 1000,
      capacity: 3,
      size: '180 sqm',
      bedType: '1 King Bed + 1 Sofa Bed',
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Private Pool', 'Olive Grove View', 'Outdoor Dining', 'Mini Bar']
    }
  ],
  '10': [ // Caribbean Coral Resort
    {
      id: 'oceanfront-suite',
      name: 'Oceanfront Suite',
      description: 'Luxurious suite with direct ocean access and private balcony',
      price: 1300,
      capacity: 2,
      size: '150 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Ocean View', 'Private Balcony', 'Mini Bar', 'Beach Access']
    },
    {
      id: 'beachside-villa',
      name: 'Beachside Villa',
      description: 'Tropical villa with private beach access and outdoor shower',
      price: 1200,
      capacity: 3,
      size: '180 sqm',
      bedType: '1 King Bed + 1 Sofa Bed',
      images: [
        'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Beach Access', 'Outdoor Shower', 'Private Garden', 'Mini Bar']
    }
  ],
  '11': [ // French Riviera Palace
    {
      id: 'palace-suite',
      name: 'Palace Suite',
      description: 'Luxurious suite with Mediterranean views and private yacht access',
      price: 2000,
      capacity: 2,
      size: '200 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Mediterranean View', 'Private Yacht', 'Mini Bar', 'Private Balcony']
    }
  ],
  '12': [ // Amazon Rainforest Eco-Lodge
    {
      id: 'treehouse-suite',
      name: 'Luxury Treehouse Suite',
      description: 'Elevated treehouse suite with panoramic rainforest views and private deck',
      price: 1600,
      capacity: 2,
      size: '120 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Rainforest View', 'Private Deck', 'Outdoor Shower', 'Eco-Friendly Amenities']
    },
    {
      id: 'riverside-villa',
      name: 'Riverside Villa',
      description: 'Spacious villa along the Amazon River with private pier and observation deck',
      price: 1800,
      capacity: 4,
      size: '200 sqm',
      bedType: '2 King Beds',
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['River View', 'Private Pier', 'Wildlife Observation Deck', 'Mini Bar']
    }
  ],
  '13': [ // New Zealand Alpine Retreat
    {
      id: 'alpine-suite',
      name: 'Alpine Luxury Suite',
      description: 'Premium suite with panoramic views of the Southern Alps and private helipad',
      price: 1800,
      capacity: 2,
      size: '150 sqm',
      bedType: '1 King Bed',
      images: [
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Mountain View', 'Private Helipad', 'Hot Tub', 'Fireplace']
    },
    {
      id: 'mountain-chalet',
      name: 'Mountain Lake Chalet',
      description: 'Cozy chalet with stunning lake views and private outdoor terrace',
      price: 1600,
      capacity: 4,
      size: '180 sqm',
      bedType: '2 King Beds',
      images: [
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1920&auto=format&fit=crop'
      ],
      amenities: ['Lake View', 'Private Terrace', 'BBQ Facilities', 'Mini Bar']
    }
  ]
};

const AMENITY_ICONS = {
  'Wifi': <Wifi className="h-4 w-4" />,
  'Restaurant': <Utensils className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Pool': <Bath className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Coffee': <Coffee className="h-4 w-4" />,
};

export default function ResortDetailPage({ params }: { params: Promise<{ membershipType: string; resortId: string }> }) {
  const { membershipType, resortId } = use(params);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const rooms = ROOM_TYPES[resortId] || [];

  const handleBooking = () => {
    if (!date || !selectedRoom) return;

    const booking = {
      id: Math.random().toString(36).substring(2, 9),
      resortId,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      date: date.toISOString(),
      guests,
      totalPrice: selectedRoom.price * guests,
      bookingDate: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(localStorage.getItem('resortBookings') || '[]');
    localStorage.setItem('resortBookings', JSON.stringify([...existingBookings, booking]));

    toast({
      title: "Booking Confirmed!",
      description: `Your ${selectedRoom.name} has been booked for ${date.toLocaleDateString()} for ${guests} guests.`,
    });

    setDate(undefined);
    setGuests(1);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout membershipType={membershipType}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Select Your Room</h1>
          <div className="flex gap-2">
            {Object.entries(AMENITY_ICONS).map(([name, icon]) => (
              <div key={name} className="flex items-center gap-1 text-sm text-gray-600">
                {icon}
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="rooms" className="w-full">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="amenities">Resort Amenities</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={room.images[0]} 
                      alt={room.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>{room.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">${room.price}/night</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Room Size:</span> {room.size}
                      </div>
                      <div>
                        <span className="font-medium">Bed Type:</span> {room.bedType}
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span> {room.capacity} guests
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Room Amenities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {room.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsDialogOpen(true);
                      }}
                    >
                      Select Room
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="amenities">
            <Card>
              <CardHeader>
                <CardTitle>Resort Facilities & Services</CardTitle>
                <CardDescription>
                  Enjoy our world-class amenities and services during your stay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Wellness</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Spa and Wellness Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Fitness Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Yoga Classes</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Dining</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Multiple Restaurants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>24/7 Room Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Beach Bar</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Activities</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Water Sports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Diving Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Evening Entertainment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedRoom && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book {selectedRoom.name}</DialogTitle>
                <DialogDescription>Select your stay dates and number of guests</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Check-in Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedRoom.capacity}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum capacity: {selectedRoom.capacity} guests
                  </p>
                </div>
                {date && (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-semibold mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>Room: {selectedRoom.name}</p>
                      <p>Check-in: {date.toLocaleDateString()}</p>
                      <p>Guests: {guests}</p>
                      <p className="font-semibold">Total: ${selectedRoom.price * guests}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleBooking} disabled={!date}>
                  Confirm Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
} 