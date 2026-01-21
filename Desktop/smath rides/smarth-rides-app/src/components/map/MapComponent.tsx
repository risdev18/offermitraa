"use client"

import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

/**
 * FIXED LEAFLET ICON LOGIC
 * Leaflet markers often break in Next.js because they try to load icons from relative paths.
 */
const getIcon = () => {
    if (typeof window === 'undefined') return null;
    return L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
}

// Component to recenter map with safety checks
function Recenter({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap()
    useEffect(() => {
        if (map && lat && lng) {
            map.flyTo([lat, lng], map.getZoom(), {
                animate: true,
                duration: 1.5
            })
        }
    }, [lat, lng, map])
    return null
}

interface MapProps {
    center?: { lat: number, lng: number }
    zoom?: number
    showUserLocation?: boolean
}

export default function MapComponent({
    center = { lat: 18.5204, lng: 73.8567 }, // Pune default
    zoom = 15,
    showUserLocation = true
}: MapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const icon = useMemo(() => getIcon(), [])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return <div className="h-full w-full bg-slate-900 animate-pulse" />

    return (
        <div className="h-full w-full relative z-0 overflow-hidden">
            <MapContainer
                key={`${center.lat}-${center.lng}`} // Key helps Leaflet re-initialize properly on coordinate shifts if needed
                center={[center.lat, center.lng]}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false} // Cleaner for professional dark UI
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Professional Dark Theme
                />

                {showUserLocation && icon && (
                    <>
                        <Marker position={[center.lat, center.lng]} icon={icon}>
                            <Popup>Current Position</Popup>
                        </Marker>
                        <Recenter lat={center.lat} lng={center.lng} />
                    </>
                )}
            </MapContainer>
        </div>
    )
}
