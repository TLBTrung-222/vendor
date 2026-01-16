import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./PostcodeMap.scss";
import L from "leaflet";
import { useState, useMemo, useEffect, useRef } from "react";
import { postcodeList } from "../../utils/PostalcodeList";
import Helpers from "../../utils/Helpers";

const customIcon = new L.Icon({
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Interface for postcode with coordinates (used internally for map display)
interface PostcodeCoords {
  code: string;
  label: string;
  lat: number;
  lng: number;
}

interface IPostcodeMap {
  selectedPostcode: { code: string; radius: number }[];
  setSelectedPostcode: (postcode: any) => void;
  setIsEditing?: (isEditing: boolean) => void;
}

function PostcodeMap({
  selectedPostcode,
  setSelectedPostcode,
  setIsEditing,
}: IPostcodeMap) {
  const defaultPosition: [number, number] = [51.1657, 10.4515];
  const [position, setPosition] = useState<[number, number]>(defaultPosition);
  const [zipCode, setZipCode] = useState<string | null>(null);

  const [postcodeCoords, setPostcodeCoords] = useState<PostcodeCoords[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const circlesData = useMemo(() => {
    if (!selectedPostcode || !Array.isArray(selectedPostcode)) return [];

    return selectedPostcode
      .map((p) => {
        const coords = postcodeCoords.find((c) => c.code === p.code);
        if (coords) {
          return {
            code: p.code,
            label: coords.label,
            lat: coords.lat,
            lng: coords.lng,
            radius: p.radius * 1000,
          };
        }
        return null;
      })
      .filter(Boolean) as {
      code: string;
      label: string;
      lat: number;
      lng: number;
      radius: number;
    }[];
  }, [selectedPostcode, postcodeCoords]);

  const addCoordinates = (
    code: string,
    label: string,
    lat: number,
    lng: number
  ) => {
    setPostcodeCoords((prev) => {
      const existing = prev.find((p) => p.code === code);
      if (existing) return prev;
      return [...prev, { code, label, lat, lng }];
    });
  };

  const postcodes = useMemo(() => {
    const seen = new Set<string>();

    return postcodeList
      .filter((pc) => {
        if (seen.has(pc.code)) return false;
        seen.add(pc.code);
        return true;
      })
      .map((pc) => ({
        label: pc.label,
        value: pc.code,
      }));
  }, []);

  useEffect(() => {
    if (!selectedPostcode || !Array.isArray(selectedPostcode)) return;

    const missingCoords = selectedPostcode.filter(
      (p) => !postcodeCoords.some((c) => c.code === p.code)
    );

    missingCoords.forEach(async (p) => {
      const match = postcodes.find((pc) => pc.value === p.code);
      if (!match) return;

      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY;
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${p.code}&type=postcode&filter=countrycode:de&apiKey=${apiKey}`
        );
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          const lat = data.features[0].properties.lat;
          const lng = data.features[0].properties.lon;
          addCoordinates(p.code, match.label, lat, lng);
        }
      } catch (error) {
        Helpers.notification.error(
          "Error fetching coordinates for postcode " + p.code
        );
      }
    });
  }, [selectedPostcode, postcodeCoords]);

  const LocationMarker = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        try {
          const response = await fetch(
            `https://alpha.be.atlas.galvanek-bau.de/gesys/zipcode/closest?latitude=${lat}&longitude=${lng}`
          );
          const data = await response.json();
          if (data.status === "success" && data.data) {
            const fetchedZip = data.data.zipcode;
            setZipCode(fetchedZip);

            const match = postcodes.find((p) => p.value === fetchedZip);
            if (match) {
              // Check if already exists in parent
              const alreadySelected = selectedPostcode?.some(
                (p) => p.code === fetchedZip
              );

              if (!alreadySelected) {
                // Add coordinates locally
                addCoordinates(match.value, match.label, lat, lng);

                // Add to parent state (only code and radius in km)
                setSelectedPostcode((prev: any) => [
                  ...prev,
                  { code: match.value, radius: 100 },
                ]);
                setIsEditing && setIsEditing(true);
              }
            }
          } else {
            setZipCode(null);
          }
        } catch (error) {
          console.error("Error fetching zipcode:", error);
          setZipCode(null);
        }
      },
    });
    return null;
  };

  const filteredPostcodes = useMemo(() => {
    if (!searchQuery) return postcodes.slice(0, 20);
    const lower = searchQuery.toLowerCase();
    return postcodes
      .filter(
        (p) =>
          p.value.startsWith(searchQuery) ||
          p.label.toLowerCase().includes(lower)
      )
      .slice(0, 50);
  }, [searchQuery]);

  const addPostcodeFromSearch = async (item: {
    code: string;
    label: string;
  }) => {
    const alreadySelected = selectedPostcode?.some((p) => p.code === item.code);
    if (alreadySelected) {
      setIsModalOpen(false);
      setSearchQuery("");
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY;
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${item.code}&type=postcode&filter=countrycode:de&apiKey=${apiKey}`
      );
      const data = await res.json();

      let lat = defaultPosition[0];
      let lng = defaultPosition[1];

      if (data.features && data.features.length > 0) {
        lat = data.features[0].properties.lat;
        lng = data.features[0].properties.lon;
      } else {
        alert("Could not find coordinates for this postcode");
        return;
      }

      // Add coordinates locally
      addCoordinates(item.code, item.label, lat, lng);

      // Add to parent state
      setSelectedPostcode((prev: any) => [
        ...prev,
        { code: item.code, radius: 100 },
      ]);
      setIsEditing && setIsEditing(true);

      setIsModalOpen(false);
      setSearchQuery("");
      setPosition([lat, lng]);
    } catch (e) {
      console.error("Failed to fetch coordinates", e);
      alert("Error adding postcode");
    }
  };

  return (
    <div className="PostcodeMap app-container">
      <MapContainer center={defaultPosition} zoom={6} className="custom-map">
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${
            import.meta.env.VITE_GEOAPIFY
          }`}
        />
        <LocationMarker />

        {circlesData.length === 0 && (
          <Marker key="main-marker" position={position} icon={customIcon}>
            {zipCode && <Popup>{zipCode}</Popup>}
          </Marker>
        )}

        {circlesData.map((postcode) => (
          <div key={postcode.code}>
            <Circle
              center={[postcode.lat, postcode.lng] as [number, number]}
              radius={postcode.radius}
              pathOptions={{
                color: "orange",
                fillColor: "orange",
                fillOpacity: 0.2,
              }}
            />
            <Marker
              position={[postcode.lat, postcode.lng] as [number, number]}
              icon={customIcon}
            >
              <Popup>{postcode.label}</Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Postcode</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-close"
              >
                x
              </button>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            <div className="search-results">
              {filteredPostcodes.map((item, idx) => (
                <div
                  key={item.value + idx}
                  onClick={() =>
                    addPostcodeFromSearch({
                      code: item.value,
                      label: item.label,
                    })
                  }
                  className="result-item"
                >
                  <span className="result-code">{item.value}</span> -{" "}
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostcodeMap;
