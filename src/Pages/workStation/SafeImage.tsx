import React, { useEffect, useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FALLBACK_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw_HeSzHfBorKS4muw4IIeVvvRgnhyO8Gn8w&s";

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = "image",
  className,
  style,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_URL);

  useEffect(() => {
    if (!src) {
      setImgSrc(FALLBACK_URL);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => setImgSrc(src);
    img.onerror = () => setImgSrc(FALLBACK_URL);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        ...style,
      }}
    />
  );
};

export default SafeImage;