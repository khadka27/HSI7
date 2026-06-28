export interface ExifModelPreset {
  id: string;
  name: string;
  make: string;
  model: string;
  software: string;
}

export interface ExifLocationPreset {
  name: string;
  lat: number;
  lng: number;
}

export const EXIF_MODELS: ExifModelPreset[] = [
  {
    id: "iphone15pro",
    name: "Apple iPhone 15 Pro",
    make: "Apple",
    model: "iPhone 15 Pro",
    software: "iOS 17.5.1",
  },
  {
    id: "iphone14",
    name: "Apple iPhone 14",
    make: "Apple",
    model: "iPhone 14",
    software: "iOS 16.6",
  },
  {
    id: "galaxys24ultra",
    name: "Samsung Galaxy S24 Ultra",
    make: "Samsung",
    model: "SM-S928B",
    software: "Android 14 (One UI 6.1)",
  },
  {
    id: "galaxys23",
    name: "Samsung Galaxy S23",
    make: "Samsung",
    model: "SM-S911B",
    software: "Android 13 (One UI 5.1)",
  },
  {
    id: "pixel8pro",
    name: "Google Pixel 8 Pro",
    make: "Google",
    model: "Pixel 8 Pro",
    software: "Android 14 (AP1A.240505.005)",
  },
  {
    id: "oneplus12",
    name: "OnePlus 12",
    make: "OnePlus",
    model: "CPH2581",
    software: "OxygenOS 14",
  },
  {
    id: "sonya7iv",
    name: "Sony Alpha 7 IV (Premium DSLR)",
    make: "Sony",
    model: "ILCE-7M4",
    software: "v2.01",
  },
];

export const EXIF_LOCATIONS: ExifLocationPreset[] = [
  { name: "Times Square, New York, USA", lat: 40.7580, lng: -73.9855 },
  { name: "Trafalgar Square, London, UK", lat: 51.5080, lng: -0.1281 },
  { name: "Shibuya Crossing, Tokyo, Japan", lat: 35.6595, lng: 139.7004 },
  { name: "Louvre Museum, Paris, France", lat: 48.8606, lng: 2.3376 },
  { name: "Sydney Opera House, Sydney, Australia", lat: -33.8568, lng: 151.2153 },
  { name: "CN Tower, Toronto, Canada", lat: 43.6426, lng: -79.3871 },
  { name: "Trevi Fountain, Rome, Italy", lat: 41.9009, lng: 12.4833 },
  { name: "Gardens by the Bay, Singapore", lat: 1.2816, lng: 103.8636 },
  { name: "Brandenburg Gate, Berlin, Germany", lat: 52.5163, lng: 13.3777 },
  { name: "Burj Khalifa, Dubai, UAE", lat: 25.1972, lng: 55.2744 },
  { name: "Copacabana Beach, Rio de Janeiro, Brazil", lat: -22.9714, lng: -43.1823 },
  { name: "Table Mountain, Cape Town, South Africa", lat: -33.9628, lng: 18.4098 },
  { name: "Gateway of India, Mumbai, India", lat: 18.9220, lng: 72.8347 },
];

export function getRandomLocation(): ExifLocationPreset {
  const index = Math.floor(Math.random() * EXIF_LOCATIONS.length);
  return EXIF_LOCATIONS[index];
}

export function formatExifDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}:${m}:${d} ${hh}:${mm}:${ss}`;
}

export function getRandomRecentDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 15); // 0 to 14 days ago
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
}
