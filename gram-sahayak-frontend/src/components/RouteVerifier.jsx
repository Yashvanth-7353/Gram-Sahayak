// src/components/RouteVerifier.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { Camera, MapPin, Navigation, UserCheck, Upload } from 'lucide-react';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RouteVerifier = ({ mode, initialStart, initialEnd, onPointsSelected, onImageUpload }) => {
    // mode: 'create' (Official) or 'verify' (Contractor)
    
    const [startPoint, setStartPoint] = useState(initialStart || null);
    const [endPoint, setEndPoint] = useState(initialEnd || null);
    const [routePath, setRoutePath] = useState([]); 
    const [inspectionPoints, setInspectionPoints] = useState([]);
    const [myLocation, setMyLocation] = useState(null);
    const [cameraUnlocked, setCameraUnlocked] = useState(false);
    const [statusMsg, setStatusMsg] = useState(mode === 'create' ? "Click map to set Start Point" : "Loading Project Route...");
    const [selectedFile, setSelectedFile] = useState(null);

    // Initial Load for Contractor: Generate Route immediately
    useEffect(() => {
        if (mode === 'verify' && initialStart && initialEnd) {
            setStartPoint(initialStart);
            setEndPoint(initialEnd);
            fetchRoadAndGeneratePoints(initialStart, initialEnd);
        }
    }, [initialStart, initialEnd, mode]);

    // --- OSRM API Call ---
    const fetchRoadAndGeneratePoints = async (start, end) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const routeGeometry = data.routes[0].geometry;
                const leafletPath = routeGeometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRoutePath(leafletPath);
                generatePointsOnCurve(routeGeometry);
            }
        } catch (error) {
            console.error("OSRM Error:", error);
        }
    };

    const generatePointsOnCurve = (geoJSONGeometry) => {
        const line = turf.lineString(geoJSONGeometry.coordinates);
        const lineLength = turf.length(line, { units: 'kilometers' });
        const newPoints = [];

        // Generate 4 random points
        for (let i = 0; i < 4; i++) {
            const randomDist = Math.random() * lineLength;
            const point = turf.along(line, randomDist, { units: 'kilometers' });
            newPoints.push({
                id: i,
                lat: point.geometry.coordinates[1],
                lng: point.geometry.coordinates[0],
                verified: false
            });
        }
        setInspectionPoints(newPoints);
    };

    // --- Official: Select Points ---
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (mode !== 'create') return;
                const { lat, lng } = e.latlng;

                if (!startPoint) {
                    setStartPoint({ lat, lng });
                    setStatusMsg("Start set. Click End Point.");
                } else if (!endPoint) {
                    setEndPoint({ lat, lng });
                    setStatusMsg("End set. Route Generated.");
                    fetchRoadAndGeneratePoints(startPoint, { lat, lng });
                    // Pass data back to Parent Form
                    onPointsSelected(startPoint, { lat, lng });
                } else {
                    // Reset
                    setStartPoint({ lat, lng });
                    setEndPoint(null);
                    setRoutePath([]);
                    setStatusMsg("Resetting... Click End Point.");
                }
            },
        });
        return null;
    };

    // --- Contractor: Verify Location (20m Radius) ---
    const handleVerifyLocation = () => {
        if (!navigator.geolocation) return;
        
        navigator.geolocation.getCurrentPosition((position) => {
            const userLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setMyLocation(userLoc);

            // Check distance to ANY inspection point
            const userPoint = turf.point([userLoc.lng, userLoc.lat]);
            let matched = false;

            const updatedPoints = inspectionPoints.map(p => {
                const targetPoint = turf.point([p.lng, p.lat]);
                const distance = turf.distance(userPoint, targetPoint, { units: 'kilometers' });

                // 0.02 km = 20 meters
                if (distance <= 0.10) { 
                    matched = true;
                    return { ...p, verified: true };
                }
                return p;
            });

            if (matched) {
                setCameraUnlocked(true);
                setInspectionPoints(updatedPoints);
                setStatusMsg("✅ Location Verified! Camera Unlocked.");
            } else {
                setCameraUnlocked(false);
                setStatusMsg("❌ Not near any inspection point (Must be within 20m).");
            }
        });
    };

    const handleUpload = () => {
        if (selectedFile) onImageUpload(selectedFile);
    };

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                <span className="font-bold text-gray-700">{statusMsg}</span>
                {mode === 'verify' && (
                    <button onClick={handleVerifyLocation} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Check My Location
                    </button>
                )}
            </div>

            <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 relative">
                <MapContainer center={initialStart || [12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler />

                    {startPoint && <Marker position={startPoint}><Popup>Start</Popup></Marker>}
                    {endPoint && <Marker position={endPoint}><Popup>End</Popup></Marker>}
                    {routePath.length > 0 && <Polyline positions={routePath} color="blue" weight={5} />}

                    {inspectionPoints.map((p) => (
                        <Circle 
                            key={p.id}
                            center={[p.lat, p.lng]} 
                            radius={20} // Visual circle matches logic
                            pathOptions={{ 
                                color: p.verified ? 'green' : 'orange', 
                                fillColor: p.verified ? 'green' : 'orange' 
                            }} 
                        />
                    ))}
                    
                    {myLocation && <Marker position={myLocation}><Popup>You</Popup></Marker>}
                </MapContainer>
            </div>

            {/* Camera / Upload Section */}
            {mode === 'verify' && cameraUnlocked && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex flex-col items-center gap-3">
                    <h3 className="text-green-800 font-bold flex items-center gap-2">
                        <Camera size={20}/> Capture Proof
                    </h3>
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" // Opens mobile camera directly
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                    <button 
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Upload size={18}/> Upload to Server
                    </button>
                </div>
            )}
        </div>
    );
};

export default RouteVerifier;