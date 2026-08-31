import { NextResponse } from "next/server";

export const dynamic = 'force-static';

// Example portfolio data
const portfolioItems = [
  {
    id: 1,
    title: "AI-Powered Agriculture Platform",
    description: "A scalable platform using AI and IoT to optimize crop yields for African farmers.",
    image: "/media/portfolio/agriculture.webp",
    link: "/portfolio/ai-agriculture",
    tags: ["AI", "IoT", "Agriculture"],
  },
  {
    id: 2,
    title: "Smart Campus Automation",
    description: "End-to-end automation and digital twin for a university campus, improving security and efficiency.",
    image: "/media/portfolio/smart-campus.webp",
    link: "/portfolio/smart-campus",
    tags: ["Automation", "Digital Twin", "Education"],
  },
  {
    id: 3,
    title: "E-Commerce Transformation",
    description: "Modern e-commerce platform with integrated payment and logistics for local businesses.",
    image: "/media/portfolio/ecommerce.webp",
    link: "/portfolio/ecommerce-transformation",
    tags: ["Web", "E-Commerce", "Logistics"],
  },
  {
    id: 4,
    title: "Patient Vitals Monitor",
    description: "Arduino and ESP8266 vitals monitor: temperature, heart rate and ECG on an LCD, with an SMS alert when a reading goes abnormal.",
    image: "/media/projects/health-monitor/02-block-diagram.webp",
    link: "/portfolio/ai-health-assistant",
    tags: ["Arduino", "ESP8266", "Health"],
  },
  {
    id: 5,
    title: "UTME Career Advisor",
    description: "Django + LLM-based academic guidance platform assisting students with robust career paths.",
    image: "/media/portfolio/utme-career-advisor.webp",
    link: "/portfolio/utme-career-advisor",
    tags: ["Education", "Django", "LLMs"],
  },
  {
    id: 6,
    title: "Sign Language Educator",
    description: "Computer vision AI system using YOLO and CNNs to facilitate immersive sign language education.",
    image: "/media/portfolio/sign-language-educator.webp",
    link: "/portfolio/sign-language-educator",
    tags: ["Computer Vision", "YOLO", "CNN"],
  },
  {
    id: 7,
    title: "Credit Card Fraud Detection",
    description: "ANN & LSTM-based platform providing real-time, high-accuracy financial fraud prevention.",
    image: "/media/portfolio/credit-card-fraud.webp",
    link: "/portfolio/credit-card-fraud",
    tags: ["Finance", "ANN", "LSTM"],
  },
  {
    id: 8,
    title: "Speech Emotion Recognition",
    description: "GRU-based audio analysis AI extracting complex human emotional insights from speech nuances.",
    image: "/media/portfolio/speech-emotion.webp",
    link: "/portfolio/speech-emotion",
    tags: ["Audio", "GRU", "NLP"],
  },
  {
    id: 9,
    title: "IoT Home Automation",
    description: "Python and embedded systems driving smart home networking, seamless device control, and analytics.",
    image: "/media/portfolio/iot-home.webp",
    link: "/portfolio/iot-home",
    tags: ["Python", "IoT", "Embedded"],
  },
  {
    id: 10,
    title: "Serving Robot",
    description: "ROS-based autonomous navigation robot capable of complex indoor logistics and hospitality.",
    image: "/media/portfolio/serving-robot.webp",
    link: "/portfolio/serving-robot",
    tags: ["Robotics", "ROS", "Autonomy"],
  },
  {
    id: 11,
    title: "Hydroponics Automation System",
    description: "GSM & IoT driven agricultural infrastructure for precision farming and resource management.",
    image: "/media/portfolio/hydroponics.webp",
    link: "/portfolio/hydroponics",
    tags: ["AgriTech", "IoT", "GSM"],
  },
  {
    id: 12,
    title: "Firefighting Robot",
    description: "Vision-based robotic safety system tracking heat signatures to mitigate severe hazards autonomously.",
    image: "/media/portfolio/firefighting-robot.webp",
    link: "/portfolio/firefighting-robot",
    tags: ["Robotics", "Computer Vision", "Safety"],
  }
];

export async function GET() {
  return NextResponse.json(portfolioItems);
}
