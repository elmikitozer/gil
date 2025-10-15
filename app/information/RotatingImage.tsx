"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
  { src: "/dog.png", width: 200, height: 200 },
  { src: "/dogs.png", width: 400, height: 400 },
];

export default function RotatingImage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 1000); // 60 secondes

    return () => clearInterval(interval);
  }, []);

  const current = images[index];

  return (
    <Image
      src={current.src}
      alt="Dog"
      width={current.width}
      height={current.height}
      className="mx-auto"
    />
  );
}
