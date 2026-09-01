const gibs = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
const layer = 'VIIRS_SNPP_CorrectedReflectance_TrueColor'; // ~250m/px, daily
const imageSize = 2048;
const halfExtentDeg = 0.15;

function mostRecentAvailableDate() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
}

export async function fetchSatelliteImage(latitude, longitude) {
    const bbox = [
        longitude - halfExtentDeg,
        latitude - halfExtentDeg,
        longitude + halfExtentDeg,
        latitude + halfExtentDeg
    ].join(',');

    const params = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetMap',
        LAYERS: layer,
        STYLES: '',
        FORMAT: 'image/jpeg',
        SRS: 'EPSG:4326',
        BBOX: bbox,
        WIDTH: String(imageSize),
        HEIGHT: String(imageSize),
        TIME: mostRecentAvailableDate(),
    });
    console.log(`${gibs}?${params}`);
    const res = await fetch(`${gibs}?${params}`);
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`GIBS request failed (${res.status})`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
        contentType: res.headers.get('content-type'),
        base64: buffer.toString('base64')
    };
}