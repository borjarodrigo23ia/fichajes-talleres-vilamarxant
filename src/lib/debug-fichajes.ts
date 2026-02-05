export const dlogFichajes = (...args: any[]) => {
    if (process.env.NEXT_PUBLIC_DEBUG_FICHAJES === 'true') {
        console.log(...args);
    }
};
