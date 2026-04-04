declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number })
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    getCenter(): LatLng
    getLevel(): number
  }

  class CustomOverlay {
    constructor(options: {
      position: LatLng
      content: string | HTMLElement
      yAnchor?: number
      xAnchor?: number
      zIndex?: number
    })
    setMap(map: Map | null): void
    getMap(): Map | null
  }

  namespace event {
    function addListener(target: object, type: string, callback: (...args: unknown[]) => void): void
    function removeListener(target: object, type: string, callback: (...args: unknown[]) => void): void
  }

  namespace services {
    type Status = 'OK' | 'ZERO_RESULT' | 'ERROR'

    interface PlacesSearchResult {
      id: string
      place_name: string
      address_name: string
      road_address_name: string
      x: string
      y: string
      phone: string
      category_name: string
    }

    class Places {
      keywordSearch(
        keyword: string,
        callback: (result: PlacesSearchResult[], status: Status) => void,
        options?: { location?: LatLng; size?: number }
      ): void
    }
  }
}

interface Window {
  kakao: {
    maps: typeof kakao.maps & {
      load: (callback: () => void) => void
    }
  }
}
