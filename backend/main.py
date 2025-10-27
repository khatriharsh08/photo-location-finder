# main.py

import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import piexif
from piexif import InvalidImageDataError

# --- Application Setup ---
app = FastAPI(
    title="EXIF Geolocation Extractor",
    description="An efficient API to extract GPS data from image uploads.",
    version="2.0.0"
)

# --- Security & CORS Configuration ---
# CORS: Allow your frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your actual frontend domain in production
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Use a set for faster O(1) average time complexity lookups
ALLOWED_EXTENSIONS = {".jpg", ".jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# --- Helper Function ---
def dms_to_decimal(dms: tuple, ref: str) -> float:
    """Converts GPS DMS (Degrees, Minutes, Seconds) to decimal degrees."""
    degrees, minutes, seconds = dms
    decimal = (degrees[0] / degrees[1] +
               (minutes[0] / minutes[1]) / 60 +
               (seconds[0] / seconds[1]) / 3600)

    # South and West coordinates are negative
    if ref in {'S', 'W'}:
        decimal *= -1
    return decimal

# --- API Endpoint ---
@app.post("/upload", summary="Upload Image and Extract GPS Data")
async def upload_image_and_extract_gps(file: UploadFile = File(...)):
    """
    This endpoint accepts an image file (JPEG), validates it, and extracts
    GPS latitude and longitude from its EXIF data.

    - **Validates**: File type (JPEG) and size (max 5MB).
    - **Extracts**: GPS coordinates from EXIF metadata.
    - **Returns**: Latitude, Longitude, and a Google Maps link.
    """
    # 1. Validate file extension (more efficient check)
    if not file.filename or not file.filename.lower().endswith(tuple(ALLOWED_EXTENSIONS)):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed."
        )

    # 2. Validate file size *before* reading into memory
    # We seek to the end of the file to get its size, then reset the pointer.
    # This avoids loading a potentially huge file into RAM just to check its size.
    file.file.seek(0, io.SEEK_END)
    file_size = file.file.tell()
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB."
        )
    file.file.seek(0) # Reset file pointer to the beginning

    # 3. Read the validated file contents
    contents = await file.read()

    # 4. Process EXIF data directly with piexif
    try:
        # piexif.load() is more direct than using Pillow first.
        # It will raise InvalidImageDataError if it's not a valid JPEG with EXIF.
        exif_data = piexif.load(contents)

        # Use .get() for safe dictionary access to avoid KeyErrors
        gps_data = exif_data.get("GPS")
        if not gps_data:
            raise HTTPException(status_code=404, detail="No GPS data found in the image's EXIF metadata.")

        # Safely extract required GPS tags
        lat_dms = gps_data.get(piexif.GPSIFD.GPSLatitude)
        lat_ref = gps_data.get(piexif.GPSIFD.GPSLatitudeRef, b'N').decode()
        lon_dms = gps_data.get(piexif.GPSIFD.GPSLongitude)
        lon_ref = gps_data.get(piexif.GPSIFD.GPSLongitudeRef, b'W').decode()

        if not all([lat_dms, lat_ref, lon_dms, lon_ref]):
             raise HTTPException(status_code=404, detail="Incomplete GPS data. Latitude or Longitude tags are missing.")

        # Convert to decimal
        latitude = dms_to_decimal(lat_dms, lat_ref)
        longitude = dms_to_decimal(lon_dms, lon_ref)

        return {
            "latitude": latitude,
            "longitude": longitude,
            "map_link": f"https://www.google.com/maps?q={latitude},{longitude}"
        }

    except InvalidImageDataError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file. Could not read EXIF data.")
    except (KeyError, ValueError, TypeError) as e:
        # This catches various potential issues during data parsing/conversion
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while parsing EXIF data: {e}")
    finally:
        # Ensure the file is closed to free up resources
        await file.close()