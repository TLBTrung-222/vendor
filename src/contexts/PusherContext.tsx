import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Pusher from "pusher-js";
import notificationBell from "../assets/mp3/notification-sound.mp3";

interface PusherContextType {
  message: any;
  setMessage: (message: any) => void;
  playNoti: () => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export const PusherProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorIdByEmail = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");

        if (!userEmail) {
          throw new Error("User email not found");
        }

        // Now, get the vendor ID using the user's email
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/gesys/vendors/contact-email?email=${encodeURIComponent(
            userEmail
          )}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
          if (result.data.vendor_id) {
            setVendorId(result.data.vendor_id);
          }
        }
      } catch (error) {
        console.error("Error fetching vendor ID:", error);
      }
    };
    if (!vendorId) {
      fetchVendorIdByEmail();
    }
  }, [vendorId]);    

  // Create a reference to the Pusher instance
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(
        import.meta.env.VITE_REACT_APP_PUSHER_KEY!,
        {
          cluster: import.meta.env.VITE_REACT_APP_PUSHER_CLUSTER!,
          // authEndpoint: process.env.REACT_APP_HAY2U_ENDPOINT + "/auth/pusher",
        }
      );
    }

    const pusher = pusherRef.current;
    const userChannel = pusher.subscribe("PRIVATE-MONTAGO");

    if (vendorId) {
      userChannel.bind(`vendor-${vendorId}`, (data: any) => {
        setMessage(data);
      });
    }

    // return () => {
    //   userChannel.unbind_all();
    //   userChannel.unsubscribe();
    // };
  }, [vendorId]);  

  const playNoti = async () => {
    try {
      const AudioContext = window.AudioContext;
      const audioContext = new AudioContext();
      const response = await fetch(notificationBell);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
      console.log("Audio playback error:", err);
    }
  };

  return (
    <PusherContext.Provider value={{ message, setMessage, playNoti }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (context === undefined) {
    throw new Error("usePusher must be used within a PusherProvider");
  }
  return context;
};
