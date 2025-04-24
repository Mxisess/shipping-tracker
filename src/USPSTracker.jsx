import { useEffect, useState } from "react";
import { MapPin, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { format, addDays } from "date-fns";
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

const DELAYS = {
  3: 15,
  4: 30,
  7: 10,
};

const START_DATE = new Date(2025, 3, 23); // 23 April 2025 (month is 0-indexed)

const getTrackingProgress = () => {
  const today = new Date();
  let elapsedDays = Math.floor((today - START_DATE) / 86400000);

  let progress = 0;
  for (let i = 0; i < LOCATIONS.length; i++) {
    if (elapsedDays <= 0) break;
    progress++;
    if (DELAYS[i]) {
      if (elapsedDays <= DELAYS[i]) break;
      elapsedDays -= DELAYS[i];
    }
    elapsedDays--;
  }

  return LOCATIONS.slice(0, progress);
};

const getStatusIcon = (index, isLast) => {
  if (DELAYS[index]) return <AlertTriangle className="text-yellow-500" />;
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

const TRACKING_CODES = [
  "1Z5F8A10123456784",
  "1Z6G9B10123456785",
  "1Z7H0C10123456786",
];

const isValidTrackingNumber = (trackingNumber) => {
  return TRACKING_CODES.includes(trackingNumber);
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
    <div className="max-w-xl mx-auto p-6 font-sans bg-yellow-50 min-h-screen">
      <div className="flex items-center gap-2 mb-4">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/UPS_Logo_Shield_2017.svg/2048px-UPS_Logo_Shield_2017.svg.png"
          alt="UPS Logo"
          className="h-10"
        />
        <h1 className="text-3xl font-bold text-yellow-800">UPS Package Tracking</h1>
      </div>

      <div className="mb-6 p-4 bg-white border rounded-xl shadow-xl">
        <input
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Tracking Number (e.g. 1Z5F8A10123456784)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <button
          className="mt-4 w-full bg-yellow-700 text-white py-2 px-4 rounded disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!isValidTrackingNumber(trackingNumber)}
        >
          Track Package
        </button>
      </div>

      {submitted && (
        <>
          {locations.length === 0 && (
            <div className="text-red-600 text-sm mt-2">
              Código de rastreo inválido o no encontrado.
            </div>
          )}

          <div className="mb-6">
            <div className="text-sm mb-1 font-medium">Shipment Progress:</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 10)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{Math.max(progressPercent, 10)}% completed</div>
          </div>

          <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 shadow">
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
                    <circle r={5} fill="#FF5533" />
                  </Marker>
                );
              })}
              {locations.length === 0 && (
                <Marker coordinates={COORDINATES["Brooklyn, NY"]}>
                  <circle r={5} fill="#FF5533" />
                </Marker>
              )}
            </ComposableMap>
          </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="flex items-center gap-4">
                {getStatusIcon(index, index === locations.length - 1)}
                <div>
                  <div className="font-semibold text-yellow-800">{location}</div>
                  <div className="text-sm text-gray-500">
                    {format(addDays(START_DATE, index), "PPPpp")}
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
