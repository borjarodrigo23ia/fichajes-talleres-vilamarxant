/**
 * Promisified wrapper for navigator.geolocation.getCurrentPosition
 * 
 * @param options PositionOptions
 * @returns Promise<{ lat: string, lng: string }>
 */
export const getCurrentPosition = (options?: PositionOptions): Promise<{ lat: string, lng: string }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('La geolocalización no está soportada por este navegador.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude.toString(),
                    lng: position.coords.longitude.toString()
                });
            },
            (error) => {
                let msg = 'Error desconocido al obtener ubicación.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = 'Permiso de ubicación denegado. Por favor, habilítalo en tu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = 'La información de ubicación no está disponible.';
                        break;
                    case error.TIMEOUT:
                        msg = 'Se agotó el tiempo de espera para obtener la ubicación.';
                        break;
                }
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
                ...options
            }
        );
    });
};
