import { useEffect, useState } from "react";

export function useGeolocation() {

    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {

        if (!navigator.geolocation) {

            setError("Geolocalização não suportada pelo navegador.");
            setLoading(false);
            return;

        }

        navigator.geolocation.getCurrentPosition(

            (position) => {

                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });

                setLoading(false);

            },

            (err) => {

                setError(err.message);
                setLoading(false);

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }

        );

    }, []);

    return {
        ...location,
        loading,
        error
    };

}