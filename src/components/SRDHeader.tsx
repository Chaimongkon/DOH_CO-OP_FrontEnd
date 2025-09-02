import React from "react";
import Image from "next/image";

interface SRDHeaderProps {
  /**
   * Image filename (e.g., "Announce.png", "Regularity.png", "Rules.png")
   */
  image: string;
  /**
   * Alt text for the image
   */
  alt: string;
  /**
   * Image width (default: 1400)
   */
  width?: number;
  /**
   * Image height (default: 300)
   */
  height?: number;
}

/**
 * Shared header component for SRD pages (Statute, Regularity, Declare)
 */
export const SRDHeader: React.FC<SRDHeaderProps> = ({
  image,
  alt,
  width = 1400,
  height = 300,
}) => {
  return (
    <div className="text-center">
      <Image
        className="img-fluid"
        src={`/image/ImageMenu/${image}`}
        alt={alt}
        width={width}
        height={height}
        style={{ 
          marginBottom: "50px",
          maxWidth: "100%",
          height: "auto",
          borderRadius: "20px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)"
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
        priority
      />
    </div>
  );
};

export default SRDHeader;