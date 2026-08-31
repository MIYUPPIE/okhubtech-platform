// "use server";

export async function getAdminOverview() {
  // Mock data for static export
  return {
    stats: [
      { label: "Programs", value: "5" },
      { label: "Students", value: "120" },
      { label: "Products", value: "12" },
      { label: "Inbox", value: "3" },
    ],
    contactOpen: 3,
  };
}
