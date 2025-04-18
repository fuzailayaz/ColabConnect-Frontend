import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollabConnect - Collaborate with Peers",
  description: "A platform to connect university students for projects.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "CollabConnect",
    description: "Join hands with fellow students to build amazing projects.",
    type: "website",
    url: "https://collabconnect.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CollabConnect Platform",
      },
    ],
  },
};
