const DEFAULT_LAT = 21.140310981544836;
const DEFAULT_LON = 78.80800464452851;

export const getLocation = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON }),
      { timeout: 3000 },
    );
  });
