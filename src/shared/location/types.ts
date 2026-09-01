export interface GeoPosition {
  latitude: number
  longitude: number
  accuracy?: number
}

export type LocationErrorCode =
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'

export class LocationServiceError extends Error {
  code: LocationErrorCode

  constructor(code: LocationErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'LocationServiceError'
  }
}

export interface LocationService {
  getCurrentPosition(): Promise<GeoPosition>
  isSupported(): boolean
}
