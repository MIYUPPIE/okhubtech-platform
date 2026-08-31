// "use server"; // Disabled for static export

// Mock types
export type AuthState = {
  error?: string;
  success?: string;
};

// Mock login action
export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { error: "Login is not supported in static export." };
}

// Mock register action
export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { error: "Registration is not supported in static export." };
}
