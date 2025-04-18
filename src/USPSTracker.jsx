import { useState, useMemo } from "react";
import { Truck, CheckCircle, AlertTriangle } from "lucide-react";
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

const DELAYS = { 3: 15, 4: 30, 7: 10 };

const isValidTracking = (tn) => /^[A-Z]{2}[0-9]{9}US$/.test(tn);

const getTrackingProgress = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  let remaining = Math.floor((today - start) / 86400000);
  let progress = 0;

  for (let i = 0; i < LOCATIONS.length && remaining > 0; i++) {
    progress++;
    if (DELAYS[i]) {
      if (remaining <= DELAYS[i]) break;
      remaining -= DELAYS[i];
    }
    remaining--;
  }
  return LOCATIONS.slice(0, progress);
};

const StatusIcon = ({ index, isLast }) => {
  if ([3, 4, 7].includes(index)) return <AlertTriangle className="text-yellow-500" />;
  return isLast ? <CheckCircle className="text-green-600" /> : <Truck className="text-blue-500" />;
};

const StatusNote = ({ index }) => {
  const notes = {
    3: "Retraso en aduana - Panamá (15 días)",
    4: "Retraso por inspección - Perú (30 días)",
    7: "En aduanas - La Paz, Bolivia (10 días)",
  };
  return notes[index] ? (
    <div className="text-sm text-yellow-700 italic mt-1">{notes[index]}</div>
  ) : null;
};

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner">
    <div
      className="bg-yellow-500 h-5 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function USPSTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const locations = useMemo(() => {
    return submitted ? getTrackingProgress() : [];
  }, [submitted]);

  const progress = useMemo(() => {
    return Math.round((locations.length / LOCATIONS.length) * 100);
  }, [locations]);

  const handleSubmit = () => {
    if (isValidTracking(trackingNumber)) setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <img
          src="https://1000logos.net/wp-content/uploads/2017/06/UPS-Logo-1993.png"
          alt="UPS Logo"
          className="h-14"
        />
        <h1 className="text-4xl font-bold text-yellow-700">UPS Tracking</h1>
      </div>

      <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-yellow-200">
        <input
          className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Tracking Number (e.g. LN123456789US)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
        />
        <button
          className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!isValidTracking(trackingNumber)}
        >
          Track Package
        </button>
      </div>

      {submitted && (
        <>
          <div className="mb-6">
            <div className="text-sm mb-2 font-semibold text-gray-700">Progreso del Envío</div>
            <ProgressBar progress={progress} />
            <div className="text-xs text-gray-600 mt-2 text-right">{progress}% completado</div>
          </div>

          <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            <ComposableMap projection="geoEqualEarth" width={800} height={300}>
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#F9F9F9"
                      stroke="#E0E0E0"
                    />
                  ))
                }
              </Geographies>
              {locations.map((loc, i) => (
                <Marker key={i} coordinates={COORDINATES[loc]}>
                  <circle r={6} fill="#FACC15" stroke="#000" strokeWidth={1} />
                </Marker>
              ))}
            </ComposableMap>
          </div>

          <div className="space-y-4">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-md border border-yellow-100"
              >
                <div className="mt-1"> <StatusIcon index={i} isLast={i === locations.length - 1} /> </div>
                <div>
                  <div className="font-semibold text-yellow-800 text-xl">{loc}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(Date.now() - (locations.length - i - 1) * 86400000), "PPPpp")}
                  </div>
                  <StatusNote index={i} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className="mt-10 text-xs text-gray-400 text-center border-t pt-4">
        © {new Date().getFullYear()} United Parcel Service. All rights reserved.
      </footer>
    </div>
  );
}
