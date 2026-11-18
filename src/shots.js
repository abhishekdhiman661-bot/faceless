// THE PFEILSTORCH MYSTERY: the shot list (Tall Tale 3D)
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
PROPS.spear = (g, x, y) => {
  g.fillStyle = '#8B4513'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.rect(x - 60, y - 48, 120, 10); g.fill(); g.stroke();
  g.fillStyle = '#A9A9A9'; // iron spearhead
  g.beginPath(); g.moveTo(x + 60, y - 55); g.lineTo(x + 85, y - 43); g.lineTo(x + 60, y - 31); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#D2B48C'; // feather binding
  g.fillRect(x - 55, y - 49, 15, 12);
};

PROPS.magnifier = (g, x, y) => {
  g.fillStyle = '#E2B33C'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y - 50, 20, 0, 7); g.stroke();
  g.fillStyle = 'rgba(200, 230, 255, 0.6)'; g.fill();
  g.fillStyle = '#654321'; g.fillRect(x - 4, y - 30, 8, 25);
};

PROPS.mouse = (g, x, y) => {
  g.fillStyle = '#808080'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.ellipse(x, y - 35, 22, 14, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.arc(x - 12, y - 48, 8, 0, 7); g.fill(); g.stroke(); // ear
  g.beginPath(); g.arc(x + 12, y - 48, 8, 0, 7); g.fill(); g.stroke(); // ear
  g.beginPath(); g.arc(x, y - 35, 3, 0, 7); g.fillStyle = '#000'; g.fill(); // nose
};

// Character definitions
const LOOK = {
  prof: { body: '#4A4560', pattern: 'vest', patCol: '#2A2638', hat: 'tophat', hatCol: '#2A2638', neck: 'bowtie', neckCol: '#D8343F', extra: ['monocle', 'mustache'] },
  villager: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'cap', hatCol: '#2E4E3F', extra: ['mustache'] },
  stork: { body: '#F5F5F5', head: '#FFFFFF', pattern: 'plain', hat: 'none' },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = {
    field: { bloom: 0.18, aperture: 0.0012, maxblur: 0.008 },
    room: { bloom: 0.22, aperture: 0.001, maxblur: 0.008 }
  };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };

  // ── SET 1: German Village Meadow & Town ─────────────────────────────────
  const MD = WD.meadow(E, { fenceOn: true, treesOn: true });
  MD.sun.key.position.set(9, 14, 8); MD.sun.key.target.position.set(0, 0, -6);
  const cottage = PR.house({ wall: '#F2EDE0', roof: '#B5553C', door: '#3C6FB6' });
  cottage.position.set(-6, 0, -10); MD.scene.add(cottage);

  const stProf = person('prof'), stVillager = person('villager'), stStork = person('stork', { height: 1.7 });
  [stProf, stVillager, stStork].forEach((p) => MD.scene.add(p.group));

  // ── SET 2: German University Museum / Study ─────────────────────────────
  const IN = WD.interior(E, { wall: '#3E5FA8', motif: '#2E4E8A', ceiling: '#2A1E14', signText: 'ROSTOCK UNIVERSITY', picture: false });
  const inProf = person('prof'), inStork = person('stork', { height: 1.7 });
  inProf.at(1.5, 0, -2.5); inStork.at(3.5, 0, -2.4);
  [inProf, inStork].forEach((p) => IN.scene.add(p.group));

  // S01: Line 0: "Until 1822, Europeans had no idea where birds went in the winter."
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'German professor looking at empty winter sky with confusion', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stProf.at(0, 0, -3.5);
      stProf.set({ mood: 'worried', armL: [100, 30], armR: [40, 20], talk: talk(t) });
      [stVillager, stStork].forEach((p) => (p.group.visible = false));
      shoot(MD.scene, [stProf], V3(-0.5, 1.8, -1.0), V3(0, 1.6, -2.0), V3(0, 1.35, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "Famous scientists genuinely believed birds buried themselves in mud or turned into mice."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'professor holding a funny little mouse, explaining silly ancient theories', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stProf.at(0, 0, -3.0);
      stProf.set({ mood: 'smug', holdR: PROPS.mouse, armL: [30, 20], talk: talk(t), blink: blink(t) });
      shoot(MD.scene, [stProf], V3(0.5, 1.6, -1.0), V3(0.1, 1.55, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'boing', { gain: 0.6 }); }

  // S03: Line 2: "Then, one spring day in Germany..."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'bright sunny meadow, villager working in garden', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stProf.group.visible = false;
      stVillager.group.visible = true; stVillager.at(0, 0, -3.5);
      stVillager.set({ mood: 'happy', armL: [40, 20], armR: [40, 20], blink: blink(t) });
      shoot(MD.scene, [stVillager], V3(-0.6, 1.8, -1.2), V3(-0.2, 1.6, -2.0), V3(0, 1.35, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'ding', { gain: 0.5 }); }

  // S04: Line 3: "a white stork landed with a thirty-inch wooden spear pierced straight through its neck."
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'white stork lands majestically with massive spear right through its neck', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stVillager.at(-1.8, 0, -3.8); stVillager.set({ mood: 'shock', armL: [130, 30], armR: [130, 30], sweat: 1.0 });
      stStork.group.visible = true; stStork.at(0.8, 0, -3.2);
      stStork.set({ mood: 'proud', holdR: PROPS.spear, armL: [20, 10] });
      shoot(MD.scene, [stVillager, stStork], V3(0, 1.8, -0.8), V3(0, 1.55, -1.8), V3(0, 1.35, -3.4), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); cue(st + 0.4, 'boing', { gain: 0.7 }); }

  // S05: Line 4: "The bird was completely fine, strutting around like nothing happened."
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'close-up on stork strutting proudly with spear, casually pecking ground', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stVillager.group.visible = false;
      stStork.at(0, 0, -3.0);
      stStork.set({ mood: 'laugh', legs: 'walk', phase: t * 5, holdR: PROPS.spear, talk: talk(t) });
      shoot(MD.scene, [stStork], V3(-0.5, 1.6, -1.0), V3(-0.1, 1.5, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'ding', { gain: 0.6 }); }

  // S06: Line 5: "When scientists inspected the weapon, they discovered it was carved from African wood"
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'professor examining the wooden spear through magnifying glass', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stStork.group.visible = false;
      stProf.group.visible = true; stProf.at(0, 0, -3.0);
      stProf.set({ mood: 'shock', holdL: PROPS.magnifier, holdR: PROPS.spear, talk: talk(t) });
      shoot(MD.scene, [stProf], V3(0.5, 1.65, -1.0), V3(0.1, 1.55, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.7 }); }

  // S07: Line 6: "and used exclusively by hunters in Central Africa."
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'close-up on intricate African spear design', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stProf.set({ mood: 'proud', holdR: PROPS.spear, armL: [40, 20], talk: talk(t) });
      shoot(MD.scene, [stProf], V3(-0.4, 1.6, -1.2), V3(-0.1, 1.5, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'pop'); }

  // S08: Line 7: "That meant this single stubborn bird had flown over three thousand miles"
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'stork flying high in the sky across thousands of miles', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stProf.group.visible = false;
      stStork.group.visible = true; stStork.at(0, 1.5 + Math.sin(t * 8) * 0.1, -4.0);
      stStork.set({ mood: 'proud', armL: [120, 30], armR: [120, 30], holdR: PROPS.spear, talk: talk(t) });
      shoot(MD.scene, [stStork], V3(0, 2.2, -1.0), V3(0, 1.8, -2.2), V3(0, 1.5, -4.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.6 }); }

  // S09: Line 8: "across the Sahara Desert and Mediterranean Sea..."
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'stork soaring effortlessly over vast distances', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stStork.at(0, 1.6 + Math.sin(t * 8) * 0.1, -3.8);
      stStork.set({ mood: 'smug', armL: [130, 20], armR: [130, 20], holdR: PROPS.spear });
      shoot(MD.scene, [stStork], V3(-0.8, 2.0, -1.2), V3(-0.2, 1.8, -2.2), V3(0, 1.55, -3.8), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.5 }); }

  // S10: Line 9: "with a giant spear stuck all the way through its body!"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'close-up on the legendary spear in neck, stork winking at camera', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stStork.at(0, 0, -3.0);
      stStork.set({ mood: 'laugh', holdR: PROPS.spear, armL: [40, 20], talk: talk(t), blink: blink(t) });
      shoot(MD.scene, [stStork], V3(0.5, 1.6, -1.0), V3(0.1, 1.5, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'boing', { gain: 0.7 }); }

  // S11: Line 10: "It single-handedly solved the mystery of seasonal bird migration,"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'professors celebrating the scientific breakthrough', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stStork.group.visible = false;
      stProf.group.visible = true; stProf.at(0, 0, -3.0);
      stProf.set({ mood: 'laugh', armL: [140, 20], armR: [140, 20], talk: talk(t) });
      shoot(MD.scene, [stProf], V3(-0.5, 1.65, -1.0), V3(-0.1, 1.55, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); }

  // S12: Line 11: "and today, the famous Pfeilstorch is still preserved in a German museum!"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'university museum: the legendary Pfeilstorch displayed with pride', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inProf.set({ mood: 'proud', armL: [50, 30], armR: [50, 30], talk: talk(t) });
      inStork.set({ mood: 'proud', holdR: PROPS.spear });
      shoot(IN.scene, [inProf, inStork], V3(0.5, 1.65, -0.5), V3(0.8, 1.55, -1.2), V3(2.5, 1.45, -2.4), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.7 }); cue(st + 0.4, 'ding', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
