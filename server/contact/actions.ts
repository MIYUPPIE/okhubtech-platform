// "use server"; // Disabled for static export

export type ContactFormState = {
  error?: string;
  success?: string;
};

// Mock contact action
export async function submitContact(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: "Message received (Static Mock)!" };
}
