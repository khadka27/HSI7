import { injectExifMetadata } from "../lib/exif";
import * as piexif from "piexifjs";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

async function runTest() {
  console.log("--- Starting Real Image EXIF metadata injection test ---");
  
  const pngPath = "/home/khadka27/.gemini/antigravity-ide/brain/ccf4b480-1de3-4ac0-a219-9aa8762d317f/test_product_1782630699848.png";
  if (!fs.existsSync(pngPath)) {
    console.error(`Test source PNG image not found at ${pngPath}`);
    process.exit(1);
  }

  console.log("Converting PNG to JPEG using sharp...");
  const jpegBuffer = await sharp(pngPath).jpeg({ quality: 90 }).toBuffer();
  console.log(`JPEG buffer created, size: ${(jpegBuffer.length / 1024).toFixed(1)} KB`);

  const testData = {
    make: "Apple",
    model: "iPhone 15 Pro",
    software: "iOS 17.5.1",
    lat: 40.7580, // Times Square, NY
    lng: -73.9855,
    date: "2026:06:28 12:00:00",
    description: "Sleek, premium product photo of a Vitamin D supplement bottle.",
  };

  console.log("Injecting EXIF data...");
  const outputBuffer = injectExifMetadata(jpegBuffer, testData);

  const outputPath = path.join(__dirname, "test_output_exif.jpg");
  fs.writeFileSync(outputPath, new Uint8Array(outputBuffer));
  console.log(`Saved output image to: ${outputPath}`);

  console.log("Loading and parsing EXIF from generated image...");
  const binaryString = outputBuffer.toString("binary");
  const loadedExif = piexif.load(binaryString);

  // Check 0th tags
  const make = loadedExif["0th"][piexif.ImageIFD.Make];
  const model = loadedExif["0th"][piexif.ImageIFD.Model];
  const software = loadedExif["0th"][piexif.ImageIFD.Software];
  const dateStr = loadedExif["0th"][piexif.ImageIFD.DateTime];
  const desc = loadedExif["0th"][piexif.ImageIFD.ImageDescription];

  // Check GPS tags
  const gpsVersion = loadedExif["GPS"][piexif.GPSIFD.GPSVersionID];
  const latRef = loadedExif["GPS"][piexif.GPSIFD.GPSLatitudeRef];
  const latVal = loadedExif["GPS"][piexif.GPSIFD.GPSLatitude];
  const lngRef = loadedExif["GPS"][piexif.GPSIFD.GPSLongitudeRef];
  const lngVal = loadedExif["GPS"][piexif.GPSIFD.GPSLongitude];

  console.log("\nResults verification:");
  console.log(`- Make: expected "${testData.make}", got "${make}"`);
  console.log(`- Model: expected "${testData.model}", got "${model}"`);
  console.log(`- Software: expected "${testData.software}", got "${software}"`);
  console.log(`- DateTime: expected "${testData.date}", got "${dateStr}"`);
  console.log(`- Description: expected "${testData.description}", got "${desc}"`);
  console.log(`- GPS Version: expected "[2, 2, 0, 0]", got "[${gpsVersion}]"`);
  console.log(`- GPS Lat Ref: expected "N", got "${latRef}"`);
  console.log(`- GPS Lng Ref: expected "W", got "${lngRef}"`);

  // Verify numerical values for GPS
  const latDeg = latVal[0][0] / latVal[0][1];
  const latMin = latVal[1][0] / latVal[1][1];
  const latSec = latVal[2][0] / latVal[2][1];
  const calculatedLat = latDeg + latMin / 60 + latSec / 3600;
  console.log(`- GPS Lat parsed: ${calculatedLat.toFixed(4)} (diff: ${Math.abs(calculatedLat - testData.lat).toFixed(6)})`);

  const lngDeg = lngVal[0][0] / lngVal[0][1];
  const lngMin = lngVal[1][0] / lngVal[1][1];
  const lngSec = lngVal[2][0] / lngVal[2][1];
  const calculatedLng = (lngDeg + lngMin / 60 + lngSec / 3600) * (lngRef === "W" ? -1 : 1);
  console.log(`- GPS Lng parsed: ${calculatedLng.toFixed(4)} (diff: ${Math.abs(calculatedLng - testData.lng).toFixed(6)})`);

  const isSuccessful = 
    make === testData.make && 
    model === testData.model && 
    software === testData.software &&
    dateStr === testData.date &&
    desc === testData.description &&
    latRef === "N" &&
    lngRef === "W" &&
    Math.abs(calculatedLat - testData.lat) < 0.001 &&
    Math.abs(calculatedLng - testData.lng) < 0.001;

  if (isSuccessful) {
    console.log("\n✅ SUCCESS: Real image EXIF parsing and verification passed!");
  } else {
    console.log("\n❌ FAILURE: Real image EXIF verification failed.");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
