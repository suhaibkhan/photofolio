import { useState, useEffect } from 'react';
import { imageSize } from 'image-size';
import exifr from 'exifr';
import {
  formatFraction,
  normalizeFNumber,
  normalizeFocalLength,
  normalizeCamera,
} from '../utils/exif-format.js';

export function useExif(absolutePath) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [size, exif] = await Promise.all([
          Promise.resolve(imageSize(absolutePath)),
          exifr.parse(absolutePath).catch(() => null),
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              width: size?.width ?? 0,
              height: size?.height ?? 0,
              metadata: {
                camera: normalizeCamera(exif?.Make, exif?.Model),
                iso: typeof exif?.ISO === 'number' && Number.isFinite(exif.ISO) ? Math.round(exif.ISO) : null,
                aperture: normalizeFNumber(exif?.FNumber),
                shutterSpeed: formatFraction(exif?.ExposureTime),
                focalLength: normalizeFocalLength(exif?.FocalLength),
              },
            },
          });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, data: null });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [absolutePath]);

  return state;
}
