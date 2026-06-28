import * as piexif from "piexifjs";

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  lat?: number;
  lng?: number;
  date?: string; // Format: "YYYY:MM:DD HH:MM:SS"
  description?: string;
}

/**
 * Strips any existing EXIF metadata and inserts fresh, SEO-optimized metadata.
 * Only supports JPEG buffers.
 */
export function injectExifMetadata(imageBuffer: Buffer, data: ExifData): Buffer {
  try {
    const binaryString = imageBuffer.toString("binary");

    // Initialize clean EXIF structure to completely remove original metadata
    const exifObj: any = {
      "0th": {},
      "Exif": {},
      "GPS": {},
    };

    // 0th IFD (General image info)
    if (data.make) {
      exifObj["0th"][piexif.ImageIFD.Make] = data.make;
    }
    if (data.model) {
      exifObj["0th"][piexif.ImageIFD.Model] = data.model;
    }
    if (data.software) {
      exifObj["0th"][piexif.ImageIFD.Software] = data.software;
    }
    if (data.date) {
      exifObj["0th"][piexif.ImageIFD.DateTime] = data.date;
    }
    if (data.description) {
      exifObj["0th"][piexif.ImageIFD.ImageDescription] = data.description;
    }

    // Exif IFD (Camera settings & capturing timestamps)
    if (data.date) {
      exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = data.date;
      exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = data.date;
    }

    // GPS IFD (Coordinates & geo-location tags)
    if (data.lat !== undefined && data.lng !== undefined) {
      exifObj["GPS"][piexif.GPSIFD.GPSVersionID] = [2, 2, 0, 0];
      
      // Latitude
      exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = data.lat < 0 ? "S" : "N";
      exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(Math.abs(data.lat));
      
      // Longitude
      exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = data.lng < 0 ? "W" : "E";
      exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(Math.abs(data.lng));
    }

    const exifBytes = piexif.dump(exifObj);
    const updatedBinaryString = piexif.insert(exifBytes, binaryString);
    
    return Buffer.from(updatedBinaryString, "binary");
  } catch (error) {
    console.error("Failed to inject EXIF metadata:", error);
    // Return original buffer in case of failure to prevent image corruption
    return imageBuffer;
  }
}
