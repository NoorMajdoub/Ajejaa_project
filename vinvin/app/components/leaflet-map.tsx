"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Locate } from "lucide-react"

interface LeafletMapProps {
  fromAddress: string
  toAddress: string
  language: "en" | "ar"
  className?: string
}

declare global {
  interface Window {
    L: any
  }
}

export default function LeafletMap({ fromAddress, toAddress, language, className = "" }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const cssLink = document.createElement("link")
        cssLink.rel = "stylesheet"
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(cssLink)
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current || !window.L) return

    // Create map centered on Tunisia
    const newMap = window.L.map(mapRef.current, {
      center: [36.8065, 10.1815], // Tunis coordinates
      zoom: 13,
      zoomControl: true,
    })

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(newMap)

    setMap(newMap)

    // Add route if addresses are provided
    if (fromAddress && toAddress) {
      displayRoute(newMap)
    }
  }

  // Geocode address using Nominatim (OpenStreetMap's geocoding service)
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=tn&limit=1`,
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
          display_name: data[0].display_name,
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  // Get route using OSRM (Open Source Routing Machine)
  const getRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
      )
      const data = await response.json()
      if (data.routes && data.routes.length > 0) {
        return data.routes[0]
      }
      return null
    } catch (error) {
      console.error("Routing error:", error)
      return null
    }
  }

  // Display route on map
  const displayRoute = async (mapInstance: any) => {
    try {
      // Geocode both addresses
      const startCoords = await geocodeAddress(fromAddress)
      const endCoords = await geocodeAddress(toAddress)

      if (!startCoords || !endCoords) {
        console.error("Could not geocode addresses")
        return
      }

      // Get route
      const route = await getRoute(startCoords, endCoords)
      if (!route) {
        console.error("Could not get route")
        return
      }

      // Create custom icons
      const startIcon = window.L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #10B981; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const endIcon = window.L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #EF4444; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      // Add markers
      window.L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
        .addTo(mapInstance)
        .bindPopup(language === "en" ? "Start" : "البداية")

      window.L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
        .addTo(mapInstance)
        .bindPopup(language === "en" ? "Destination" : "الوجهة")

      // Add route polyline
      const routeCoordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])
      window.L.polyline(routeCoordinates, {
        color: "#3B82F6",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapInstance)

      // Fit map to show entire route
      const group = new window.L.featureGroup([
        window.L.marker([startCoords.lat, startCoords.lng]),
        window.L.marker([endCoords.lat, endCoords.lng]),
        window.L.polyline(routeCoordinates),
      ])
      mapInstance.fitBounds(group.getBounds().pad(0.1))

      // Set route info
      const distance = (route.distance / 1000).toFixed(1) // Convert to km
      const duration = Math.round(route.duration / 60) // Convert to minutes
      setRouteInfo({
        distance: `${distance} km`,
        duration: `${duration} ${language === "en" ? "min" : "دقيقة"}`,
      })
    } catch (error) {
      console.error("Error displaying route:", error)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        language === "en"
          ? "Geolocation is not supported by this browser."
          : "الموقع الجغرافي غير مدعوم في هذا المتصفح.",
      )
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)

        if (map) {
          // Create user location icon
          const userIcon = window.L.divIcon({
            html: `
              <div style="
                width: 24px; 
                height: 24px; 
                background: #3B82F6; 
                border: 2px solid white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                animation: pulse 2s infinite;
              ">
                <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
              </style>
            `,
            className: "user-location-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          // Add user location marker
          window.L.marker([location.lat, location.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(language === "en" ? "Your Location" : "موقعك")

          // Center map on user location
          map.setView([location.lat, location.lng], 15)
        }

        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsLoadingLocation(false)
        alert(language === "en" ? "Unable to get your location." : "غير قادر على الحصول على موقعك.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-80 rounded-lg bg-muted border" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          {isLoadingLocation ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Locate className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Route Info */}
      {routeInfo && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{routeInfo.distance}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">{routeInfo.duration}</span>
          </div>
        </div>
      )}

      {/* Map Info */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const mapUrl = `https://www.openstreetmap.org/directions?from=${encodeURIComponent(fromAddress)}&to=${encodeURIComponent(toAddress)}`
              window.open(mapUrl, "_blank")
            }}
            className="text-xs"
          >
            <Navigation className="w-3 h-3 mr-1" />
            {language === "en" ? "Open in OpenStreetMap" : "فتح في خرائط الشارع المفتوح"}
          </Button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {language === "en" ? "OpenStreetMap data" : "بيانات خرائط الشارع المفتوح"}
        </div>
      </div>
    </div>
  )
}
