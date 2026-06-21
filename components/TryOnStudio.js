'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BUSINESS } from '@/lib/businessRules';

// ── Virtual Nail Try-On Studio ──────────────────────────────────────
// On-device AI (MediaPipe hand tracking, WebGPU/WASM) finds the 21
// landmarks of each hand in the camera feed and paints nails on the
// real fingertips in real time. Zero servers, zero cost, total privacy:
// no frame ever leaves the visitor's device.

// Served from our own origin (Vercel's edge CDN) so the studio never depends
// on third-party CDNs (jsdelivr / googleapis) that are slow or blocked on some
// mobile networks — the #1 cause of "the AI model couldn't load". The wasm
// runtime is vendored from node_modules into public/mediapipe/wasm at this
// version; the model is the pinned float16/1 hand_landmarker.task.
const WASM_CDN = '/mediapipe/wasm';
const HAND_MODEL = '/mediapipe/hand_landmarker.task';

// [tip, joint-below] landmark indices for thumb → pinky
const FINGERTIPS = [
  [4, 3],
  [8, 7],
  [12, 11],
  [16, 15],
  [20, 19],
];

export const COLORS = [
  { name: 'Classic Red', hex: '#C3132F' },
  { name: 'Wine', hex: '#722F37' },
  { name: 'Hot Pink', hex: '#E8438D' },
  { name: 'Blush', hex: '#F4C2C2' },
  { name: 'Nude', hex: '#D8A48F' },
  { name: 'Coral', hex: '#FF6F61' },
  { name: 'Gold', hex: '#C9A961' },
  { name: 'Champagne', hex: '#F0D9B5' },
  { name: 'Lilac', hex: '#B69CD6' },
  { name: 'Sky', hex: '#9BC4E2' },
  { name: 'Mint', hex: '#98D7C2' },
  { name: 'Emerald', hex: '#0F6B4F' },
  { name: 'Royal Blue', hex: '#27408B' },
  { name: 'Chocolate', hex: '#5C3A21' },
  { name: 'Jet Black', hex: '#1A1A1A' },
  { name: 'Pearl White', hex: '#F5F2EA' },
];

export const SHAPES = [
  { id: 'almond', label: 'Almond' },
  { id: 'square', label: 'Square' },
  { id: 'coffin', label: 'Coffin' },
  { id: 'stiletto', label: 'Stiletto' },
];

export const FINISHES = [
  { id: 'glossy', label: 'Glossy' },
  { id: 'matte', label: 'Matte' },
  { id: 'chrome', label: 'Chrome' },
  { id: 'glitter', label: 'Glitter' },
  { id: 'french', label: 'French' },
];

// MediaPipe (and some browsers) reject with strings, Events, ErrorEvents or
// plain objects instead of Error instances — never trust `e.message` to exist,
// and never let an opaque value like "[object Event]" leak into a message.
function errorText(e) {
  if (!e) return '';
  if (typeof e === 'string') return e;
  if (typeof e.message === 'string' && e.message) return e.message;
  if (e.error?.message) return e.error.message;
  // Failed resource loads (wasm/model) reject with a DOM Event whose target is
  // the element/request that failed — surface something readable, not [object Event].
  if (typeof Event !== 'undefined' && e instanceof Event) {
    const src = e.target?.src || e.target?.currentSrc || e.target?.responseURL;
    return src ? `a required file failed to load (${src})` : 'a required file failed to load';
  }
  try {
    const s = String(e);
    return /^\[object .*\]$/.test(s) ? '' : s;
  } catch {
    return '';
  }
}

// Decode an image file into a downscaled canvas. Works everywhere —
// createImageBitmap(file, { resizeWidth }) throws on Safari/older browsers.
async function decodeImageFile(file, maxSide = 1280) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(new Error('that file could not be read as an image — a JPG or PNG works best'));
      el.src = url;
    });
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('that image looks empty — please try another photo');
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function cameraErrorMessage(e) {
  switch (e?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera permission was denied. Allow camera access in your browser settings, or upload a photo of your hand below! 📷';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return "No camera was found on this device — upload a photo of your hand instead! 🖼️";
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your camera seems to be in use by another app. Close it and try again, or upload a photo instead.';
    case 'SecurityError':
      return 'The camera only works on a secure (https) connection. You can still upload a photo below!';
    default: {
      const detail = errorText(e);
      return detail
        ? `Could not start the camera (${detail}). Try uploading a photo instead!`
        : 'Could not start the camera. Try uploading a photo of your hand instead!';
    }
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    Math.max(0, Math.min(255, Math.round(c + amount)))
  );
  return `rgb(${r},${g},${b})`;
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Nail outline in local coords: base at (0,0), tip pointing to -y
function traceNail(ctx, shape, w, L) {
  const hw = w / 2;
  ctx.beginPath();
  if (shape === 'square') {
    const r = hw * 0.45;
    ctx.moveTo(-hw, 0);
    ctx.lineTo(-hw, -L + r);
    ctx.quadraticCurveTo(-hw, -L, -hw + r, -L);
    ctx.lineTo(hw - r, -L);
    ctx.quadraticCurveTo(hw, -L, hw, -L + r);
    ctx.lineTo(hw, 0);
  } else if (shape === 'coffin') {
    const tip = hw * 0.55;
    ctx.moveTo(-hw, 0);
    ctx.lineTo(-tip, -L);
    ctx.lineTo(tip, -L);
    ctx.lineTo(hw, 0);
  } else if (shape === 'stiletto') {
    ctx.moveTo(-hw, 0);
    ctx.quadraticCurveTo(-hw * 0.7, -L * 0.6, 0, -L * 1.15);
    ctx.quadraticCurveTo(hw * 0.7, -L * 0.6, hw, 0);
  } else {
    // almond
    ctx.moveTo(-hw, 0);
    ctx.quadraticCurveTo(-hw, -L * 0.62, 0, -L);
    ctx.quadraticCurveTo(hw, -L * 0.62, hw, 0);
  }
  // rounded base (cuticle edge)
  ctx.quadraticCurveTo(0, hw * 0.5, -hw, 0);
  ctx.closePath();
}

// Deterministic sparkle positions so glitter doesn't strobe between frames
function sparklePoints(seed, count) {
  const pts = [];
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) pts.push([rand() * 2 - 1, -rand()]);
  return pts;
}
const SPARKLES = FINGERTIPS.map((_, i) => sparklePoints(i + 1, 14));

function drawNail(ctx, tipPx, dipPx, style, fingerIndex) {
  const dx = tipPx[0] - dipPx[0];
  const dy = tipPx[1] - dipPx[1];
  const segment = Math.hypot(dx, dy);
  if (segment < 6) return; // hand too far away / bad landmark

  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  // A real nail is much narrower and shorter than the tip-to-knuckle segment —
  // the old 0.92/1.7 sizing drew oversized "press-on talons" past the fingertip.
  const w = segment * 0.5;
  const L = segment * style.length;
  // nail base sits a touch behind the fingertip landmark
  const baseX = tipPx[0] - (dx / segment) * segment * 0.1;
  const baseY = tipPx[1] - (dy / segment) * segment * 0.1;

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(angle);

  traceNail(ctx, style.shape, w, L);

  // Soft contact shadow so the nail reads as resting on the finger rather
  // than a flat sticker pasted on top of it — applied to the base fill only.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = w * 0.3;
  ctx.shadowOffsetY = w * 0.12;

  if (style.finish === 'french') {
    ctx.fillStyle = 'rgba(244, 219, 208, 0.85)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.clip();
    ctx.fillStyle = rgba(style.color, 0.95);
    ctx.fillRect(-w, -L * 1.2, w * 2, L * 0.42);
    ctx.restore();
  } else if (style.finish === 'chrome') {
    // Multiple light/dark bands read as a metallic mirror finish; a single
    // soft gradient (the old version) just looked like a flat dark fill.
    const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, -L);
    grad.addColorStop(0, shade(style.color, 100));
    grad.addColorStop(0.22, shade(style.color, 10));
    grad.addColorStop(0.48, style.color);
    grad.addColorStop(0.68, shade(style.color, -65));
    grad.addColorStop(0.85, shade(style.color, 40));
    grad.addColorStop(1, shade(style.color, 90));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  } else {
    ctx.fillStyle = rgba(style.color, style.finish === 'matte' ? 0.94 : 0.9);
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Thin, soft outline — just enough definition against any skin tone,
  // without the hard cartoon edge of a thick solid stroke.
  traceNail(ctx, style.shape, w, L);
  ctx.strokeStyle = rgba('#000000', 0.12);
  ctx.lineWidth = Math.max(0.75, w * 0.025);
  ctx.stroke();

  if (style.finish === 'glitter') {
    ctx.save();
    traceNail(ctx, style.shape, w, L);
    ctx.clip();
    for (const [sx, sy] of SPARKLES[fingerIndex]) {
      const px = sx * (w / 2) * 0.85;
      const py = sy * L * 0.92;
      const r = Math.max(0.6, w * 0.06);
      ctx.fillStyle = Math.abs(sx) > 0.5 ? 'rgba(255,255,255,0.85)' : 'rgba(255,230,160,0.9)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (style.finish === 'glossy' || style.finish === 'glitter' || style.finish === 'french' || style.finish === 'chrome') {
    // Wet-polish highlight: a soft broad sheen plus a small crisp specular
    // dot — one alone reads as flat, the pair reads as "shiny".
    ctx.save();
    traceNail(ctx, style.shape, w, L);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.16, -L * 0.6, w * 0.13, L * 0.24, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.2, -L * 0.68, w * 0.045, L * 0.06, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawHands(ctx, landmarks, width, height, style) {
  for (const hand of landmarks) {
    FINGERTIPS.forEach(([tipIdx, dipIdx], fingerIndex) => {
      const tip = hand[tipIdx];
      const dip = hand[dipIdx];
      drawNail(
        ctx,
        [tip.x * width, tip.y * height],
        [dip.x * width, dip.y * height],
        style,
        fingerIndex
      );
    });
  }
}

// Exponential moving average over landmark positions between frames — raw
// MediaPipe output flickers slightly frame to frame, which reads as the
// whole nail "vibrating" on a live feed. This trades a few ms of lag for a
// steady, premium-feeling overlay.
function smoothHands(rawHands, prevHands, alpha = 0.5) {
  if (!prevHands || prevHands.length !== rawHands.length) {
    return rawHands.map((hand) => hand.map((p) => ({ x: p.x, y: p.y })));
  }
  return rawHands.map((hand, hi) =>
    hand.map((p, li) => {
      const prev = prevHands[hi]?.[li];
      if (!prev) return { x: p.x, y: p.y };
      return { x: prev.x * alpha + p.x * (1 - alpha), y: prev.y * alpha + p.y * (1 - alpha) };
    })
  );
}

function TryOnStudio() {
  const [mode, setMode] = useState('idle'); // idle | camera | photo
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [handVisible, setHandVisible] = useState(false);
  const [color, setColor] = useState(COLORS[0].hex);
  const [shape, setShape] = useState('almond');
  const [finish, setFinish] = useState('glossy');
  const [length, setLength] = useState(0.78);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const landmarkerRef = useRef(null);
  const runningModeRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const mirroredRef = useRef(true);
  const smoothedHandsRef = useRef([]);
  const photoRef = useRef(null); // { bitmap, landmarks }
  const styleRef = useRef({ color, shape, finish, length });

  styleRef.current = { color, shape, finish, length };

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopCamera();
    landmarkerRef.current?.close();
  }, [stopCamera]);

  const getLandmarker = useCallback(async (runningMode) => {
    if (!landmarkerRef.current) {
      setStatus('Loading the AI model (~6 MB, one time)…');
      let vision;
      try {
        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
        vision = await FilesetResolver.forVisionTasks(WASM_CDN);

        // GPU first; many phones/webviews can't create a WebGL context for
        // the GPU delegate, so silently fall back to CPU instead of dying.
        try {
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
            numHands: 2,
            runningMode,
          });
        } catch {
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'CPU' },
            numHands: 2,
            runningMode,
          });
        }
        runningModeRef.current = runningMode;
      } catch (e) {
        // leave the ref empty so the next tap retries from scratch
        landmarkerRef.current = null;
        const detail = errorText(e);
        throw new Error(
          `the AI model couldn't load${detail ? ` — ${detail}` : ''}. Please check your internet connection and try again`
        );
      }
    } else if (runningModeRef.current !== runningMode) {
      await landmarkerRef.current.setOptions({ runningMode });
      runningModeRef.current = runningMode;
    }
    return landmarkerRef.current;
  }, []);

  // ── Live camera mode ──────────────────────────────────────────────
  const startCamera = useCallback(async (facing = 'user') => {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        window.isSecureContext === false
          ? 'The camera only works on a secure (https) connection. You can still upload a photo below!'
          : "This browser doesn't support camera access — upload a photo of your hand instead! 🖼️"
      );
      return;
    }

    setMode('camera');
    try {
      const landmarker = await getLandmarker('VIDEO');

      setStatus('Starting camera…');
      stopCamera();
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (constraintError) {
        // Some devices reject the ideal resolution / facing mode —
        // permission errors won't recover, but anything else might with
        // the simplest possible constraints.
        if (
          constraintError?.name === 'NotAllowedError' ||
          constraintError?.name === 'PermissionDeniedError'
        ) {
          throw constraintError;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      mirroredRef.current = facing === 'user';

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      setStatus('');
      smoothedHandsRef.current = [];
      let lastVideoTime = -1;
      let lastResult = null;

      const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas || !video.videoWidth) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          try {
            lastResult = landmarker.detectForVideo(video, performance.now());
          } catch {
            /* skip a bad frame rather than killing the whole loop */
          }
        }

        const ctx = canvas.getContext('2d');
        ctx.save();
        if (mirroredRef.current) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawHands = lastResult?.landmarks || [];
        const hands = smoothHands(rawHands, smoothedHandsRef.current);
        smoothedHandsRef.current = hands;
        setHandVisible(hands.length > 0);
        drawHands(ctx, hands, canvas.width, canvas.height, styleRef.current);
        ctx.restore();

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      stopCamera();
      setMode('idle');
      setStatus('');
      setError(cameraErrorMessage(e));
    }
  }, [getLandmarker, stopCamera]);

  // ── Photo mode ────────────────────────────────────────────────────
  const renderPhoto = useCallback(() => {
    const photo = photoRef.current;
    const canvas = canvasRef.current;
    if (!photo || !canvas) return;
    const { bitmap, landmarks } = photo;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    drawHands(ctx, landmarks, canvas.width, canvas.height, styleRef.current);
  }, []);

  const handlePhotoUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    stopCamera();
    setMode('photo');

    try {
      const landmarker = await getLandmarker('IMAGE');
      setStatus('Finding your hand…');

      // decoded + downscaled on a plain canvas: works on every browser,
      // unlike createImageBitmap with resize options
      const bitmap = await decodeImageFile(file, 1280);

      const result = landmarker.detect(bitmap);
      const hands = result?.landmarks || [];
      photoRef.current = { bitmap, landmarks: hands };
      setHandVisible(hands.length > 0);
      setStatus('');
      if (hands.length === 0) {
        setError("I couldn't find a hand in that photo — try one with your fingers clearly visible. ✋");
      }
      renderPhoto();
    } catch (e) {
      setMode('idle');
      setStatus('');
      const detail = errorText(e);
      setError(
        detail
          ? `Could not process that photo — ${detail}.`
          : 'Could not process that photo. Please try another one (a clear JPG or PNG works best).'
      );
    } finally {
      event.target.value = '';
    }
  }, [getLandmarker, stopCamera, renderPhoto]);

  // re-paint the uploaded photo whenever the style changes
  useEffect(() => {
    if (mode === 'photo') renderPhoto();
  }, [mode, color, shape, finish, length, renderPhoto]);

  // ── Capture & share ───────────────────────────────────────────────
  const describeLook = () => {
    const colorName = COLORS.find((c) => c.hex === color)?.name || color;
    const shapeName = SHAPES.find((s) => s.id === shape)?.label || shape;
    const finishName = FINISHES.find((f) => f.id === finish)?.label || finish;
    return `${colorName} · ${shapeName} · ${finishName}`;
  };

  const capture = async () => {
    const canvas = canvasRef.current;
    if (!canvas || mode === 'idle') return;

    // Compose with a branded watermark — every shared look markets the salon
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const fs = Math.max(16, Math.round(out.width * 0.028));
    ctx.font = `600 ${fs}px -apple-system, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = fs * 0.45;
    ctx.fillStyle = '#E8CF96';
    ctx.fillText('💅 The Nail Hubs · @thenailhubs', out.width - fs * 0.8, out.height - fs * 0.7);

    const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return;
    const file = new File([blob], 'my-nail-hubs-look.jpg', { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Nail Hubs look',
          text: `I designed this look at The Nail Hubs AI studio: ${describeLook()} 💅`,
        });
        return;
      } catch {
        /* user cancelled share — fall through to download */
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-nail-hubs-look.jpg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const bookThisLook = () => {
    const text = encodeURIComponent(
      `Hello Saloni! 👋 I just designed my dream nails in your AI Try-On Studio 💅\n\n✨ My look: ${describeLook()}\n\nI'd love to book an appointment for this!\n• Name:\n• Preferred date:\n• Preferred time:`
    );
    window.open(`https://wa.me/${BUSINESS.phoneIntl}?text=${text}`, '_blank');
  };

  const stopStudio = () => {
    stopCamera();
    photoRef.current = null;
    setHandVisible(false);
    setMode('idle');
  };

  return (
    <div className="tryon-studio">
      <div className="tryon-stage">
        {/* hidden video element feeds the canvas */}
        <video ref={videoRef} playsInline muted className="tryon-video" />
        <canvas ref={canvasRef} className={`tryon-canvas ${mode === 'idle' ? 'hidden' : ''}`} />

        {mode === 'idle' && (
          <div className="tryon-placeholder">
            <div className="tryon-placeholder-icon">🖐️💅</div>
            <h3>Your hand is the canvas</h3>
            <p>
              Start the camera and hold your hand up — our on-device AI paints your
              chosen nails onto your real fingertips, live. Nothing is uploaded,
              ever.
            </p>
            <div className="tryon-start-buttons">
              <button className="btn-primary" onClick={() => startCamera('user')}>
                📷 Start Camera
              </button>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                🖼️ Upload a Photo
              </button>
            </div>
          </div>
        )}

        {status && <div className="tryon-status" role="status" aria-live="polite">{status}</div>}
        {mode === 'camera' && !status && !handVisible && (
          <div className="tryon-status" role="status" aria-live="polite">Show your hand to the camera ✋</div>
        )}
      </div>

      {error && <p className="tryon-error" role="alert">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{ display: 'none' }}
      />

      <div className="tryon-controls">
        <div className="tryon-control-group">
          <h4>Colour</h4>
          <div className="tryon-swatches">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                className={`tryon-swatch ${color === c.hex ? 'active' : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                aria-label={c.name}
                onClick={() => setColor(c.hex)}
              />
            ))}
          </div>
        </div>

        <div className="tryon-control-group">
          <h4>Shape</h4>
          <div className="tryon-chips">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                className={`tryon-chip ${shape === s.id ? 'active' : ''}`}
                onClick={() => setShape(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tryon-control-group">
          <h4>Finish</h4>
          <div className="tryon-chips">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                className={`tryon-chip ${finish === f.id ? 'active' : ''}`}
                onClick={() => setFinish(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tryon-control-group">
          <h4>Length</h4>
          <input
            type="range"
            min="0.55"
            max="1.25"
            step="0.05"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="tryon-slider"
            aria-label="Nail length"
          />
        </div>

        <div className="tryon-actions">
          {mode === 'camera' && (
            <>
              <button className="tryon-action" onClick={() => startCamera('environment')}>
                🔄 Back Camera
              </button>
              <button className="tryon-action" onClick={() => startCamera('user')}>
                🤳 Front Camera
              </button>
            </>
          )}
          {mode !== 'idle' && (
            <>
              <button className="tryon-action" onClick={() => fileInputRef.current?.click()}>
                🖼️ Photo
              </button>
              <button className="tryon-action highlight" onClick={capture}>
                📸 Save / Share My Look
              </button>
              <button className="tryon-action book" onClick={bookThisLook}>
                💅 Book This Look on WhatsApp
              </button>
              <button className="tryon-action" onClick={stopStudio}>
                ✕ Stop
              </button>
            </>
          )}
        </div>
      </div>

      <p className="tryon-privacy">
        🔒 100% private: the AI runs entirely on your device. No photo or video is ever uploaded.
      </p>
    </div>
  );
}

export default TryOnStudio;
