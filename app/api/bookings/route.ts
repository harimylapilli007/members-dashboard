import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resortId, date, guests } = body;

    if (!resortId || !date || !guests) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create the booking in the database
    const booking = await db.booking.create({
      data: {
        userId,
        resortId,
        bookingDate: new Date(date),
        numberOfGuests: guests,
        status: 'CONFIRMED',
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('[BOOKINGS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 