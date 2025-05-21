import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  email: string;
  phone: string;
}

interface AccountSelectorProps {
  guests: Guest[];
  onSelect: (guest: Guest) => void;
}

export function AccountSelector({ guests, onSelect }: AccountSelectorProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-gray-900">Select Account</CardTitle>
        <CardDescription className="text-gray-700">
          Multiple accounts found. Please select the account you want to access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {guests.map((guest) => (
            <Button
              key={guest.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelect(guest)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium text-gray-900">
                  {guest.id}
                </span>
                {/* <span className="text-sm text-gray-500">{guest.email}</span> */}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 