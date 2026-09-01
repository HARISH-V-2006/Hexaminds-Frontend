import type { GeoPosition } from './types'

interface NominatimResponse {
  display_name?: string
}

/** Client-side reverse geocode helper; coordinates are not persisted to sih_users. */
export async function reverseGeocode(position: GeoPosition): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'json')
    url.searchParams.set('lat', String(position.latitude))
    url.searchParams.set('lon', String(position.longitude))

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as NominatimResponse
    return data.display_name ?? null
  } catch {
    return null
  }
}
