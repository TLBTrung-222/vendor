import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./StateMap.scss";
import { useState } from "react";
import stateData from "../../utils/stateDE.json";
import { Layer } from "leaflet";

const geoJsonData = stateData as any;

function StateMap() {
  const defaultPosition: [number, number] = [51.1657, 10.4515];
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const toggleStateSelection = (stateId: string) => {
    setSelectedStates((prev) => {
      if (prev.includes(stateId)) {
        return prev.filter((id) => id !== stateId);
      } else {
        return [...prev, stateId];
      }
    });
  };

  const getColor = (id: string) => {
    const colors = [
      "#fa7784ff",
      "#fcb461ff",
      "#f9f964ff",
      "#69f888ff",
      "#63b8faff",
      "#c3f96dff",
      "#73f9c8ff",
      "#6e8bfcff",
      "#fb90f0ff",
      "#feb17dff",
      "#79aaf9ff",
      "#74effaff",
      "#8cfc76ff",
      "#f6fa7dff",
      "#fb8686ff",
      "#c29797ff",
    ];

    let hash = 0;
    if (!id) return "#3388ff";
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const style = (feature: any) => {
    const isSelected = selectedStates.includes(feature.properties.id);
    const stateColor = getColor(feature.properties.id);

    return {
      fillColor: stateColor,
      weight: isSelected ? 3 : 1,
      opacity: 0.7,
      color: "white",
      dashArray: isSelected ? "" : "3",
      fillOpacity: isSelected ? 2 : 0.6,
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    layer.on({
      click: () => {
        const id = feature.properties.id;
        if (id) {
          toggleStateSelection(id);
        }
      },
    });

    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  return (
    <div className="StateMap app-container">
      <MapContainer center={defaultPosition} zoom={6} className="custom-map">
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${
            import.meta.env.VITE_GEOAPIFY
          }`}
        />
        <GeoJSON
          key={JSON.stringify(selectedStates)}
          data={geoJsonData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <div className="controls-section state-controls">
        <h3>Selected States</h3>

        {selectedStates.length === 0 ? (
          <p className="state-controls-empty">
            Click on the map to select states
          </p>
        ) : (
          <div className="selected-states-list">
            {selectedStates.map((id) => {
              const feature = geoJsonData.features.find(
                (f: any) => f.properties.id === id
              );
              const name = feature?.properties?.name || id;
              const color = getColor(id);

              return (
                <div key={id} className="selected-state-item">
                  <div className="selected-state-info">
                    <span
                      className="state-color-indicator"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span>{name}</span>
                  </div>
                  <button
                    onClick={() => toggleStateSelection(id)}
                    className="remove-state-btn"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StateMap;
