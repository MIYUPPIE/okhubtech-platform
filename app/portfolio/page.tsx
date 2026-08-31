"use client";

import React, { useEffect, useState } from "react";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-8 text-white">Our Portfolio</h1>
      {loading ? (
        <p className="text-white/70">Loading portfolio...</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              className="rounded-2xl border border-white/10 bg-black/70 p-6 flex flex-col gap-3 hover:border-gold-primary transition-colors"
            >
              <img
                src={item.image}
                alt={item.title}
                className="rounded-xl mb-3 w-full h-48 object-cover border border-white/10"
              />
              <h2 className="text-xl font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-white/70 mb-2">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded bg-gold-primary/10 text-gold-primary text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
