import { GpsCoordinate } from "../domain/value-objects/gps-coordinate.vo";

export function calculateDistanceKm(
  from: GpsCoordinate,
  to: GpsCoordinate,
): number {
  return from.distanceTo(to);
}

export function findWithinRadius(
  center: GpsCoordinate,
  points: Array<{ id: string; coordinate: GpsCoordinate; [key: string]: any }>,
  radiusKm: number,
): Array<{ id: string; distance: number; [key: string]: any }> {
  return points
    .map((point) => ({
      ...point,
      distance: center.distanceTo(point.coordinate),
    }))
    .filter((point) => point.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
