import { NextResponse } from "next/server";

export const dynamic = 'force-static';

// Example portfolio data
const portfolioItems = [
  {
    id: 1,
    title: "AI-Powered Agriculture Platform",
    description: "A scalable platform using AI and IoT to optimize crop yields for African farmers.",
    image: "/portfolio/agriculture.png",
    link: "/portfolio/ai-agriculture",
    tags: ["AI", "IoT", "Agriculture"],
  },
  {
    id: 2,
    title: "Smart Campus Automation",
    description: "End-to-end automation and digital twin for a university campus, improving security and efficiency.",
    image: "/portfolio/smart-campus.png",
    link: "/portfolio/smart-campus",
    tags: ["Automation", "Digital Twin", "Education"],
  },
  {
    id: 3,
    title: "E-Commerce Transformation",
    description: "Modern e-commerce platform with integrated payment and logistics for local businesses.",
    image: "/portfolio/ecommerce.png",
    link: "/portfolio/ecommerce-transformation",
    tags: ["Web", "E-Commerce", "Logistics"],
  },
  {
    id: 4,
    title: "AI Health Assistant",
    description: "Django backend with LLM orchestration for reliable, intelligent healthcare diagnostics and guidance.",
    image: "/portfolio/ai-health-assistant.png",
    link: "/portfolio/ai-health-assistant",
    tags: ["Django", "LLMs", "Healthcare"],
  },
  {
    id: 5,
    title: "UTME Career Advisor",
    description: "Django + LLM-based academic guidance platform assisting students with robust career paths.",
    image: "/portfolio/utme-career-advisor.png",
    link: "/portfolio/utme-career-advisor",
    tags: ["Education", "Django", "LLMs"],
  },
  {
    id: 6,
    title: "Sign Language Educator",
    description: "Computer vision AI system using YOLO and CNNs to facilitate immersive sign language education.",
    image: "/portfolio/sign-language-educator.png",
    link: "/portfolio/sign-language-educator",
    tags: ["Computer Vision", "YOLO", "CNN"],
  },
  {
    id: 7,
    title: "Credit Card Fraud Detection",
    description: "ANN & LSTM-based platform providing real-time, high-accuracy financial fraud prevention.",
    image: "/portfolio/credit-card-fraud.png",
    link: "/portfolio/credit-card-fraud",
    tags: ["Finance", "ANN", "LSTM"],
  },
  {
    id: 8,
    title: "Speech Emotion Recognition",
    description: "GRU-based audio analysis AI extracting complex human emotional insights from speech nuances.",
    image: "/portfolio/speech-emotion.png",
    link: "/portfolio/speech-emotion",
    tags: ["Audio", "GRU", "NLP"],
  },
  {
    id: 9,
    title: "IoT Home Automation",
    description: "Python and embedded systems driving smart home networking, seamless device control, and analytics.",
    image: "/portfolio/iot-home.png",
    link: "/portfolio/iot-home",
    tags: ["Python", "IoT", "Embedded"],
  },
  {
    id: 10,
    title: "Serving Robot",
    description: "ROS-based autonomous navigation robot capable of complex indoor logistics and hospitality.",
    image: "/portfolio/serving-robot.png",
    link: "/portfolio/serving-robot",
    tags: ["Robotics", "ROS", "Autonomy"],
  },
  {
    id: 11,
    title: "Hydroponics Automation System",
    description: "GSM & IoT driven agricultural infrastructure for precision farming and resource management.",
    image: "/portfolio/hydroponics.png",
    link: "/portfolio/hydroponics",
    tags: ["AgriTech", "IoT", "GSM"],
  },
  {
    id: 12,
    title: "Firefighting Robot",
    description: "Vision-based robotic safety system tracking heat signatures to mitigate severe hazards autonomously.",
    image: "/portfolio/firefighting-robot.png",
    link: "/portfolio/firefighting-robot",
    tags: ["Robotics", "Computer Vision", "Safety"],
  }
];

export async function GET() {
  return NextResponse.json(portfolioItems);
}
