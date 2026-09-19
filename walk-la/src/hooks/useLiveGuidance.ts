import { useCallback, useEffect, useRef, useState } from 'react';

export interface GuidanceTarget {
  lat: number;
  lng: number;
}

export interface LiveGuidanceState {
  permissionState: 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';
  heading: number | null;          // device compass heading, degrees true north
  relativeBearing: number | null;  // rotation to apply to the arrow overlay
  distanceMeters: number | null;   // straight-line distance to target
  accuracy: number | null;         // GPS accuracy in meters
  offRoute: boolean;
}

const OFF_ROUTE_THRESHOLD_M = 25;
const PING_COOLDOWN_MS = 18_000;
const ACCURACY_DEGRADED_M = 40;

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }

function bearing(from: GuidanceTarget, to: GuidanceTarget): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(to.lat);
  const deltaLambda = toRad(to.lng - from.lng);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function haversineMeters(from: GuidanceTarget, to: GuidanceTarget): number {
  const R = 6371000;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function useLiveGuidance(target: GuidanceTarget | null) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPingRef = useRef<number | null>(null);
  const wasOffRouteRef = useRef(false);
  const lastPositionRef = useRef<GuidanceTarget | null>(null);
  const lastHeadingRef = useRef<number | null>(null);

  const [state, setState] = useState<LiveGuidanceState>({
    permissionState: 'idle',
    heading: null,
    relativeBearing: null,
    distanceMeters: null,
    accuracy: null,
    offRoute: false,
  });

  const playPing = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // audio unsupported/blocked -- the visual off-route state still fires
    }
  }, []);

  const applyPosition = useCallback(
    (current: GuidanceTarget, accuracy: number | null) => {
      if (!target) return;
      lastPositionRef.current = current;
      const distanceMeters = haversineMeters(current, target);
      const targetBearing = bearing(current, target);
      const offRoute = distanceMeters > OFF_ROUTE_THRESHOLD_M;

      if (offRoute && !wasOffRouteRef.current) {
        const now = Date.now();
        if (!lastPingRef.current || now - lastPingRef.current > PING_COOLDOWN_MS) {
          playPing();
          lastPingRef.current = now;
        }
      }
      wasOffRouteRef.current = offRoute;

      setState((prev) => ({
        ...prev,
        distanceMeters,
        accuracy,
        relativeBearing:
          lastHeadingRef.current != null
            ? (targetBearing - lastHeadingRef.current + 360) % 360
            : prev.relativeBearing,
        offRoute,
      }));
    },
    [target, playPing]
  );

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const iosHeading = (event as any).webkitCompassHeading as number | undefined;
    let heading: number | null = null;
    if (typeof iosHeading === 'number') {
      heading = iosHeading;
    } else if (event.absolute && event.alpha != null) {
      heading = (360 - event.alpha) % 360;
    }
    if (heading == null) return;
    lastHeadingRef.current = heading;
    setState((prev) => ({ ...prev, heading }));
  }, []);

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      applyPosition(
        { lat: position.coords.latitude, lng: position.coords.longitude },
        position.coords.accuracy
      );
    },
    [applyPosition]
  );

  useEffect(() => {
    if (target && lastPositionRef.current) {
      applyPosition(lastPositionRef.current, state.accuracy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Tear down whatever was acquired (camera track, orientation listeners,
  // geolocation watch) without resetting permissionState -- callers that
  // want the 'idle' reset use the public `stop` below, which wraps this.
  const teardown = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
  }, [handleOrientation]);

  const start = useCallback(async () => {
    setState((prev) => ({ ...prev, permissionState: 'requesting' }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      // nothing was acquired yet -- no teardown needed
      setState((prev) => ({ ...prev, permissionState: 'denied' }));
      return;
    }

    const DOE = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') {
          teardown(); // camera was already granted -- stop it
          setState((prev) => ({ ...prev, permissionState: 'denied' }));
          return;
        }
      } catch {
        teardown();
        setState((prev) => ({ ...prev, permissionState: 'denied' }));
        return;
      }
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation', handleOrientation as EventListener, true);

    if (!('geolocation' in navigator)) {
      teardown(); // camera + orientation were already granted -- stop them
      setState((prev) => ({ ...prev, permissionState: 'unsupported' }));
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => {
        teardown(); // camera + orientation were already granted -- stop them
        setState((prev) => ({ ...prev, permissionState: 'denied' }));
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    setState((prev) => ({ ...prev, permissionState: 'granted' }));
  }, [handleOrientation, handlePosition, teardown]);

  const stop = useCallback(() => {
    teardown();
    setState((prev) => ({ ...prev, permissionState: 'idle' }));
  }, [teardown]);

  useEffect(() => stop, [stop]);

  const accuracyDegraded = state.accuracy != null && state.accuracy > ACCURACY_DEGRADED_M;

  return { videoRef, ...state, accuracyDegraded, start, stop };
}
