"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Locate } from "lucide-react"

interface GoogleMapProps {
  fromAddress: string
  toAddress: string
  language: "en" | "ar"
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMap({ fromAddress, toAddress, language, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = initializeMap

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current || !window.google) return

    const mapOptions = {
      zoom: 13,
      center: { lat: 36.8065, lng: 10.1815 }, // Default to Tunis
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // Add route if addresses are provided
    if (fromAddress && toAddress) {
      displayRoute(newMap)
    }
  }

  // Display route between addresses
  const displayRoute = (mapInstance: any) => {
    const directionsService = new window.google.maps.DirectionsService()
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#3B82F6",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    })

    directionsRenderer.setMap(mapInstance)

    const request = {
      origin: fromAddress,
      destination: toAddress,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      region: "TN", // Tunisia
    }

    directionsService.route(request, (result: any, status: any) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result)

        // Add custom markers
        const route = result.routes[0]
        const leg = route.legs[0]

        // Start marker
        new window.google.maps.Marker({
          position: leg.start_location,
          map: mapInstance,
          title: language === "en" ? "Start" : "البداية",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" strokeWidth="3"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })

        // End marker
        new window.google.maps.Marker({
          position: leg.end_location,
          map: mapInstance,
          title: language === "en" ? "Destination" : "الوجهة",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="white" strokeWidth="3"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })
      } else {
        console.error("Directions request failed due to " + status)
      }
    })
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
          // Add user location marker
          new window.google.maps.Marker({
            position: location,
            map: map,
            title: language === "en" ? "Your Location" : "موقعك",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            },
          })

          // Center map on user location
          map.setCenter(location)
          map.setZoom(15)
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
      <div ref={mapRef} className="w-full h-80 rounded-lg bg-muted" />

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

      {/* Map Info */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const mapUrl = `https://www.google.com/maps/dir/${encodeURIComponent(fromAddress)}/${encodeURIComponent(toAddress)}`
              window.open(mapUrl, "_blank")
            }}
            className="text-xs"
          >
            <Navigation className="w-3 h-3 mr-1" />
            {language === "en" ? "Open in Google Maps" : "فتح في خرائط جوجل"}
          </Button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {language === "en" ? "Live traffic data" : "بيانات المرور المباشرة"}
        </div>
      </div>
    </div>
  )
}
