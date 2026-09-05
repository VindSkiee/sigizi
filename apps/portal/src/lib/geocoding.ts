const NOMINATIM_HEADERS = { "User-Agent": "SIGIZI-App/1.0" };

export interface ReverseGeocodeResult {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
}

export interface ForwardGeocodeResult {
  latitude: number;
  longitude: number;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id&addressdetails=1`,
      { headers: NOMINATIM_HEADERS },
    );
    const data = await res.json();
    const addr = data.address || {};
    return {
      province: addr.state || addr.region || "",
      regency: addr.city || addr.county || addr.state_district || "",
      district: addr.suburb || addr.village || addr.neighbourhood || "",
      village: addr.village || addr.hamlet || "",
      postalCode: addr.postcode || "",
    };
  } catch {
    return { province: "", regency: "", district: "", village: "", postalCode: "" };
  }
}

export async function forwardGeocode(
  query: string,
): Promise<ForwardGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=id`,
      { headers: NOMINATIM_HEADERS },
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}
