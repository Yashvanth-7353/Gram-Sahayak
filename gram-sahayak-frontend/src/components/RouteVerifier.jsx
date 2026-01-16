import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { Camera, MapPin, Navigation, UserCheck } from 'lucide-react';

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RouteVerifier = () => {
    // State
    const [userMode, setUserMode] = useState(1);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [routePath, setRoutePath] = useState([]); // Stores the actual curved road coordinates
    const [inspectionPoints, setInspectionPoints] = useState([]);
    const [myLocation, setMyLocation] = useState(null);
    const [cameraUnlocked, setCameraUnlocked] = useState(false);
    const [statusMsg, setStatusMsg] = useState("Select User Mode");

    // --- HELPER: Get Current Location ---
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }
        setStatusMsg("Locating...");
        navigator.geolocation.getCurrentPosition((position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setMyLocation(loc);
            setStatusMsg(`Found: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
            if (userMode === 2) checkProximity(loc);
        });
    };

    // --- USER 1: Map Click Handler ---
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (userMode !== 1) return;
                const { lat, lng } = e.latlng;

                if (!startPoint) {
                    setStartPoint({ lat, lng });
                    // Clear previous data
                    setEndPoint(null);
                    setRoutePath([]);
                    setInspectionPoints([]);
                    setStatusMsg("Start Point Set. Click End Point.");
                } else if (!endPoint) {
                    setEndPoint({ lat, lng });
                    setStatusMsg("Fetching road path from OSRM...");
                    fetchRoadAndGeneratePoints({ lat: startPoint.lat, lng: startPoint.lng }, { lat, lng });
                } else {
                    // Reset
                    setStartPoint({ lat, lng });
                    setEndPoint(null);
                    setRoutePath([]);
                    setInspectionPoints([]);
                    setStatusMsg("Start Point Reset. Click End Point.");
                }
            },
        });
        return null;
    };

    // --- NEW LOGIC: Fetch Actual Road Path from OSRM ---
    const fetchRoadAndGeneratePoints = async (start, end) => {
        try {
            // OSRM Public API (Free for non-commercial/testing)
            // Format: {longitude},{latitude};{longitude},{latitude}
            const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const routeGeometry = data.routes[0].geometry;
                
                // 1. Save the actual road path for drawing the Blue Line
                // Leaflet expects [lat, lng], but GeoJSON gives [lng, lat], so we flip them
                const leafletPath = routeGeometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRoutePath(leafletPath);

                // 2. Generate Random Points ON THIS CURVED LINE
                generatePointsOnCurve(routeGeometry);
            } else {
                setStatusMsg("Error: Could not find a road between these points.");
            }
        } catch (error) {
            console.error(error);
            setStatusMsg("API Error: Check internet connection.");
        }
    };

    // --- LOGIC: Generate 4 Points along the GeoJSON Line ---
    const generatePointsOnCurve = (geoJSONGeometry) => {
        // Turf.js loves GeoJSON, so we pass the geometry directly
        const line = turf.lineString(geoJSONGeometry.coordinates);
        const lineLength = turf.length(line, { units: 'kilometers' });
        const newPoints = [];

        for (let i = 0; i < 4; i++) {
            // Get a random distance along the actual winding road
            const randomDist = Math.random() * lineLength;
            const point = turf.along(line, randomDist, { units: 'kilometers' });
            
            newPoints.push({
                id: i + 1,
                lat: point.geometry.coordinates[1],
                lng: point.geometry.coordinates[0],
                verified: false
            });
        }
        setInspectionPoints(newPoints);
        setStatusMsg("Road Route & 4 Inspection Points Generated!");
    };

    // --- USER 2: Check Proximity (Same as before) ---
    const checkProximity = (currentLoc) => {
        if (inspectionPoints.length === 0) return;
        const userPoint = turf.point([currentLoc.lng, currentLoc.lat]);
        let matched = false;

        const updatedPoints = inspectionPoints.map(p => {
            const targetPoint = turf.point([p.lng, p.lat]);
            const distance = turf.distance(userPoint, targetPoint, { units: 'kilometers' });

            if (distance <= 0.05) { // 50 meters
                matched = true;
                return { ...p, verified: true };
            }
            return p;
        });

        if (matched) {
            setCameraUnlocked(true);
            setInspectionPoints(updatedPoints);
            setStatusMsg("✅ You are at an inspection point! Camera Unlocked.");
        } else {
            setCameraUnlocked(false);
            setStatusMsg("❌ You are not near any assigned point.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-lg mt-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-primary"/> Road-Verify System
                    </h2>
                    <p className={`text-sm font-semibold ${userMode===1 ? 'text-blue-600':'text-green-600'}`}>
                        Mode: {userMode === 1 ? "User 1: Official (Set Route)" : "User 2: Contractor (Verify)"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setUserMode(1)} className={`px-4 py-2 rounded-lg text-sm font-bold ${userMode===1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Official</button>
                    <button onClick={() => setUserMode(2)} className={`px-4 py-2 rounded-lg text-sm font-bold ${userMode===2 ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Contractor</button>
                </div>
            </div>

            {/* Status & Test Button */}
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center mb-4 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium flex items-center gap-2"><Navigation size={16}/> {statusMsg}</span>
                <button onClick={handleGetLocation} className="bg-gray-800 text-white px-3 py-1 rounded text-xs">Get My Co-ords</button>
            </div>

            {/* Map Area */}
            <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-gray-100 relative z-0">
                <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler />

                    {startPoint && <Marker position={startPoint}><Popup>Start</Popup></Marker>}
                    {endPoint && <Marker position={endPoint}><Popup>End</Popup></Marker>}

                    {/* The ACTUAL ROAD Line (Curved) */}
                    {routePath.length > 0 && (
                        <Polyline positions={routePath} color="blue" weight={5} opacity={0.6} />
                    )}

                    {/* Inspection Points on the Road */}
                    {inspectionPoints.map((p) => (
                        <React.Fragment key={p.id}>
                            <Circle 
                                center={[p.lat, p.lng]} 
                                radius={50} 
                                pathOptions={{ 
                                    color: p.verified ? 'green' : (userMode === 1 ? 'red' : 'orange'), 
                                    fillColor: p.verified ? 'green' : (userMode === 1 ? 'red' : 'orange'), 
                                    fillOpacity: 0.5 
                                }} 
                            />
                            {userMode === 2 && <Marker position={[p.lat, p.lng]} opacity={0.7}><Popup>Scan Here</Popup></Marker>}
                        </React.Fragment>
                    ))}

                    {myLocation && <Marker position={myLocation} icon={L.divIcon({ className: "bg-blue-500 w-4 h-4 rounded-full border-2 border-white" })}><Popup>You</Popup></Marker>}
                </MapContainer>
            </div>

            {/* Camera Unlock UI */}
            {userMode === 2 && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    {!cameraUnlocked ? (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <UserCheck size={48} className="text-gray-300"/>
                            <h3 className="text-lg font-bold">Location Check Required</h3>
                            <p className="text-sm">Go to an orange circle on the map.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 animate-pulse">
                            <div className="bg-green-100 p-4 rounded-full"><Camera size={48} className="text-green-600"/></div>
                            <h3 className="text-xl font-bold text-green-700">Verified!</h3>
                            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition">Upload Photo</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RouteVerifier;