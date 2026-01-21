import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["firebase", "@firebase/app", "@firebase/auth", "@firebase/firestore", "@firebase/util"],
};

export default nextConfig;
