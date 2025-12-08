import type { LocationCoordinates, DistanceMatrix, NearbyArena, LocationSearch } from '@/models/Location';

export class LocationService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (this.toRad(toLat) - this.toRad(fromLat)) / 2;
    const dLng = (this.toRad(toLng) - this.toRad(fromLng)) / 2;

    const a =
      Math.sin(dLat) * Math.sin(dLat) +
      Math.cos(this.toRad(fromLat)) * Math.cos(this.toRad(toLat)) * Math.sin(dLng) * Math.sin(dLng);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate distance matrix
   */
  calculateDistanceMatrix(
    from: LocationCoordinates,
    to: LocationCoordinates,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ): DistanceMatrix {
    const distance = this.calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);

    // Approximate duration calculation
    // Driving: ~60 km/h, Walking: ~5 km/h, Transit: ~30 km/h
    const speedMap: Record<string, number> = {
      driving: 60,
      walking: 5,
      transit: 30,
    };

    const speed = speedMap[mode] || 60;
    const duration = Math.ceil((distance / speed) * 60); // in minutes

    return {
      fromLocation: from,
      toLocation: to,
      distance,
      duration,
      mode,
    };
  }

  /**
   * Find nearby arenas
   */
  findNearbyArenas(
    userLocation: LocationCoordinates,
    arenas: any[],
    radius: number = 5,
  ): NearbyArena[] {
    return arenas
      .map((arena) => {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          arena.location.latitude,
          arena.location.longitude,
        );

        return {
          arenaId: arena.id,
          name: arena.name,
          distance,
          duration: Math.ceil((distance / 60) * 60), // Approximate driving time
          address: arena.location.address,
          type: arena.type,
          rating: arena.rating,
          pricing: arena.pricing,
        };
      })
      .filter((arena) => arena.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get directions URL for Google Maps
   */
  getDirectionsUrl(from: LocationCoordinates, to: LocationCoordinates, mode: string = 'driving'): string {
    const modeMap: Record<string, string> = {
      driving: 'driving',
      walking: 'walking',
      transit: 'transit',
    };

    const travelMode = modeMap[mode] || 'driving';
    return `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=${travelMode}`;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(coords: LocationCoordinates): boolean {
    const { latitude, longitude } = coords;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Search locations within radius
   */
  searchNearbyLocations(
    userLocation: LocationCoordinates,
    locations: any[],
    searchParams: LocationSearch,
  ): any[] {
    const { radius = 5, type, minRating } = searchParams;

    let results = this.findNearbyArenas(userLocation, locations, radius);

    if (type) {
      results = results.filter((arena) => arena.type.toLowerCase() === type.toLowerCase());
    }

    if (minRating) {
      results = results.filter((arena) => arena.rating >= minRating);
    }

    return results;
  }
}

export default new LocationService();
