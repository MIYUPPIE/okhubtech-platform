import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for LiteSpeed/Apache shared hosting (cPanel).
  output: 'export',

  // REQUIRED for Apache/LiteSpeed. Without it the export writes
  // `services/cctv-surveillance.html` next to a real `services/cctv-surveillance/`
  // directory holding only RSC `.txt` payloads. mod_dir then 301s
  // `/services/cctv-surveillance` -> `/services/cctv-surveillance/`, finds no
  // index.html in that directory, and serves an autoindex listing instead of the
  // page. With trailingSlash the HTML is written as
  // `services/cctv-surveillance/index.html`, which the directory request serves.
  trailingSlash: true,

  // No Image Optimization server exists on static hosting.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
