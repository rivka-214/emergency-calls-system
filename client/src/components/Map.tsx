import React from "react";

interface MapProps {
  latitude: number;
  longitude: number;
}

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div style={{ width: "100%", height: "300px", border: "1px solid #ccc" }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        title="Map"
      ></iframe>
    </div>
  );
};

export default Map;
