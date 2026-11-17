// WHAT HAPPENS IF YOU DON'T SLEEP FOR 7 DAYS? (Deep Dive 3D)
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import { Human } from './core/human.js';
import * as SETS from './core/sets.js';
import { label, pill, warning, blackout } from './core/look2d.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, k);
function screen(p, cam) { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);
  const cam = camera(30);
  const KLOOK = { aperture: 0.003, maxblur: 0.01, bloom: 0.2 },
        XLOOK = { aperture: 0.0015, bloom: 0.55, bloomThreshold: 0.4, vignette: 0.45 },
        VLOOK = { aperture: 0.005, maxblur: 0.012, bloom: 0.6, bloomThreshold: 0.5, focus: 3.2 };

  // ── the world ──────────────────────────────────────────────────────────
  const K = SETS.kitchen(E), hero = new Human({}); hero.group.position.set(0.1, 0, -0.6); K.scene.add(hero.group);
  const X = SETS.xrayStage(E), xh = new Human({}), xmat = SETS.xrayMaterial(); xh.setBodyMaterial(xmat); const I = SETS.insides(); xh.spine.add(I.group); X.scene.add(xh.group);
  const VS = SETS.vessel(E);
  const CYAN = new THREE.Color('#4FD1E8'), RED = new THREE.Color('#FF3B3B'), AMBER = new THREE.Color('#FFB03B');
  const chest = (h, k) => h.parts[0].scale.set(1 + 0.03 * k, 1 + 0.012 * k, 1 + 0.08 * k);
  const lungs = (k) => I.lungs.forEach((l) => l.scale.set(1 + 0.12 * k, 1 + 0.1 * k, 1 + 0.12 * k));
  const reset = () => { hero.pose({}); chest(hero, 0); xh.pose({}); chest(xh, 0); lungs(0); I.heart.scale.setScalar(1); xmat.uniforms.uCol.value.copy(CYAN); };
  const kitchenRender = (focus, extra = {}) => E.render(K.scene, cam, { ...KLOOK, focus, ...extra });
  const FACE = V3(0.1, 1.68, -0.6);

  // S01 · Line 0: Hook - Guy sits looking exhausted, staring into camera
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'face close-up: tired eyes, camera pushes in', draw(lt, d, t, blit) {
      reset(); const k = eo(clamp(lt / d));
      hero.pose({ head: [6 + Math.sin(lt * 1.5) * 2, -4, 0], spine: [4, 0, 0], lid: 0.45, look: [0, 4] });
      cam.position.copy(lerpV(V3(0.45, 1.74, 0.48), V3(0.28, 1.68, 0.08), eio(lt / d)));
      cam.lookAt(FACE); kitchenRender(cam.position.distanceTo(FACE)); blit();
    } });
    cue(st + 0.1, 'whoosh', { gain: 0.6 }); }

  // S02 · Line 1: "After 24 hours without sleep"
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'medium shot: clock / 24 hour pill', draw(lt, d, t, blit) {
      reset(); hero.pose({ head: [8, -8, 2], lid: 0.55, look: [4, 0] });
      const a = lerp(0.5, 0.22, eio(lt / d));
      cam.position.set(0.1 + Math.sin(a) * 2.0, 1.48, -0.6 + Math.cos(a) * 2.0);
      cam.lookAt(0.1, 1.3, -0.6); kitchenRender(2.0); blit();
      pill('24 HOURS NO SLEEP', 540, 320, eob(seg(lt, 0.1, 0.35)), '#FFD43B');
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop', { gain: 0.6 }); }

  // S03 · Line 2: "your brain performs like you're legally drunk"
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'x-ray head: brain glowing amber, alcohol warning', draw(lt, d, t, blit) {
      reset(); xmat.uniforms.uCol.value.copy(CYAN).lerp(AMBER, 0.65);
      xh.pose({ head: [-4, 6 * Math.sin(lt * 2), 0], lid: 0.4 });
      cam.position.copy(lerpV(V3(0.35, 1.72, 1.3), V3(0.15, 1.68, 0.85), eio(lt / d)));
      cam.lookAt(0, 1.65, 0); E.render(X.scene, cam, { ...XLOOK, focus: cam.position.distanceTo(V3(0, 1.65, 0)) }); blit();
      pill('BRAIN: = 0.10% BAC', 540, 320, eob(seg(lt, 0.15, 0.4)), '#FFB03B');
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'alarm', { gain: 0.4 }); }

  // S04 · Line 3: "as your reaction time slows down by nearly 50%"
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'inside vessel: sluggish flow, -50% reaction pill', draw(lt, d, t, blit) {
      VS.update(t, -lt * 0.8, 0.3, 0.2);
      cam.position.set(0, 0, -lt * 0.8); cam.lookAt(0.1, -0.05, -lt * 0.8 - 5);
      E.render(VS.scene, cam, VLOOK); blit();
      pill('REACTION TIME: -50%', 540, 320, eob(seg(lt, 0.1, 0.35)), '#FF5A5A');
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop', { gain: 0.5 }); }

  // S05 · Line 4: "By day two, your body begins forcing microsleeps"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'real world face: head nods, heavy eyes', draw(lt, d, t, blit) {
      reset(); const nod = Math.sin(lt * 3) * 6;
      hero.pose({ head: [8 + nod, -2, 0], lid: 0.7, look: [0, 8] });
      cam.position.copy(lerpV(V3(0.35, 1.7, 0.4), V3(0.2, 1.66, 0.1), eio(lt / d)));
      cam.lookAt(FACE); kitchenRender(cam.position.distanceTo(FACE)); blit();
      pill('DAY 2: 48 HOURS', 540, 320, eob(seg(lt, 0.1, 0.35)), '#FF8A8A');
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'thud', { gain: 0.5 }); }

  // S06 · Line 5: "brain literally shuts off for seconds with eyes open"
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'x-ray head: brain blacks out dark blue, eyes open', draw(lt, d, t, blit) {
      reset(); const off = clamp((lt - 0.5) / 0.8);
      xmat.uniforms.uCol.value.copy(CYAN).lerp(new THREE.Color('#1A2B4C'), off);
      xh.pose({ head: [6, 0, 0], lid: -0.2 });
      cam.position.copy(lerpV(V3(-0.3, 1.7, 1.2), V3(-0.1, 1.66, 0.8), eio(lt / d)));
      cam.lookAt(0, 1.65, 0); E.render(X.scene, cam, { ...XLOOK, focus: cam.position.distanceTo(V3(0, 1.65, 0)) }); blit();
      pill('⚠️ MICROSLEEP: 4 SEC', 540, 320, eob(seg(lt, 0.2, 0.45)), '#FF3B3B');
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'alarm', { gain: 0.6 }); }

  // S07 · Line 6: "By day three, toxic waste proteins build up"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'inside vessel: red toxic particles and bubbles', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      VS.update(t, -lt * 1.4, 0.4 + 0.6 * k, 0.6 * k);
      cam.position.set(Math.sin(lt) * 0.08, 0, -lt * 1.4); cam.lookAt(0.1, -0.05, -lt * 1.4 - 5);
      E.render(VS.scene, cam, VLOOK); blit();
      pill('TOXIC PROTEIN BUILDUP ↑', 540, 320, eob(seg(lt, 0.1, 0.35)), '#FF8A3B');
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'bubbles', { gain: 0.5 }); }

  // S08 · Line 7: "brain can only flush toxins in deep sleep"
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'x-ray body: glymphatic drainage blocked', draw(lt, d, t, blit) {
      reset(); xmat.uniforms.uCol.value.copy(CYAN).lerp(RED, 0.45);
      xh.pose({ head: [10, -4, 0], spine: [4, 0, 0], lid: 0.6 });
      cam.position.copy(lerpV(V3(0.5, 1.5, 1.5), V3(0.25, 1.45, 1.05), eio(lt / d)));
      cam.lookAt(0, 1.35, 0); E.render(X.scene, cam, { ...XLOOK, focus: cam.position.distanceTo(V3(0, 1.35, 0)) }); blit();
      pill('BRAIN FLUSH: BLOCKED ❌', 540, 320, eob(seg(lt, 0.15, 0.4)), '#FF4444');
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop', { gain: 0.5 }); }

  // S09 · Line 8: "By day five, intense hallucinations kick in"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'real world: guy paranoid, shaking head, surreal lighting', draw(lt, d, t, blit) {
      reset(); const shake = Math.sin(lt * 12) * 5;
      hero.pose({ head: [4, shake, 0], lid: -0.3, look: [Math.sin(lt * 8) * 6, 0] });
      cam.position.copy(lerpV(V3(-0.4, 1.72, 0.5), V3(-0.2, 1.66, 0.15), eio(lt / d)));
      cam.lookAt(FACE); kitchenRender(cam.position.distanceTo(FACE), { exposure: 0.8 + 0.3 * Math.sin(lt * 7) }); blit();
      pill('DAY 5: HALLUCINATIONS', 540, 320, eob(seg(lt, 0.1, 0.35)), '#D644FF');
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'alarm', { gain: 0.5 }); }

  // S10 · Line 9: "as dream states bleed directly into waking reality"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'x-ray body: dream distortion pulsing purple and cyan', draw(lt, d, t, blit) {
      reset(); const p = 0.5 + 0.5 * Math.sin(lt * 6);
      xmat.uniforms.uCol.value.copy(new THREE.Color('#9B4FE8')).lerp(CYAN, p);
      xh.pose({ head: [6, 10 * Math.sin(lt * 2), 0], spine: [0, 0, Math.sin(lt * 4) * 2], lid: -0.2 });
      cam.position.copy(lerpV(V3(0.4, 1.6, 1.6), V3(0.15, 1.55, 1.1), eio(lt / d)));
      cam.lookAt(0, 1.45, 0); E.render(X.scene, cam, { ...XLOOK, bloom: 0.85, focus: cam.position.distanceTo(V3(0, 1.45, 0)) }); blit();
      pill('DREAM BLEED', 540, 320, eob(seg(lt, 0.15, 0.4)), '#B37CF2');
    } });
    cue(st, 'whoosh'); }

  // S11 · Line 10: "And by day seven, your immune system crashes"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'inside vessel: white blood cells halted, critical warning', draw(lt, d, t, blit) {
      VS.update(t, -lt * 0.4, 0.8, 0.8);
      cam.position.set(0, 0, -lt * 0.4); cam.lookAt(0.1, -0.05, -lt * 0.4 - 5);
      E.render(VS.scene, cam, VLOOK); blit();
      pill('IMMUNE DEFENSE: 10%', 540, 320, eob(seg(lt, 0.1, 0.35)), '#FF2222');
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'thud', { gain: 0.6 }); }

  // S12 · Line 11: "and your body simply collapses from exhaustion"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'real world: head drops, eyes close, blackout', draw(lt, d, t, blit) {
      reset(); const k = eio(clamp(lt / (d * 0.75)));
      hero.pose({ head: [18 * k, 0, 4 * k], spine: [10 * k, 0, 0], lid: lerp(0.3, 1.0, k) });
      cam.position.copy(lerpV(V3(0.3, 1.7, 0.35), V3(0.18, 1.58, 0.05), eio(lt / d)));
      cam.lookAt(V3(0.1, 1.6 - 0.1 * k, -0.6)); kitchenRender(0.7); blit();
      blackout(seg(lt, d * 0.6, d));
    } });
    cue(st + 0.3, 'slide', { dur: 1.5, gain: 0.5 }); }

  return { shots: S, cues: CUES };
}
