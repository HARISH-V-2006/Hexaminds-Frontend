import {
  LocationServiceError,
  type GeoPosition,
  type LocationService,
} from './types'

export class WebLocationService implements LocationService {
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
  }

  getCurrentPosition(): Promise<GeoPosition> {
    if (!this.isSupported()) {
      return Promise.reject(
        new LocationServiceError(
          'unsupported',
          'Geolocation is not supported on this device.',
        ),
      )
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(
              new LocationServiceError(
                'permission_denied',
                'Location permission was denied.',
              ),
            )
            return
          }

          if (error.code === error.TIMEOUT) {
            reject(
              new LocationServiceError(
                'timeout',
                'Location request timed out.',
              ),
            )
            return
          }

          reject(
            new LocationServiceError(
              'unavailable',
              'Location is currently unavailable.',
            ),
          )
        },
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        },
      )
    })
  }
}

export const locationService: LocationService = new WebLocationService()
