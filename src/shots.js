// THE BANK ROBBER WHO WORE LEMON JUICE: the shot list (Tall Tale 3D)
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

// Custom lemon & camera props
PROPS.lemon = (g, x, y) => {
  g.fillStyle = '#FFE135'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.ellipse(x, y - 40, 36, 26, 0.2, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#8AC926'; g.beginPath(); g.ellipse(x + 28, y - 56, 12, 6, 0.4, 0, 7); g.fill();
};
PROPS.polaroid = (g, x, y) => {
  g.fillStyle = '#EAE6DF'; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(x - 45, y - 75, 90, 80, 8); g.fill(); g.stroke();
  g.fillStyle = '#222'; g.beginPath(); g.arc(x, y - 38, 24, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#4ECDC4'; g.beginPath(); g.arc(x, y - 38, 12, 0, 7); g.fill();
};
PROPS.photo = (g, x, y) => {
  g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.roundRect(x - 40, y - 80, 80, 100, 4); g.fill(); g.stroke();
  g.fillStyle = '#F0EFEA'; g.fillRect(x - 32, y - 72, 64, 64);
};

// Character definitions
const LOOK = {
  robber: { body: '#F2C230', pattern: 'plain', hat: 'cap', hatCol: '#3C6FB6', extra: ['mustache'] },
  teller: { body: '#7FC8E8', hat: 'bun', hatCol: '#7A4A2E', pattern: 'apron', patCol: '#FFF4E0', extra: ['glasses', 'blush'] },
  cop: { body: '#2E4E8A', hat: 'mailcap', hatCol: '#1E3E7A', neck: 'tie', neckCol: '#D8343F' },
  prof: { body: '#A3B899', pattern: 'vest', patCol: '#3E5F38', hat: 'none', extra: ['glasses', 'mustache'] },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = {
    street: { bloom: 0.18, aperture: 0.0012, maxblur: 0.008 },
    room: { bloom: 0.25, aperture: 0.001, maxblur: 0.008 },
    field: { bloom: 0.2, aperture: 0.001, maxblur: 0.007 }
  };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };

  // ── SET 1: Street with Bank ─────────────────────────────────────────────
  const SHOP_ORDER = [
    ['BAKERY', '#C9603F', 'brick', '#D8343F'], ['PHARMACY', '#5FA39A', 'wood', '#D8343F'],
    ['FIRST BANK', '#C7B79A', 'brick', '#2E4E8A'], ['CAFE', '#E58A6A', 'wood', '#2E4E3F']
  ];
  const ST = WD.mainStreet(E, { shops: SHOP_ORDER });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const BANK_BLD = ST.buildings.find((b) => b.name === 'FIRST BANK') || ST.buildings[2];
  const stRobber = person('robber'), stCop = person('cop');
  [stRobber, stCop].forEach((p) => ST.scene.add(p.group));

  // ── SET 2: Bank Interior ────────────────────────────────────────────────
  const IN = WD.interior(E, { wall: '#3E5FA8', motif: '#2E4E8A', ceiling: '#4A3A2A', signText: 'PITTSBURGH BANK', picture: false });
  const inRobber = person('robber'), inTeller = person('teller');
  inTeller.at(3.55, 0, -2.5); inRobber.at(1.4, 0, -2.1);
  [inRobber, inTeller].forEach((p) => IN.scene.add(p.group));

  // ── SET 3: Kitchen / Room ──────────────────────────────────────────────
  const RM = WD.interior(E, { wall: '#F2EDE0', motif: '#E8DFD0', ceiling: '#3A2E22', signText: 'HOME SWEET HOME', picture: false });
  const rmRobber = person('robber'), rmCop = person('cop'), rmProf = person('prof');
  [rmRobber, rmCop, rmProf].forEach((p) => RM.scene.add(p.group));

  // S01: Line 0: "In 1995, a man named McArthur Wheeler robbed two banks in broad daylight"
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'street outside bank: robber struts happily', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stRobber.at(-4.5, 0.18, BANK_BLD.z + 1.2);
      stRobber.set({ mood: 'smug', legs: 'walk', phase: lt * 5, armL: [20, 20], armR: [-20, 10], talk: talk(t) });
      stCop.group.visible = false;
      shoot(ST.scene, [stRobber], V3(-1.8, 2.2, BANK_BLD.z + 5.5), V3(-3.2, 1.9, BANK_BLD.z + 3.8), V3(-4.5, 1.4, BANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "without wearing a mask."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'close-up on bare smiling face', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stRobber.set({ mood: 'proud', blink: blink(t), armL: [10, 10], armR: [10, 10], talk: talk(t) });
      shoot(ST.scene, [stRobber], V3(-3.6, 1.78, BANK_BLD.z + 2.8), V3(-4.1, 1.72, BANK_BLD.z + 2.0), V3(-4.5, 1.68, BANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'pop'); }

  // S03: Line 2: "In fact, he smiled straight into the security cameras."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'bank interior: robber waves and smiles up at security camera', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inRobber.set({ mood: 'laugh', armR: [140, 20], look: [0.2, -0.6], talk: talk(t) });
      inTeller.set({ mood: 'shock', armL: [40, 40], armR: [40, 40], sweat: 1 });
      shoot(IN.scene, [inRobber, inTeller], V3(0.2, 1.5, 0.5), V3(0.5, 1.65, -0.5), V3(1.4, 1.5, -2.1), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.6 }); }

  // S04: Line 3: "See, McArthur knew that lemon juice can be used as invisible ink."
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'kitchen: robber holding lemon, explaining the secret', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      rmRobber.at(0, 0, -2.0);
      rmRobber.set({ mood: 'sly', holdL: PROPS.lemon, armR: [40, 30], talk: talk(t), blink: blink(t) });
      rmCop.group.visible = false; rmProf.group.visible = false;
      shoot(RM.scene, [rmRobber], V3(-1.4, 1.6, 0.4), V3(-0.6, 1.5, -0.4), V3(0, 1.3, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop'); }

  // S05: Line 4: "So he figured, if lemon juice makes ink invisible,"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'robber thinking deeply with big cartoon lightbulb idea', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      rmRobber.set({ mood: 'smug', armR: [100, 40], holdL: PROPS.lemon, talk: talk(t) });
      shoot(RM.scene, [rmRobber], V3(-0.5, 1.6, -0.6), V3(-0.1, 1.55, -1.0), V3(0, 1.45, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.4 }); }

  // S06: Line 5: "rubbing it all over his face would make HIM invisible to cameras."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'robber squeezing lemon directly on face, squinting', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      rmRobber.set({ mood: 'worried', armL: [120, 50], armR: [120, 50], holdR: PROPS.lemon, sweat: 0.8, talk: talk(t) });
      shoot(RM.scene, [rmRobber], V3(-0.3, 1.6, -0.9), V3(0.1, 1.55, -1.2), V3(0, 1.4, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'plop', { gain: 0.6 }); }

  // S07: Line 6: "He even tested it with a Polaroid camera first."
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'robber holding polaroid camera up to take a selfie', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      rmRobber.set({ mood: 'smug', armL: [90, 40], armR: [90, 40], holdR: PROPS.polaroid, talk: talk(t) });
      shoot(RM.scene, [rmRobber], V3(-0.8, 1.5, -0.4), V3(-0.4, 1.5, -0.8), V3(0, 1.35, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'click'); }

  // S08: Line 7: "He snapped a photo, but accidentally aimed at the ceiling,"
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'flash! camera tilts up to the ceiling', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      rmRobber.set({ mood: 'happy', armL: [130, 40], armR: [130, 40], holdR: PROPS.polaroid, lean: -8 });
      shoot(RM.scene, [rmRobber], V3(-0.4, 1.3, -1.0), V3(-0.2, 1.9, -1.1), V3(0, 2.5, -2.0), null, k, LOOKS.room);
      blit();
      const flash = seg(lt, 0.1, 0.35);
      if (flash > 0 && flash < 1) { ctx.fillStyle = `rgba(255,255,255,${(1 - flash) * 0.7})`; ctx.fillRect(0, 0, 1080, 1920); }
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'stamp', { gain: 0.8 }); }

  // S09: Line 8: "saw nothing on the film, and said: It works!"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'looking at completely blank photo, laughing with triumph', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      rmRobber.set({ mood: 'laugh', armL: [50, 40], armR: [60, 40], holdR: PROPS.photo, talk: talk(t) });
      shoot(RM.scene, [rmRobber], V3(-0.6, 1.6, -0.8), V3(-0.2, 1.5, -1.1), V3(0, 1.35, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'ding', { gain: 0.5 }); }

  // S10: Line 9: "An hour later, police arrested him at his house."
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'police officer arrests robber at door', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      rmCop.group.visible = true;
      rmCop.at(1.1, 0, -2.0);
      rmCop.set({ mood: 'neutral', armL: [40, 20], armR: [40, 20] });
      rmRobber.set({ mood: 'shock', armL: [20, 20], armR: [20, 20], sweat: 1 });
      shoot(RM.scene, [rmRobber, rmCop], V3(-0.2, 1.6, 0.2), V3(0.3, 1.5, -0.6), V3(0.6, 1.3, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'thud', { gain: 0.6 }); }

  // S11: Line 10: "He was genuinely shocked, crying out: But I wore the juice!"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'extreme close-up on shocked robber crying in disbelief', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      rmRobber.set({ mood: 'shock', sweat: 1.5, tears: 1, armL: [120, 50], armR: [120, 50], talk: talk(t) });
      shoot(RM.scene, [rmRobber], V3(-0.2, 1.65, -1.1), V3(0, 1.6, -1.4), V3(0, 1.55, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'alarm', { gain: 0.5 }); }

  // S12: Line 11: "This true story inspired scientists to discover the Dunning-Kruger effect:"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'professor at blackboard explaining Dunning-Kruger', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      rmProf.group.visible = true; rmProf.at(0, 0, -2.0);
      rmProf.set({ mood: 'smug', armR: [80, 40], holdR: PROPS.book('SCIENCE', 1), talk: talk(t) });
      rmRobber.group.visible = false; rmCop.group.visible = false;
      shoot(RM.scene, [rmProf], V3(-1.0, 1.6, -0.2), V3(-0.4, 1.5, -0.8), V3(0, 1.35, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S13: Line 12: "the less you know, the more confident you are."
  { const st = cut(12);
    add({ id: 'S13', at: st, note: 'robber stands smiling next to professor, full cartoon comedy loop', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      rmRobber.group.visible = true; rmRobber.at(-1.0, 0, -2.0);
      rmRobber.set({ mood: 'laugh', armL: [80, 30], armR: [-20, 10], holdL: PROPS.lemon, talk: talk(t) });
      rmProf.at(0.8, 0, -2.0);
      rmProf.set({ mood: 'sly', armL: [20, 20], armR: [20, 20] });
      shoot(RM.scene, [rmRobber, rmProf], V3(-0.8, 1.5, -0.3), V3(-0.2, 1.5, -0.7), V3(-0.1, 1.3, -2.0), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.5 }); }

  return { shots: S, cues: CUES };
}
