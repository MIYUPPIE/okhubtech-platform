// "use server";

export async function getContactSubmissions() {
  return [
    {
      id: "1",
      type: "CONTACT",
      name: "John Doe",
      email: "john@example.com",
      message: "Hello world",
      createdAt: new Date(),
      resolved: false,
    },
     {
      id: "2",
      type: "PROJECT",
      name: "Jane Smith",
      email: "jane@example.com",
      message: "Build a robot",
      createdAt: new Date(),
      resolved: true,
    }
  ] as any[];
}

export async function resolveSubmission(id: string) {
  // no-op
}
