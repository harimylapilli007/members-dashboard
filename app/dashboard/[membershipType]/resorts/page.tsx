"use client"

import React, { use } from 'react';
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const RESORTS_BY_MEMBERSHIP = {
  essential: [
    {
      id: '1',
      name: 'Maldives Paradise Resort & Spa',
      location: 'Malé, Maldives',
      description: 'Experience luxury in our overwater villas with private pools, direct ocean access, and stunning sunset views.',
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '2',
      name: 'Swiss Alpine Lodge & Wellness',
      location: 'Zermatt, Switzerland',
      description: 'Nestled in the heart of the Swiss Alps, this luxury mountain retreat offers ski-in/ski-out access and thermal spas.',
      price: 800,
      imageUrl: 'https://images.unsplash.com/photo-1526281216101-e55f00f0db7a?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '7',
      name: 'Seychelles Beach Haven',
      location: 'Mahé, Seychelles',
      description: 'A tropical paradise featuring pristine beaches, crystal-clear waters, and luxurious beachfront accommodations.',
      price: 950,
      imageUrl: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '8',
      name: 'Canadian Wilderness Lodge',
      location: 'Banff, Canada',
      description: 'An authentic mountain lodge experience with stunning views of the Rockies, perfect for nature enthusiasts.',
      price: 700,
      imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop',
    }
  ],
  classic: [
    {
      id: '3',
      name: 'Desert Oasis Palace Resort',
      location: 'Dubai, UAE',
      description: 'A magnificent desert oasis featuring traditional Arabian architecture and private desert-view pools.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '4',
      name: 'Santorini Cliffside Retreat',
      location: 'Oia, Santorini, Greece',
      description: 'Perched on the cliffs of Santorini, this boutique resort offers cave-style suites and infinity pools.',
      price: 900,
      imageUrl: 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '9',
      name: 'Tuscan Vineyard Estate',
      location: 'Florence, Italy',
      description: 'A restored medieval castle surrounded by vineyards, offering wine tasting and culinary experiences.',
      price: 1100,
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '10',
      name: 'Caribbean Coral Resort',
      location: 'St. Lucia, Caribbean',
      description: 'Luxury beachfront resort with private beaches, coral reef diving, and romantic sunset cruises.',
      price: 1300,
      imageUrl: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1920&auto=format&fit=crop',
    }
  ],
  signature: [
    {
      id: '5',
      name: 'Bali Beachfront Villa Resort',
      location: 'Ubud, Bali, Indonesia',
      description: 'Immerse yourself in Balinese luxury with private beach villas and traditional spa treatments.',
      price: 700,
      imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '6',
      name: 'Kyoto Zen Garden Resort',
      location: 'Kyoto, Japan',
      description: 'Experience traditional Japanese hospitality in our ryokan-style resort with zen gardens.',
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '11',
      name: 'French Riviera Palace',
      location: 'Saint-Tropez, France',
      description: 'Historic palace hotel with Mediterranean views, private yacht access, and Michelin-starred dining.',
      price: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '12',
      name: 'Amazon Rainforest Eco-Lodge',
      location: 'Manaus, Brazil',
      description: 'Luxury treehouse villas in the heart of the Amazon, offering unique wildlife experiences and river cruises.',
      price: 1600,
      imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1920&auto=format&fit=crop',
    },
    {
      id: '13',
      name: 'New Zealand Alpine Retreat',
      location: 'Queenstown, New Zealand',
      description: 'Exclusive mountain lodge with helicopter access, offering pristine views of the Southern Alps.',
      price: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop',
    }
  ]
};

export default function ResortsPage({ params }: { params: Promise<{ membershipType: string }> }) {
  const { membershipType } = use(params);
  const resorts = RESORTS_BY_MEMBERSHIP[membershipType as keyof typeof RESORTS_BY_MEMBERSHIP] || [];

  return (
    <DashboardLayout membershipType={membershipType}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Available Resorts</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resorts.map((resort) => (
            <Card key={resort.id} className="overflow-hidden min-w-[320px] min-h-[480px] flex flex-col">
              <div className="aspect-video relative h-[240px]">
                <img 
                  src={resort.imageUrl} 
                  alt={resort.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{resort.name}</CardTitle>
                <CardDescription className="text-sm">{resort.location}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-4">{resort.description}</p>
                <p className="text-lg font-semibold">Starting from ${resort.price}/night</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link href={`/dashboard/${membershipType}/resorts/${resort.id}`} className="w-full">
                  <Button className="w-full">View Rooms</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 