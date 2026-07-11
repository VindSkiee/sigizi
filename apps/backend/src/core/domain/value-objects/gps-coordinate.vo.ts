export class GpsCoordinate {
  readonly latitude: number;
  readonly longitude: number;

  constructor(latitude: number, longitude: number) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }

    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Calculate distance to another coordinate using Haversine formula
   * @returns distance in kilometers
   */
  distanceTo(other: GpsCoordinate): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(other.latitude - this.latitude);
    const dLon = this.toRad(other.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  equals(other: GpsCoordinate): boolean {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static fromPrisma(data: {
    latitude: number | null;
    longitude: number | null;
  }): GpsCoordinate | null {
    if (data.latitude === null || data.longitude === null) return null;
    return new GpsCoordinate(data.latitude, data.longitude);
  }
}
