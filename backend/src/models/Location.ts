export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GoogleMapsPlace {
  placeId: string;
  name: string;
  address: string;
  location: LocationCoordinates;
  rating?: number;
  types?: string[];
  placeUrl?: string;
}

export interface DistanceMatrix {
  fromLocation: LocationCoordinates;
  toLocation: LocationCoordinates;
  distance: number; // in kilometers
  duration: number; // in minutes
  mode: 'driving' | 'walking' | 'transit';
}

export interface NearbyArena {
  arenaId: string;
  name: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  address: string;
  type: string;
  rating: number;
  pricing: number;
}

export interface LocationSearch {
  query: string;
  location?: LocationCoordinates;
  radius?: number; // in kilometers (default 5)
  type?: string;
  minRating?: number;
}
