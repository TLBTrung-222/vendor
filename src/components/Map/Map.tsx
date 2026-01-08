import React, { useEffect } from "react";
import "./Map.scss";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { LatLngExpression } from "leaflet";

interface IMap {
  position: any;
  setPosition?: (data: any) => void;
  onSelected?: (item: any) => void;
  isAdding?: boolean;
}

const defaultPosition: [number, number] = [55.0, -115.0];

const customIcon = new L.Icon({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map: React.FC<IMap> = ({
  position,
  setPosition,
  onSelected,
  isAdding,
}) => {
  const MapUpdater = () => {
    const map = useMap();

    useEffect(() => {
      if (position) {
        const currentZoom = map.getZoom() || 10;

        if (!isNaN(position[0])) {
          map.setView(position, currentZoom);
        } else {
          map.setView(position[0], currentZoom);
        }
      }
    }, [position]);

    return null;
  };

  const LocationMarker = () => {
    // useMapEvents({
    //   click: async (e) => {
    //     const { lat, lng } = e.latlng;

    //     try {
    //       const [addressResponse, zipCodeResponse] = await Promise.all([
    //         mapApi.detectAddress(lat, lng),
    //         mapApi.detectZipCode(lat, lng),
    //       ]);
    //       if (
    //         addressResponse.status === 200 &&
    //         zipCodeResponse.status === 200
    //       ) {
    //         if (!isNaN(position[0])) {
    //           setPosition([addressResponse.data.lat, addressResponse.data.lon]);
    //         } else {
    //           if (type !== "Address") return;
    //           if (isAdding) {
    //             if (position.length === userAddresses?.length! + 1) {
    //               position.shift();
    //             }
    //             const newSelectedPosition = Helpers.moveValueToFirst(position, [
    //               addressResponse.data.lat,
    //               addressResponse.data.lon,
    //             ]);
    //             setPosition(newSelectedPosition);
    //           } else {
    //             position.shift();
    //             setPosition([
    //               [addressResponse.data.lat, addressResponse.data.lon],
    //               ...position,
    //             ]);
    //           }
    //         }
    //         const newData = {
    //           ...addressResponse.data,
    //           postCode: zipCodeResponse.data.features[0].properties.postcode,
    //         };
    //         onSelected?.(newData);
    //       }
    //     } catch (error) {
    //       console.error("Error fetching address:", error);
    //       errorLog("ProfileMap.tsx - LocationMarker", error);
    //     }
    //   },
    // });
    return null;
  };

  return (
    <div className="Map">
      <MapContainer
        {...({
          center: position
            ? !isNaN(position[0])
              ? position
              : position[0]
            : defaultPosition,
          zoom: 13,
          className: "map-container",
        } as any)}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${
            import.meta.env.VITE_REACT_APP_GEOAPIFY_KEY
          }`}
        />
        <MapUpdater />
        {position !== undefined ? (
          !isNaN(position[0]) ? (
            <Marker
              key={1}
              position={position}
              {...({ icon: customIcon } as any)}
            ></Marker>
          ) : (
            position.map((item: [number, number], index: number) => {
              return (
                <Marker
                  key={index}
                  position={item}
                  {...({ icon: customIcon } as any)}
                  ref={(markerRef) => {
                    if (markerRef) {
                      markerRef.setOpacity(item === position[0] ? 1 : 0.5);
                    }
                  }}
                />
              );
            })
          )
        ) : null}
        {/* {type === "Address" && <LocationMarker />} */}
      </MapContainer>
    </div>
  );
};

export default Map;
