// "use server";

export async function getProgramsWithTracks() {
  return [
    {
      id: "1",
      title: "Robotics 101",
      description: "Intro to robots",
      status: "OPEN",
      price: 50000,
      currency: "NGN",
      capacity: 20,
      tracks: [
        { id: "t1", name: "Beginner", level: "Beginner", description: "Start here" }
      ]
    }
  ] as any[];
}
