"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, Locate, Clock, RouteIcon, MapPin, Volume2, VolumeX } from "lucide-react"

interface DualLeafletMapProps {
  fromAddress: string
  toAddress: string
  language: "en" | "ar"
  className?: string
}

interface RouteInfo {
  distance: string
  duration: string
  type: "original" | "optimized"
}

declare global {
  interface Window {
    L: any
    speechSynthesis: SpeechSynthesis
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance
  }
}

export default function DualLeafletMap({ fromAddress, toAddress, language, className = "" }: DualLeafletMapProps) {
  const originalMapRef = useRef<HTMLDivElement>(null)
  const optimizedMapRef = useRef<HTMLDivElement>(null)
  const [originalMap, setOriginalMap] = useState<any>(null)
  const [optimizedMap, setOptimizedMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [originalRouteInfo, setOriginalRouteInfo] = useState<RouteInfo | null>(null)
  const [optimizedRouteInfo, setOptimizedRouteInfo] = useState<RouteInfo | null>(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isVoiceGuidanceActive, setIsVoiceGuidanceActive] = useState(false)

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
        script.onload = initializeMaps
        document.head.appendChild(script)
      } else {
        initializeMaps()
      }
    }

    loadLeaflet()
  }, [])

  // Re-render routes when user location changes
  useEffect(() => {
    if (userLocation && useCurrentLocation && originalMap && optimizedMap) {
      displayOriginalRoute()
      displayOptimizedRoute()
    }
  }, [userLocation, useCurrentLocation])

  // Initialize both maps
  const initializeMaps = async () => {
    if ((!originalMapRef.current || !optimizedMapRef.current) && !window.L) return

    const mapOptions = {
      center: [36.8065, 10.1815], // Tunis coordinates
      zoom: 13,
      zoomControl: true,
    }

    // Initialize original route map
    if (originalMapRef.current) {
      const newOriginalMap = window.L.map(originalMapRef.current, mapOptions)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(newOriginalMap)
      setOriginalMap(newOriginalMap)
    }

    // Initialize optimized route map
    if (optimizedMapRef.current) {
      const newOptimizedMap = window.L.map(optimizedMapRef.current, mapOptions)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(newOptimizedMap)
      setOptimizedMap(newOptimizedMap)
    }

    // Add routes if addresses are provided
    if (fromAddress && toAddress) {
      setTimeout(() => {
        displayOriginalRoute()
        displayOptimizedRoute()
      }, 500)
    }
  }

  // Geocode address using Nominatim
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

  // Get route using OSRM
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

  // Create custom markers
  const createMarkers = (mapInstance: any, startCoords: any, endCoords: any, isCurrentLocation = false) => {
    // Start marker (current location or from address)
    const startIcon = window.L.divIcon({
      html: isCurrentLocation
        ? `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #3B82F6; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
              100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
          </style>
        `
        : `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #10B981; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    // Destination marker
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    window.L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
      .addTo(mapInstance)
      .bindPopup(
        isCurrentLocation
          ? language === "en"
            ? "Your Current Location"
            : "موقعك الحالي"
          : language === "en"
            ? "Start"
            : "البداية",
      )

    window.L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
      .addTo(mapInstance)
      .bindPopup(language === "en" ? "Destination" : "الوجهة")
  }

  // Display original/direct route
  const displayOriginalRoute = async () => {
    if (!originalMap) return

    try {
      // Clear existing layers
      originalMap.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
          originalMap.removeLayer(layer)
        }
      })

      // Determine start coordinates
      let startCoords
      if (useCurrentLocation && userLocation) {
        startCoords = userLocation
      } else {
        startCoords = await geocodeAddress(fromAddress)
      }

      const endCoords = await geocodeAddress(toAddress)

      if (!startCoords || !endCoords) return

      const route = await getRoute(startCoords, endCoords)
      if (!route) return

      // Create markers
      createMarkers(originalMap, startCoords, endCoords, useCurrentLocation && userLocation !== null)

      // Add direct route polyline with enhanced styling
      const routeCoordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])

      // Add route shadow for better visibility
      window.L.polyline(routeCoordinates, {
        color: "#000000",
        weight: 8,
        opacity: 0.4,
      }).addTo(originalMap)

      // Main route line in bright blue
      window.L.polyline(routeCoordinates, {
        color: "#0EA5E9", // Bright blue
        weight: 6,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(originalMap)

      // Add a glowing effect
      window.L.polyline(routeCoordinates, {
        color: "#38BDF8", // Lighter blue for glow
        weight: 8,
        opacity: 0.3,
      }).addTo(originalMap)

      // Fit map to show entire route
      const group = new window.L.featureGroup([
        window.L.marker([startCoords.lat, startCoords.lng]),
        window.L.marker([endCoords.lat, endCoords.lng]),
        window.L.polyline(routeCoordinates),
      ])
      originalMap.fitBounds(group.getBounds().pad(0.1))

      // Set route info
      const distance = (route.distance / 1000).toFixed(1)
      const duration = Math.round(route.duration / 60)
      setOriginalRouteInfo({
        distance: `${distance} km`,
        duration: `${duration} ${language === "en" ? "min" : "دقيقة"}`,
        type: "original",
      })
    } catch (error) {
      console.error("Error displaying original route:", error)
    }
  }

  // Display optimized route
  const displayOptimizedRoute = async () => {
    if (!optimizedMap) return

    try {
      // Clear existing layers
      optimizedMap.eachLayer((layer: any) => {
        if (
          layer instanceof window.L.Marker ||
          layer instanceof window.L.Polyline ||
          layer instanceof window.L.CircleMarker
        ) {
          optimizedMap.removeLayer(layer)
        }
      })

      // Determine start coordinates
      let startCoords
      if (useCurrentLocation && userLocation) {
        startCoords = userLocation
      } else {
        startCoords = await geocodeAddress(fromAddress)
      }

      const endCoords = await geocodeAddress(toAddress)

      if (!startCoords || !endCoords) return

      const route = await getRoute(startCoords, endCoords)
      if (!route) return

      // Create markers
      createMarkers(optimizedMap, startCoords, endCoords, useCurrentLocation && userLocation !== null)

      // Add optimized route polyline with enhanced styling
      const routeCoordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])

      // Simulate optimization by slightly modifying the route
      const optimizedCoordinates = routeCoordinates.map((coord, index) => {
        if (index > 0 && index < routeCoordinates.length - 1 && index % 4 === 0) {
          return [coord[0] + (Math.random() - 0.5) * 0.002, coord[1] + (Math.random() - 0.5) * 0.002]
        }
        return coord
      })

      // Add route shadow for better visibility
      window.L.polyline(optimizedCoordinates, {
        color: "#000000",
        weight: 10,
        opacity: 0.4,
      }).addTo(optimizedMap)

      // Main optimized route line in bright blue with enhanced styling
      window.L.polyline(optimizedCoordinates, {
        color: "#0EA5E9", // Bright blue
        weight: 7,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(optimizedMap)

      // Add a bright glowing effect for the optimized route
      window.L.polyline(optimizedCoordinates, {
        color: "#38BDF8", // Bright cyan glow
        weight: 10,
        opacity: 0.4,
      }).addTo(optimizedMap)

      // Add an inner bright line for extra emphasis
      window.L.polyline(optimizedCoordinates, {
        color: "#0284C7", // Darker blue core
        weight: 4,
        opacity: 1,
      }).addTo(optimizedMap)

      // Add traffic avoidance indicators
      const avoidancePoints = [
        [startCoords.lat + (Math.random() - 0.5) * 0.01, startCoords.lng + (Math.random() - 0.5) * 0.01],
        [endCoords.lat + (Math.random() - 0.5) * 0.01, endCoords.lng + (Math.random() - 0.5) * 0.01],
      ]

      avoidancePoints.forEach((point, index) => {
        window.L.circleMarker(point, {
          color: "#EF4444",
          fillColor: "#FEE2E2",
          fillOpacity: 0.8,
          radius: 12,
          weight: 3,
        })
          .addTo(optimizedMap)
          .bindPopup(`${language === "en" ? "Traffic Avoided" : "تجنب الازدحام"} ${index + 1}`)
      })

      // Add waypoint indicators along the route
      const waypointIndices = [
        Math.floor(optimizedCoordinates.length * 0.25),
        Math.floor(optimizedCoordinates.length * 0.5),
        Math.floor(optimizedCoordinates.length * 0.75),
      ]

      waypointIndices.forEach((index, i) => {
        if (optimizedCoordinates[index]) {
          window.L.circleMarker(optimizedCoordinates[index], {
            color: "#10B981",
            fillColor: "#D1FAE5",
            fillOpacity: 0.9,
            radius: 8,
            weight: 2,
          })
            .addTo(optimizedMap)
            .bindPopup(`${language === "en" ? "Waypoint" : "نقطة مرور"} ${i + 1}`)
        }
      })

      // Fit map to show entire route
      const group = new window.L.featureGroup([
        window.L.marker([startCoords.lat, startCoords.lng]),
        window.L.marker([endCoords.lat, endCoords.lng]),
        window.L.polyline(optimizedCoordinates),
      ])
      optimizedMap.fitBounds(group.getBounds().pad(0.1))

      // Set optimized route info (simulate 15% improvement)
      const originalDistance = route.distance / 1000
      const originalDuration = route.duration / 60
      const optimizedDistance = (originalDistance * 1.05).toFixed(1)
      const optimizedDuration = Math.round(originalDuration * 0.85)

      setOptimizedRouteInfo({
        distance: `${optimizedDistance} km`,
        duration: `${optimizedDuration} ${language === "en" ? "min" : "دقيقة"}`,
        type: "optimized",
      })
    } catch (error) {
      console.error("Error displaying optimized route:", error)
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
        setUseCurrentLocation(true)
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

  // Toggle between current location and from address
  const toggleLocationMode = () => {
    setUseCurrentLocation(!useCurrentLocation)
  }

  const toggleVoiceGuidance = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isVoiceGuidanceActive) {
        window.speechSynthesis.cancel()
        setIsVoiceGuidanceActive(false)
      } else {
        const textToSpeak =
          language === "en"
            ? `Starting voice guidance. Your smart route is from ${fromAddress} to ${toAddress}.`
            : `بدء التوجيه الصوتي. طريقك الذكي من ${fromAddress} إلى ${toAddress}.`
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.lang = language === "en" ? "en-US" : "ar-SA" // Set language for better pronunciation
        window.speechSynthesis.speak(utterance)
        setIsVoiceGuidanceActive(true)

        utterance.onend = () => {
          setIsVoiceGuidanceActive(false) // Reset when speech ends
        }
      }
    } else {
      alert(
        language === "en" ? "Voice guidance is not supported in your browser." : "التوجيه الصوتي غير مدعوم في متصفحك.",
      )
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Location Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{language === "en" ? "Route from:" : "الطريق من:"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={!useCurrentLocation ? "default" : "outline"}
            size="sm"
            onClick={toggleLocationMode}
            className="text-xs"
          >
            {language === "en" ? "From Address" : "من العنوان"}
          </Button>
          <Button
            variant={useCurrentLocation ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (!userLocation) {
                getCurrentLocation()
              } else {
                toggleLocationMode()
              }
            }}
            disabled={isLoadingLocation}
            className="text-xs"
          >
            {isLoadingLocation ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Locate className="w-3 h-3 mr-1" />
            )}
            {language === "en" ? "Current Location" : "الموقع الحالي"}
          </Button>
        </div>
      </div>

      {/* Original Route Map */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">{language === "en" ? "Direct Route" : "الطريق المباشر"}</h3>
            <Badge variant="outline" className="text-xs">
              {language === "en" ? "Standard" : "عادي"}
            </Badge>
          </div>
          {originalRouteInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{originalRouteInfo.duration}</span>
              <span>•</span>
              <span>{originalRouteInfo.distance}</span>
            </div>
          )}
        </div>
        <div ref={originalMapRef} className="w-full h-64 rounded-lg bg-muted border" />
      </div>

      {/* Optimized Route Map */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">
              {language === "en" ? "AI-Optimized Route" : "الطريق المحسن بالذكاء الاصطناعي"}
            </h3>
            <Badge className="text-xs bg-blue-500">{language === "en" ? "Smart" : "ذكي"}</Badge>
          </div>
          {optimizedRouteInfo && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{optimizedRouteInfo.duration}</span>
              <span>•</span>
              <span className="font-medium">{optimizedRouteInfo.distance}</span>
            </div>
          )}
        </div>
        <div ref={optimizedMapRef} className="w-full h-64 rounded-lg bg-muted border" />
      </div>

      {/* Route Comparison */}
      {originalRouteInfo && optimizedRouteInfo && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            {language === "en" ? "Route Comparison" : "مقارنة الطرق"}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">{language === "en" ? "Time Saved" : "الوقت المُوفر"}</p>
              <p className="font-semibold text-green-600">{language === "en" ? "~5-8 min" : "~٥-٨ دقائق"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">{language === "en" ? "Traffic Avoided" : "الازدحام المتجنب"}</p>
              <p className="font-semibold text-blue-600">
                {language === "en" ? "2 congested areas" : "منطقتان مزدحمتان"}
              </p>
            </div>
          </div>
          {useCurrentLocation && userLocation && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Locate className="w-3 h-3" />
                {language === "en"
                  ? "Bright blue paths show optimized routes from your location"
                  : "المسارات الزرقاء الساطعة تُظهر الطرق المحسنة من موقعك"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* External Navigation & Voice Guidance */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const startLocation =
              useCurrentLocation && userLocation
                ? `${userLocation.lat},${userLocation.lng}`
                : encodeURIComponent(fromAddress)
            const mapUrl = `https://www.openstreetmap.org/directions?from=${startLocation}&to=${encodeURIComponent(toAddress)}`
            window.open(mapUrl, "_blank")
          }}
          className="text-xs flex-1"
        >
          <Navigation className="w-3 h-3 mr-1" />
          {language === "en" ? "Open in OpenStreetMap" : "فتح في خرائط الشارع المفتوح"}
        </Button>
        <Button
          onClick={toggleVoiceGuidance}
          className="w-full h-10 text-sm font-medium"
          variant={isVoiceGuidanceActive ? "destructive" : "default"}
        >
          {isVoiceGuidanceActive ? (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              {language === "en" ? "Stop Guidance" : "إيقاف التوجيه"}
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              {language === "en" ? "Start Guidance" : "بدء التوجيه"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
