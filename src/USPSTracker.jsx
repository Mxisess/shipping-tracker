import { useEffect, useState } from "react";
import { MapPin, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const LOCATIONS = [
  "Brooklyn, NY",
  "Jamaica, NY (USPS International Facility)",
  "Miami, FL (USPS International Distribution Center)",
  "Panama City, Panama",
  "Lima, Peru",
  "Santa Cruz de la Sierra, Bolivia",
  "Cochabamba, Bolivia",
  "La Paz, Bolivia",
];

const COORDINATES = {
  "Brooklyn, NY": [-73.9442, 40.6782],
  "Jamaica, NY (USPS International Facility)": [-73.7993, 40.6912],
  "Miami, FL (USPS International Distribution Center)": [-80.1918, 25.7617],
  "Panama City, Panama": [-79.5199, 8.9824],
  "Lima, Peru": [-77.0428, -12.0464],
  "Santa Cruz de la Sierra, Bolivia": [-63.1806, -17.7833],
  "Cochabamba, Bolivia": [-66.157, -17.3895],
  "La Paz, Bolivia": [-68.1193, -16.5],
};

const getTrackingProgress = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);

  const delays = {
    3: 15,
    4: 30,
    7: 10,
  };

  let progress = 0;
  let remainingDays = dayOfYear;

  for (let i = 0; i < LOCATIONS.length; i++) {
    if (remainingDays <= 0) break;
    progress++;
    if (delays[i]) {
      if (remainingDays <= delays[i]) break;
      remainingDays -= delays[i];
    }
    remainingDays--;
  }

  return LOCATIONS.slice(0, progress);
};

const getStatusIcon = (index, isLast) => {
  if (index === 3 || index === 4 || index === 7) return <AlertTriangle className="text-yellow-500" />;
  return isLast ? <CheckCircle className="text-green-500" /> : <Truck className="text-blue-500" />;
};

const getStatusNote = (index) => {
  if (index === 3) return "Retraso en aduana - Panamá (15 días)";
  if (index === 4) return "Retraso por inspección - Perú (30 días)";
  if (index === 7) return "En aduanas - La Paz, Bolivia (10 días)";
  return null;
};

const getProgressPercentage = (current, total) => {
  return Math.min(100, Math.round((current / total) * 100));
};

const isValidTrackingNumber = (trackingNumber) => {
  return /^[A-Z]{2}[0-9]{9}US$/.test(trackingNumber);
};

export default function USPSTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [locations, setLocations] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!isValidTrackingNumber(trackingNumber)) return;
    const progress = getTrackingProgress();
    setLocations(progress);
    setSubmitted(true);
  };

  const progressPercent = getProgressPercentage(locations.length, LOCATIONS.length);

  return (
    <div className="max-w-xl mx-auto p-6 font-sans bg-gradient-to-r from-gray-50 to-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <img
          src="https://1000logos.net/wp-content/uploads/2017/06/UPS-Logo-1993.png"
          alt="UPS Logo"
          className="h-12"
        />
        <h1 className="text-3xl font-bold text-yellow-800">UPS Package Tracking</h1>
      </div>

      <div className="mb-6 p-6 bg-white border rounded-xl shadow-xl">
        <input
          className="w-full p-4 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Tracking Number (e.g. LN123456789US)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
        />
        <button
          className="mt-4 w-full bg-yellow-700 text-white py-3 px-6 rounded-lg disabled:opacity-50 hover:bg-yellow-800 transition"
          onClick={handleSubmit}
          disabled={!isValidTrackingNumber(trackingNumber)}
        >
          Track Package
        </button>
      </div>

      {submitted && (
        <>
          <div className="mb-6">
            <div className="text-sm mb-2 font-medium">Shipment Progress:</div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-yellow-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2">{progressPercent}% completed</div>
          </div>

          <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            <ComposableMap projection="geoEqualEarth" width={800} height={300}>
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#F0F0F0"
                      stroke="#D6D6DA"
                    />
                  ))
                }
              </Geographies>
              {locations.map((location, index) => {
                const [x, y] = COORDINATES[location];
                return (
                  <Marker key={index} coordinates={[x, y]}>
                    <circle r={6} fill="#FF5733" />
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-100 p-4 rounded-md shadow-md">
                {getStatusIcon(index, index === locations.length - 1)}
                <div>
                  <div className="font-semibold text-yellow-800 text-xl">{location}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(Date.now() - (locations.length - index - 1) * 86400000), "PPPpp")}
                  </div>
                  {getStatusNote(index) && (
                    <div className="text-sm text-yellow-600 italic">{getStatusNote(index)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className="mt-10 text-xs text-gray-500 text-center border-t pt-4">
        © {new Date().getFullYear()} United Parcel Service. All rights reserved.
      </footer>
    </div>
  );
}
