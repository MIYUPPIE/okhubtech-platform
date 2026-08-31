// "use server";

export async function getStoreOverview() {
  return {
    stats: [
      { label: "Products", value: '10' },
      { label: "Out of Stock", value: '2' },
    ],
    products: [
      {
        id: "1",
        title: "Arduino Kit",
        type: "Electronics",
        description: "Starter kit",
        inventory: 50,
        currency: "NGN",
        price: 25000,
        active: true
      }
    ]
  };
}
