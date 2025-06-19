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
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create user');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
} 