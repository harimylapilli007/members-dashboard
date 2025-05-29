'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Guest {
  id: string;
  center_id: string;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    mobile_phone: {
      number: string;
    };
  };
}

interface AccountSelectorProps {
  guests: Guest[];
  onSelect: (guest: Guest) => void;
  onClose: () => void;
}

export function AccountSelector({ guests, onSelect, onClose }: AccountSelectorProps) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-[#a07735] text-white rounded-t-lg">
        <CardTitle className="text-xl font-medium text-center">Select Account</CardTitle>
        <CardDescription className="text-white/90 text-center">Choose the account you want to use</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {guests.map((guest) => (
            <Button
              key={guest.id}
              variant="outline"
              className="w-full justify-start hover:bg-[#ede5db] hover:text-[#a07735] border-gray-300"
              onClick={() => onSelect(guest)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {guest.personal_info.first_name} {guest.personal_info.last_name}
                </span>
                <span className="text-sm text-gray-500">
                  {guest.personal_info.email || guest.personal_info.mobile_phone.number}
                </span>
              </div>
            </Button>
          ))}
          <Button
            variant="outline"
            className="w-full mt-4 text-[#a07735] hover:bg-[#ede5db] hover:text-[#a07735] border-gray-300"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 