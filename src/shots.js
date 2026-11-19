// THE DANCING PLAGUE OF 1518: the shot list (Tall Tale 3D)
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS, INK } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);

// Custom Props
PROPS.violin = (g, x, y) => {
  g.fillStyle = '#C9603F'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath();
  g.ellipse(x - 20, y - 35, 14, 20, 0, 0, 7);
  g.ellipse(x - 20, y - 15, 18, 22, 0, 0, 7);
  g.fill(); g.stroke();
  g.fillStyle = '#222'; g.fillRect(x - 23, y - 65, 6, 25);
  // bow
  g.strokeStyle = '#D8C08A'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x - 45, y - 40); g.lineTo(x + 10, y - 10); g.stroke();
};

PROPS.prescription = (g, x, y) => {
  g.fillStyle = '#F5F0D8'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(x - 25, y - 65, 52, 65, 4); g.fill(); g.stroke();
  g.fillStyle = '#8B0000'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center';
  g.fillText('CURE:', x + 1, y - 45);
  g.fillStyle = '#111'; g.font = 'bold 11px sans-serif';
  g.fillText('DANCE', x + 1, y - 30);
  g.fillText('MORE!', x + 1, y - 15);
};

// Character definitions
const LOOK = {
  troffea: { body: '#9E4A3A', pattern: 'apron', patCol: '#FFF4E0', hat: 'bun', hatCol: '#7A4A2E' },
  dancer1: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'cap', hatCol: '#2E4E8A' },
  dancer2: { body: '#B98ACF', hat: 'bonnet', hatCol: '#E8C77A' },
  doctor: { body: '#2A2638', pattern: 'vest', patCol: '#1E1B28', hat: 'tophat', hatCol: '#1E1B28', neck: 'collar', extra: ['glasses', 'mustache'] },
  mayor: { body: '#3E5FA8', pattern: 'vest', patCol: '#E2B33C', hat: 'boater', hatCol: '#E2B33C', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache'] },
  musician: { body: '#E2B33C', pattern: 'plain', hat: 'beanie', hatCol: '#9E4A3A', neck: 'scarf', neckCol: '#3E5FA8' },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = {
    street: { bloom: 0.18, aperture: 0.0012, maxblur: 0.008 },
    room: { bloom: 0.22, aperture: 0.001, maxblur: 0.008 }
  };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };

  // ── SET 1: Medieval Strasbourg Cobblestone Street / Square ─────────────
  const SHOP_ORDER = [
    ['STRASBOURG 1518', '#8B4513', 'brick', null], ['TOWN HALL', '#C7B79A', 'brick', '#2E4E8A'],
    ['APOTHECARY', '#5FA39A', 'wood', '#D8343F'], ['GUILD HALL', '#E58A6A', 'wood', '#2E4E3F']
  ];
  const ST = WD.mainStreet(E, { shops: SHOP_ORDER });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const HALL = ST.buildings[0];

  const stTroffea = person('troffea'), stDancer1 = person('dancer1'), stDancer2 = person('dancer2');
  const stDoctor = person('doctor'), stMayor = person('mayor'), stMusician = person('musician');
  const streetCast = [stTroffea, stDancer1, stDancer2, stDoctor, stMayor, stMusician];
  streetCast.forEach((p) => ST.scene.add(p.group));

  const showOnly = (...visiblePeople) => {
    streetCast.forEach((p) => { p.group.visible = visiblePeople.includes(p); });
  };

  // ── SET 2: Medieval Town Council / Doctor Study ─────────────────────────
  const IN = WD.interior(E, { wall: '#3E2A1D', motif: '#5A3E2B', ceiling: '#2A1B10', signText: 'COUNCIL OF STRASBOURG', picture: false });
  const inDoctor = person('doctor'), inMayor = person('mayor');
  inDoctor.at(1.5, 0, -2.5); inMayor.at(3.5, 0, -2.4);
  [inDoctor, inMayor].forEach((p) => IN.scene.add(p.group));

  // S01: Line 0: "In 1518, an entire city caught a sickness that made them dance until they collapsed."
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'Strasbourg square: Frau Troffea and citizens dancing frantically on cobblestones', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea, stDancer1, stDancer2);
      stTroffea.at(-4.5, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'shock', legs: 'jump', phase: t * 16, armL: [130 + Math.sin(t * 12) * 30, 20], armR: [130 + Math.cos(t * 12) * 30, 20], sweat: 1.0, talk: talk(t) });
      stDancer1.at(-3.5, 0.18, HALL.z + 2.0);
      stDancer1.set({ mood: 'shock', legs: 'walk', phase: t * 14, armL: [110, 20], armR: [110, 20], sweat: 0.8 });
      stDancer2.at(-5.5, 0.18, HALL.z + 0.8);
      stDancer2.set({ mood: 'worried', legs: 'jump', phase: t * 18, armL: [90, 40], armR: [90, 40], sweat: 0.8 });
      shoot(ST.scene, [stTroffea, stDancer1, stDancer2], V3(-1.8, 2.5, HALL.z + 5.5), V3(-2.8, 2.0, HALL.z + 3.8), V3(-4.5, 1.4, HALL.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "It started when one woman stepped into the street and began dancing uncontrollably."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'close-up Frau Troffea: horrified expression, feet kicking against her will', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      showOnly(stTroffea);
      stTroffea.at(-4.5, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'shock', legs: 'walk', phase: t * 20, armL: [120, 40], armR: [120, 40], sweat: 1.0, talk: talk(t) });
      shoot(ST.scene, [stTroffea], V3(-2.5, 1.9, HALL.z + 3.6), V3(-3.2, 1.7, HALL.z + 2.6), V3(-4.5, 1.4, HALL.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'boing', { gain: 0.6 }); }

  // S03: Line 2: "She couldn't stop."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'punch in: frantic foot spinning, desperate lean', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea);
      stTroffea.at(-4.5, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'worried', legs: 'run', phase: t * 24, armL: [140, 20], armR: [80, 50], lean: 15, sweat: 1.0 });
      shoot(ST.scene, [stTroffea], V3(-2.8, 1.7, HALL.z + 2.8), V3(-3.4, 1.5, HALL.z + 2.2), V3(-4.5, 1.3, HALL.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'zip', { gain: 0.6 }); }

  // S04: Line 3: "Within thirty days, over four hundred citizens joined her, dancing frantically day and night."
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'wide street: massive dancing crowd jumping in wild frenzy', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea, stDancer1, stDancer2);
      stTroffea.at(-4.5, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'shock', legs: 'jump', phase: t * 18, armL: [130, 20], armR: [130, 20] });
      stDancer1.at(-3.4, 0.18, HALL.z + 1.8); stDancer1.set({ mood: 'laugh', legs: 'jump', phase: t * 16, armL: [100, 30], armR: [100, 30] });
      stDancer2.at(-5.4, 0.18, HALL.z + 0.6); stDancer2.set({ mood: 'shock', legs: 'walk', phase: t * 22, armL: [110, 40], armR: [110, 40] });
      shoot(ST.scene, [stTroffea, stDancer1, stDancer2], V3(-1.4, 3.2, HALL.z + 5.5), V3(-2.2, 2.5, HALL.z + 4.2), V3(-4.2, 1.4, HALL.z + 1.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'boing', { gain: 0.7 }); }

  // S05: Line 4: "Terrified local doctors concluded that the only cure was... even more dancing!"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'Doctor holds prescription scroll "CURE: DANCE MORE!", Mayor dumbfounded', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inDoctor.set({ mood: 'proud', holdR: PROPS.prescription, armL: [50, 20], talk: talk(t) });
      inMayor.set({ mood: 'shock', armL: [80, 40], armR: [80, 40], sweat: 1.0 });
      shoot(IN.scene, [inDoctor, inMayor], V3(2.5, 1.8, 1.5), V3(2.5, 1.7, 0.5), V3(2.5, 1.4, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); }

  // S06: Line 5: "So the city council built wooden stages, hired professional musicians, and ordered them to play non-stop."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'Mayor commands musician playing violin frantically on wooden platform', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stMayor, stMusician);
      stMayor.at(-4.8, 0.18, HALL.z + 1.5);
      stMayor.set({ mood: 'proud', armR: [140, 20], armL: [60, 30], talk: talk(t) });
      stMusician.at(-4.0, 0.18, HALL.z + 0.8);
      stMusician.set({ mood: 'happy', holdR: PROPS.violin, armL: [40, 20], legs: 'walk', phase: t * 10 });
      shoot(ST.scene, [stMayor, stMusician], V3(-1.6, 2.2, HALL.z + 4.5), V3(-2.2, 1.9, HALL.z + 3.2), V3(-4.3, 1.4, HALL.z + 1.1), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.6 }); }

  // S07: Line 6: "This backfired completely, causing hundreds more people to join the feverish dance party!"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'Wild medieval rave! Everyone jumping and dancing in sync to the violin', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea, stDancer1, stDancer2, stMusician);
      stTroffea.at(-4.5, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'laugh', legs: 'jump', phase: t * 20, armL: [130, 20], armR: [130, 20] });
      stDancer1.at(-3.5, 0.18, HALL.z + 1.8);
      stDancer1.set({ mood: 'laugh', legs: 'jump', phase: t * 18, armL: [120, 30], armR: [120, 30] });
      stDancer2.at(-5.4, 0.18, HALL.z + 0.6);
      stDancer2.set({ mood: 'laugh', legs: 'jump', phase: t * 22, armL: [140, 20], armR: [140, 20] });
      stMusician.at(-4.2, 0.18, HALL.z + 2.5);
      stMusician.set({ mood: 'laugh', holdR: PROPS.violin, armL: [50, 20], legs: 'jump', phase: t * 15 });
      shoot(ST.scene, [stTroffea, stDancer1, stDancer2, stMusician], V3(-1.4, 2.8, HALL.z + 5.2), V3(-2.2, 2.2, HALL.z + 3.8), V3(-4.2, 1.4, HALL.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.8 }); cue(st + 0.25, 'pop', { gain: 0.9 }); }

  // S08: Line 7: "Dancers had bloody feet and pure exhaustion, yet their bodies kept moving for weeks,"
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'close-up dancers: completely exhausted and dripping sweat, legs still stepping', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea, stDancer1);
      stTroffea.at(-4.4, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'tired', legs: 'walk', phase: t * 8, armL: [30, 10], armR: [30, 10], sweat: 1.0, bob: 12 });
      stDancer1.at(-3.6, 0.18, HALL.z + 1.5);
      stDancer1.set({ mood: 'tired', legs: 'walk', phase: t * 7, armL: [20, 10], armR: [20, 10], sweat: 1.0, bob: 14 });
      shoot(ST.scene, [stTroffea, stDancer1], V3(-2.0, 1.8, HALL.z + 3.5), V3(-2.6, 1.6, HALL.z + 2.6), V3(-4.0, 1.35, HALL.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.4, 'slide', { dur: 1.2, gain: 0.5 }); }

  // S09: Line 8: "before the mysterious trance suddenly vanished as strangely as it began,"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'sudden stillness: dancers freeze and collapse onto cobblestones in confusion', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      showOnly(stTroffea, stDancer1);
      stTroffea.at(-4.4, 0.18, HALL.z + 1.2);
      stTroffea.set({ mood: 'neutral', legs: 'sit', blink: blink(t), armL: [20, 10], armR: [20, 10], sweat: 0 });
      stDancer1.at(-3.6, 0.18, HALL.z + 0.8);
      stDancer1.set({ mood: 'neutral', legs: 'sit', blink: blink(t, 1), armL: [20, 10], armR: [20, 10], sweat: 0 });
      shoot(ST.scene, [stTroffea, stDancer1], V3(-1.8, 1.8, HALL.z + 3.5), V3(-2.4, 1.6, HALL.z + 2.5), V3(-4.0, 1.0, HALL.z + 1.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop', { gain: 0.6 }); }

  // S10: Line 9: "leaving historians still baffled five hundred years later!"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'Doctor / Historian shrugging in bewilderment with question marks', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inDoctor.group.visible = true; inMayor.group.visible = false;
      inDoctor.at(2.5, 0, -2.5);
      inDoctor.set({ mood: 'smug', armL: [75, -50], armR: [75, -50], talk: talk(t), blink: blink(t) });
      shoot(IN.scene, [inDoctor], V3(2.5, 1.8, 1.0), V3(2.5, 1.6, 0.0), V3(2.5, 1.45, -2.5), null, k, LOOKS.room);
      blit();
      // Draw 2D question marks
      ctx.save();
      ctx.fillStyle = '#E2B33C';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      const bobY = Math.sin(t * 6) * 10;
      ctx.strokeText('?', 400, 350 + bobY);
      ctx.fillText('?', 400, 350 + bobY);
      ctx.strokeText('?', 680, 330 - bobY);
      ctx.fillText('?', 680, 330 - bobY);
      ctx.restore();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); cue(st + 0.5, 'sparkle', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
