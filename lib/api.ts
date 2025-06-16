interface CreateUserData {
  first_name: string;
  last_name: string;
  mobile_phone: {
    country_code: number;
    number: string;
  };
  email?: string;
  gender?: number;
}

export async function createZenotiUser(userData: CreateUserData) {
  try {
    const response = await fetch('https://api.zenoti.com/v1/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.NEXT_PUBLIC_ZENOTI_API_KEY}`
      },
      body: JSON.stringify({
        center_id: "92d41019-c790-4668-9158-a693e531c1a4", // Using the admin center ID from the codebase
        personal_info: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          mobile_phone: userData.mobile_phone,
          email: userData.email,
          gender: userData.gender
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
} 