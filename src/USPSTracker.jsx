import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
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
  "Cochabamba, Bolivia": [-66.1570, -17.3895],
  "La Paz, Bolivia": [-68.1193, -16.5000],
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

const getStatusIcon = (index: number, isLast: boolean) => {
  if (index === 3 || index === 4 || index === 7) return <AlertTriangle className="text-yellow-500" />;
  return isLast ? <CheckCircle className="text-green-500" /> : <Truck className="text-blue-500" />;
};

const getStatusNote = (index: number) => {
  if (index === 3) return "Retraso en aduana - Panamá (15 días)";
  if (index === 4) return "Retraso por inspección - Perú (30 días)";
  if (index === 7) return "En aduanas - La Paz, Bolivia (10 días)";
  return null;
};

const getProgressPercentage = (current: number, total: number) => {
  return Math.min(100, Math.round((current / total) * 100));
};

export default function USPSFakeTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const progress = getTrackingProgress();
    setLocations(progress);
    setSubmitted(true);
  };

  const progressPercent = getProgressPercentage(locations.length, LOCATIONS.length);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">USPS Tracking Simulator</h1>
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4">
          <Input
            placeholder="Enter Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Button onClick={handleSubmit}>Track Package</Button>
        </CardContent>
      </Card>

      {submitted && (
        <>
          <div className="mb-6">
            <div className="text-sm mb-1 font-medium">Progreso del envío:</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{progressPercent}% completado</div>
          </div>

          <div className="mb-8">
            <ComposableMap projection="geoEqualEarth" width={800} height={300}>
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#EAEAEC"
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
            </ComposableMap>
          </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="flex items-center gap-4">
                {getStatusIcon(index, index === locations.length - 1)}
                <div>
                  <div className="font-semibold">{location}</div>
                  <div className="text-sm text-gray-500">
                    {format(
                      new Date(Date.now() - (locations.length - index - 1) * 86400000),
                      "PPPpp"
                    )}
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
    </div>
  );
}
