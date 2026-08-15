const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:5000')
    }
    throw error
  }
}

