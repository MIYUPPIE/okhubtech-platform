"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { ReactNode } from "react";

const FloatRig = ({
  children,
  speed = 2,
  floatIntensity = 1.2,
  rotationIntensity = 1,
}: {
  children: ReactNode;
  speed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
}) => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * speed) * 0.15 * floatIntensity;
    ref.current.rotation.x = Math.sin(t * speed) * 0.08 * rotationIntensity;
    ref.current.rotation.y = Math.cos(t * speed) * 0.12 * rotationIntensity;
  });
  return <group ref={ref}>{children}</group>;
};
import WavyBackground from "@/components/ui/WavyBackground";

const innovationItems = [
  {
    title: "Biointelligent AI",
    description: "DNA-grade neural choreography for health, biotech, and precision manufacturing programs.",
    focus: "DNA Helix",
    variant: "dna" as const,
  },
  {
    title: "Future of Nutrition",
    description: "3D ingredient twins, volumetric commerce, and adaptive nutrition guidance for global brands.",
    focus: "Nutrition Cylinder",
    variant: "cylinder" as const,
  },
  {
    title: "Energy Autonomy",
    description: "Smart grids, predictive maintenance, and orchestration suites for renewable infrastructure.",
    focus: "Energy Torus",
    variant: "torus" as const,
  },
  {
    title: "Cognitive Genomics",
    description: "Generative co-pilots accelerating drug discovery, lab robotics, and genomics analytics.",
    focus: "AI Genome",
    variant: "genome" as const,
  },
];

type InnovationVariant = (typeof innovationItems)[number]["variant"];

const DnaHelix = () => {
  const nodes = useMemo(() => {
    return Array.from({ length: 36 }).map((_, index) => {
      const angle = index * 0.4;
      const y = (index - 18) * 0.12;
      const radius = 0.8;
      return {
        position: [Math.sin(angle) * radius, y, Math.cos(angle) * radius] as [number, number, number],
        color: index % 2 === 0 ? "#FFD700" : "#F7B801",
      };
    });
  }, []);

  return (
    <group>
      {nodes.map((node, idx) => (
        <mesh key={idx} position={node.position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={node.color} />
        </mesh>
      ))}
    </group>
  );
};

const NutritionCylinder = () => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() / 3;
  });
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[1, 1, 2.5, 36, 1, true]} />
        <meshStandardMaterial
          color="#CC9900"
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.5}
          side={2}
        />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.7, 0.08, 24, 64]} />
        <meshStandardMaterial color="#F7B801" />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <torusGeometry args={[0.7, 0.08, 24, 64]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

const EnergyTorus = () => (
  <mesh rotation-x={Math.PI / 2}>
    <torusKnotGeometry args={[0.9, 0.22, 220, 32]} />
    <meshStandardMaterial
      color="#FFD700"
      emissive="#F7B801"
      emissiveIntensity={0.4}
      metalness={0.9}
      roughness={0.15}
    />
  </mesh>
);

const GenomeOrbitals = () => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.set(clock.getElapsedTime() / 4, clock.getElapsedTime() / 6, 0);
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#F7B801" wireframe />
      </mesh>
      {[1.2, 1.5, 1.8].map((radius) => (
        <mesh key={radius}>
          <torusGeometry args={[radius, 0.02, 16, 80]} />
          <meshStandardMaterial color="white" opacity={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
};

const InnovationCanvas = ({ variant }: { variant: InnovationVariant }) => {
  const getScene = () => {
    switch (variant) {
      case "dna":
        return <DnaHelix />;
      case "cylinder":
        return <NutritionCylinder />;
      case "torus":
        return <EnergyTorus />;
      case "genome":
      default:
        return <GenomeOrbitals />;
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 3, 5]} intensity={1} />
      <FloatRig speed={2} floatIntensity={1.5} rotationIntensity={1.2}>
        {getScene()}
      </FloatRig>
    </Canvas>
  );
};

const InnovationSection = () => (
  <section className="section-shell">
    <div className="container-default space-y-10">
      <motion.div
        className="space-y-5 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <p className="section-heading">Research & Innovation</p>
        <h2 className="section-title font-display text-black dark:text-white">
          Experience the future of technology with Okhub Innovation.
        </h2>
        <p className="mx-auto max-w-3xl text-black/75 dark:text-white/75">
          Dive into Digital Twin Technology, AI-enhanced genomics, 3D nutrition, and energy-harvesting wearables built for African industries. Just as every tribe speaks its own language, every mission we tackle has a unique syntax—these labs help decode it.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary">Join Our Research</button>
          <button className="btn-secondary">Documentation</button>
        </div>
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-2">
        {innovationItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <WavyBackground>
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-black/65 dark:text-white/50">{item.focus}</p>
                  <h3 className="text-2xl font-semibold text-black dark:text-white">{item.title}</h3>
                  <p className="text-sm text-black/70 dark:text-white/70">{item.description}</p>
                </div>
                <div className="h-64 overflow-hidden rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70">
                  <InnovationCanvas variant={item.variant} />
                </div>
              </div>
            </WavyBackground>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default InnovationSection;
