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

interface SelectedPostcode {
  id: string;
  code: string;
  label: string;
  lat: number;
  lng: number;
  radius: number;
}

interface IPostcodeMap {
  selectedPostcode: any;
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

  const [selectedPostcodes, setSelectedPostcodes] = useState<
    SelectedPostcode[]
  >([]);
  const [activePostcodeId, setActivePostcodeId] = useState<string | null>(null);

  const [tempPostcode, setTempPostcode] = useState<SelectedPostcode | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusValue, setRadiusValue] = useState(20);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePostcode = useMemo(
    () => selectedPostcodes.find((p) => p.id === activePostcodeId),
    [selectedPostcodes, activePostcodeId]
  );

  const currentDisplayPostcode = activePostcode || tempPostcode;

  useEffect(() => {
    if (currentDisplayPostcode) {
      setRadiusValue(currentDisplayPostcode.radius);
    }
  }, [currentDisplayPostcode?.id, currentDisplayPostcode?.code]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRadiusChange = (newRadius: number) => {
    setRadiusValue(newRadius);
    if (activePostcode) {
      setSelectedPostcodes((prev) =>
        prev.map((p) =>
          p.id === activePostcode.id ? { ...p, radius: newRadius } : p
        )
      );
      setIsEditing && setIsEditing(true);
    } else if (tempPostcode) {
      setTempPostcode({ ...tempPostcode, radius: newRadius });
      setSelectedPostcode((prev: any) => ({ ...prev, radius: newRadius }));
      setIsEditing && setIsEditing(true);
    }
  };

  const addPostcodeToState = (
    postcodeItem: { code: string; label: string },
    lat: number,
    lng: number
  ) => {
    const existing = selectedPostcodes.find(
      (p) => p.code === postcodeItem.code
    );
    if (existing) {
      setActivePostcodeId(existing.id);
      setTempPostcode(null);
      setSelectedPostcode((prev: any) => [...prev, existing]);
      setIsDropdownOpen(true);
      setIsEditing && setIsEditing(true);
      return;
    }

    const newPostcode: SelectedPostcode = {
      id: Date.now().toString(),
      code: postcodeItem.code,
      label: postcodeItem.label,
      lat,
      lng,
      radius: 20000,
    };

    setSelectedPostcodes((prev) => [...prev, newPostcode]);
    setActivePostcodeId(newPostcode.id);
    setSelectedPostcode((prev: any) => [...prev, newPostcode]);
    setIsEditing && setIsEditing(true);
    setTempPostcode(null);
  };

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

            const existing = selectedPostcodes.find(
              (p) => p.code === fetchedZip
            );
            if (existing) {
              setActivePostcodeId(existing.id);
              setTempPostcode(null);
              setSelectedPostcode((prev: any) => [...prev, existing]);
              setIsEditing && setIsEditing(true);
            } else {
              const match = postcodeList.find((p) => p.code === fetchedZip);
              if (match) {
                setTempPostcode({
                  id: "temp",
                  code: match.code,
                  label: match.label,
                  lat: lat,
                  lng: lng,
                  radius: 20000,
                });
                setSelectedPostcode((prev: any) => [
                  ...prev,
                  {
                    code: match.code,
                    label: match.label,
                    lat: lat,
                    lng: lng,
                    radius: 20,
                  },
                ]);
                setIsEditing && setIsEditing(true);
                setActivePostcodeId(null);
              } else {
                setTempPostcode(null);
                setActivePostcodeId(null);
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
    if (!searchQuery) return postcodeList.slice(0, 20);
    const lower = searchQuery.toLowerCase();
    return postcodeList
      .filter(
        (p) =>
          p.code.startsWith(searchQuery) ||
          p.label.toLowerCase().includes(lower)
      )
      .slice(0, 50);
  }, [searchQuery]);

  const addPostcodeFromSearch = async (item: {
    code: string;
    label: string;
  }) => {
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

      addPostcodeToState(item, lat, lng);

      setIsModalOpen(false);
      setSearchQuery("");
      setPosition([lat, lng]);
    } catch (e) {
      console.error("Failed to fetch coordinates", e);
      alert("Error adding postcode");
    }
  };

  const removePostcode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStats = selectedPostcodes.filter((p) => p.id !== id);
    setSelectedPostcodes(newStats);
    if (activePostcodeId === id) {
      if (newStats.length > 0) {
        setActivePostcodeId(newStats[0].id);
      } else {
        setActivePostcodeId(null);
      }
    }
  };

  const openAddModal = () => {
    if (zipCode) {
      setSearchQuery(zipCode);
    } else {
      setSearchQuery("");
    }
    setIsModalOpen(true);
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
        <Marker key="main-marker" position={position} icon={customIcon}>
          {zipCode && <Popup>{zipCode}</Popup>}
        </Marker>

        {selectedPostcodes.map((postcode) => (
          <div key={postcode.id}>
            <Circle
              center={[postcode.lat, postcode.lng]}
              radius={postcode.radius}
              pathOptions={{
                color: "orange",
                fillColor: "orange",
                fillOpacity: 0.2,
              }}
              eventHandlers={{
                click: () => {
                  setActivePostcodeId(postcode.id);
                  setTempPostcode(null);
                  setSelectedPostcode((prev: any) => [...prev, postcode]);
                  setZipCode(postcode.code);
                },
              }}
            />
            <Marker position={[postcode.lat, postcode.lng]} icon={customIcon}>
              <Popup>{postcode.label}</Popup>
            </Marker>
          </div>
        ))}

        {tempPostcode && (
          <Circle
            center={[tempPostcode.lat, tempPostcode.lng]}
            radius={tempPostcode.radius}
            pathOptions={{
              color: "#999",
              fillColor: "#999",
              fillOpacity: 0.2,
              dashArray: "5,5",
            }}
          />
        )}
      </MapContainer>

      {/* <div className="controls-section">
        <div className="radius-slider-container">
          <div className="radius-header">
            <label className="radius-label">Radius</label>
            <span className="radius-value">
              {(radiusValue / 1000).toFixed(1)} km
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="300000"
            step="1000"
            value={radiusValue}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="radius-input"
            disabled={!currentDisplayPostcode}
          />
        </div>

        <div className="list-action-wrapper">
          <div className="postcode-selector-container" ref={dropdownRef}>
            <div className="selector-label">Your selected Postcode</div>
            <div
              className="dropdown-header"
              onClick={() => {
                if (selectedPostcodes.length > 0)
                  setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              {currentDisplayPostcode ? (
                <>
                  <div className="header-content">
                    <span className="header-text">
                      {currentDisplayPostcode.label}
                      {tempPostcode && " (Preview)"}
                    </span>
                    <span className="header-radius">
                      Radius:{" "}
                      {(currentDisplayPostcode.radius / 1000).toFixed(0)} km
                    </span>
                  </div>
                  <div className="dropdown-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </>
              ) : (
                <span style={{ color: "#999" }}>No postcode selected</span>
              )}
            </div>

            {isDropdownOpen && selectedPostcodes.length > 0 && (
              <div className="dropdown-list">
                {selectedPostcodes.map((postcode) => (
                  <div
                    key={postcode.id}
                    className={`dropdown-item ${
                      activePostcodeId === postcode.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActivePostcodeId(postcode.id);
                      setTempPostcode(null);
                      setSelectedPostcode((prev: any) => [...prev, postcode]);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="item-text">{postcode.label}</span>
                    <div className="item-actions">
                      <span style={{ fontSize: "0.8rem", color: "#999" }}>
                        Radius: {(postcode.radius / 1000).toFixed(0)} km
                      </span>
                      <button
                        onClick={(e) => removePostcode(postcode.id, e)}
                        className="btn-remove"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={openAddModal} className="btn-add">
            + Add Postcode
          </button>
        </div>
      </div> */}

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
                  key={item.code + idx}
                  onClick={() => addPostcodeFromSearch(item)}
                  className="result-item"
                >
                  <span className="result-code">{item.code}</span> -{" "}
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
