// THE 1904 OLYMPIC MARATHON: the shot list (Tall Tale 3D)
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
PROPS.apple = (g, x, y) => {
  g.fillStyle = '#7CA926'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y - 45, 18, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#654321'; g.fillRect(x - 2, y - 68, 4, 10); // stem
  g.fillStyle = '#5A3D28'; g.beginPath(); g.arc(x + 10, y - 48, 8, 0, 7); g.fill(); // rotten spot
};

PROPS.poison = (g, x, y) => {
  g.fillStyle = '#8A2BE2'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(x - 14, y - 60, 28, 42, 6); g.fill(); g.stroke();
  g.fillStyle = '#FFF'; g.fillRect(x - 6, y - 68, 12, 8); // cork
  g.fillStyle = '#000'; g.beginPath(); g.arc(x, y - 40, 5, 0, 7); g.fill(); // skull
};

PROPS.medal = (g, x, y) => {
  g.fillStyle = '#E2B33C'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y - 40, 16, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#D8343F'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(x - 12, y - 65); g.lineTo(x, y - 40); g.lineTo(x + 12, y - 65); g.stroke();
};

PROPS.car = (g, x, y) => {
  g.fillStyle = '#B22222'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.roundRect(x - 55, y - 55, 110, 45, 8); g.fill(); g.stroke();
  g.fillStyle = '#222'; g.beginPath(); g.arc(x - 35, y - 10, 16, 0, 7); g.arc(x + 35, y - 10, 16, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#FFE4B5'; g.fillRect(x - 15, y - 75, 45, 25);
};

// Character definitions
const LOOK = {
  lorz: { body: '#FFFFFF', pattern: 'stripes', patCol: '#3C6FB6', hat: 'cap', hatCol: '#D8343F' },
  hicks: { body: '#E58A6A', head: '#F0E0D0', hat: 'none' },
  carvajal: { body: '#8B4513', pattern: 'overalls', patCol: '#2E4E3F', hat: 'boater', hatCol: '#D2B48C', extra: ['mustache'] },
  runner4: { body: '#A0522D', pattern: 'plain', hat: 'none' },
  official: { body: '#2A2638', pattern: 'vest', patCol: '#9E4A3A', hat: 'tophat', hatCol: '#1E1B28', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache'] },
  trainer: { body: '#4FB3A9', pattern: 'plain', hat: 'cap', hatCol: '#2F8F5B', neck: 'collar' },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = {
    field: { bloom: 0.18, aperture: 0.0012, maxblur: 0.008 },
    street: { bloom: 0.22, aperture: 0.001, maxblur: 0.008 }
  };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };

  // ── SET 1: Dusty Dirt Road / Marathon Course ───────────────────────────
  const MD = WD.meadow(E, { fenceOn: true, treesOn: true });
  MD.sun.key.position.set(9, 14, 8); MD.sun.key.target.position.set(0, 0, -6);
  const stadium = PR.house({ wall: '#C7B79A', roof: '#8B4513', door: '#2E4E8A' });
  stadium.position.set(0, 0, -12); MD.scene.add(stadium);

  const stLorz = person('lorz'), stHicks = person('hicks'), stCarvajal = person('carvajal'), stRunner4 = person('runner4');
  const stOfficial = person('official'), stTrainer = person('trainer');
  [stLorz, stHicks, stCarvajal, stRunner4, stOfficial, stTrainer].forEach((p) => MD.scene.add(p.group));

  // S01: Line 0: "The 1904 Olympic marathon was the most chaotic sporting event in human history."
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'marathon start line: crowd of bizarre runners, dust clouds', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stLorz.at(-2.5, 0, -4.5); stHicks.at(-0.8, 0, -4.8); stCarvajal.at(1.0, 0, -4.6); stRunner4.at(2.5, 0, -4.7);
      [stLorz, stHicks, stCarvajal, stRunner4].forEach((p, i) => {
        p.group.visible = true; p.set({ mood: 'proud', legs: 'walk', phase: t * 6 + i, blink: blink(t, i) });
      });
      stOfficial.group.visible = false; stTrainer.group.visible = false;
      shoot(MD.scene, [stLorz, stHicks, stCarvajal, stRunner4], V3(0, 2.2, -0.5), V3(0, 1.8, -1.8), V3(0, 1.3, -4.6), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "Out of thirty-two runners, only fourteen finished alive."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'exhausted runners collapsing on the dusty course', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stHicks.at(0, 0, -3.5); stHicks.set({ mood: 'tired', legs: 'sit', armL: [10, 10], armR: [10, 10], sweat: 1.0, talk: talk(t) });
      [stLorz, stCarvajal, stRunner4].forEach((p) => (p.group.visible = false));
      shoot(MD.scene, [stHicks], V3(0.5, 1.6, -1.0), V3(0.1, 1.5, -1.8), V3(0, 1.2, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.6 }); }

  // S03: Line 2: "The temperature was ninety degrees, on dirt roads covered in choking dust."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'runners trudging through scorching sun and dust', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCarvajal.group.visible = true; stCarvajal.at(-1.2, 0, -4.0);
      stCarvajal.set({ mood: 'worried', legs: 'walk', phase: t * 4, armL: [30, 20], armR: [30, 20], sweat: 0.9, talk: talk(t) });
      stHicks.group.visible = true; stHicks.at(1.2, 0, -4.2);
      stHicks.set({ mood: 'tired', legs: 'walk', phase: t * 3, sweat: 1.0 });
      shoot(MD.scene, [stCarvajal, stHicks], V3(-0.2, 1.8, -1.2), V3(-0.4, 1.6, -2.2), V3(0, 1.35, -4.1), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.5 }); }

  // S04: Line 3: "The guy who crossed the finish line first?"
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'close-up on Fred Lorz grinning slyly with hands on hips', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stLorz.group.visible = true; stLorz.at(0, 0, -3.0);
      stLorz.set({ mood: 'smug', armL: [40, 20], armR: [40, 20], talk: talk(t), blink: blink(t) });
      [stHicks, stCarvajal].forEach((p) => (p.group.visible = false));
      shoot(MD.scene, [stLorz], V3(0.4, 1.6, -1.0), V3(0.1, 1.55, -1.8), V3(0, 1.45, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'ding', { gain: 0.6 }); }

  // S05: Line 4: "He quit at mile nine, hitched an eleven-mile ride in a car, and trotted across the line as a joke."
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'Lorz riding in antique automobile, waving like royalty to spectators', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stLorz.at(-0.5, 0.4, -4.0);
      stLorz.set({ mood: 'laugh', holdR: PROPS.car, armL: [140, 20], talk: talk(t) });
      shoot(MD.scene, [stLorz], V3(-0.5, 1.8, -1.2), V3(0.5, 1.65, -2.0), V3(0, 1.4, -4.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); cue(st + 0.4, 'chug', { gain: 0.6 }); }

  // S06: Line 5: "The actual gold medalist was fed raw rat poison and brandy by his trainers,"
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'trainer feeding dizzy runner strange vial of rat poison and brandy', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stLorz.group.visible = false;
      stHicks.group.visible = true; stTrainer.group.visible = true;
      stHicks.at(-1.0, 0, -3.5); stHicks.set({ mood: 'dizzy', sweat: 1.0, armL: [10, 10], armR: [10, 10], talk: talk(t) });
      stTrainer.at(0.8, 0, -3.5); stTrainer.set({ mood: 'proud', holdL: PROPS.poison, armR: [40, 20] });
      shoot(MD.scene, [stHicks, stTrainer], V3(0, 1.8, -1.0), V3(0, 1.55, -2.0), V3(0, 1.35, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.5 }); }

  // S07: Line 6: "hallucinating wildly as two men dragged his limp legs across the finish."
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'Hicks being carried across the finish line with eyes rolling', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stHicks.at(-0.4, 0.3, -3.5); stHicks.set({ mood: 'dizzy', sweat: 1.0, armL: [80, 40], armR: [80, 40] });
      stTrainer.at(1.0, 0, -3.5); stTrainer.set({ mood: 'worried', armL: [100, 30] });
      shoot(MD.scene, [stHicks, stTrainer], V3(0.5, 1.7, -1.2), V3(0.1, 1.55, -2.0), V3(0, 1.4, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S08: Line 7: "A Cuban mailman showed up with no money, wearing heavy street boots and trousers."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'Felix Carvajal posing in street boots and cut-off trousers', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stHicks.group.visible = false; stTrainer.group.visible = false;
      stCarvajal.group.visible = true; stCarvajal.at(0, 0, -3.2);
      stCarvajal.set({ mood: 'happy', armL: [40, 20], armR: [40, 20], talk: talk(t), blink: blink(t) });
      shoot(MD.scene, [stCarvajal], V3(-0.6, 1.65, -1.0), V3(-0.2, 1.55, -1.8), V3(0, 1.4, -3.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'ding', { gain: 0.6 }); }

  // S09: Line 8: "He stopped at an orchard, ate rotten apples, took an hour-long nap on the grass,"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'Carvajal eating rotten apple under tree and sleeping peacefully', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCarvajal.at(0, 0, -3.5);
      stCarvajal.set({ mood: 'smug', legs: 'sit', holdR: PROPS.apple, talk: talk(t) });
      shoot(MD.scene, [stCarvajal], V3(0.6, 1.7, -1.0), V3(0.2, 1.55, -2.0), V3(0, 1.3, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.4 }); }

  // S10: Line 9: "and still finished in fourth place!"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'Carvajal jogs across finish line beaming, crowd stunned', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stCarvajal.at(0, 0, -3.0);
      stCarvajal.set({ mood: 'laugh', legs: 'walk', phase: t * 7, armR: [140, 20], talk: talk(t) });
      shoot(MD.scene, [stCarvajal], V3(-0.5, 1.6, -1.0), V3(-0.1, 1.5, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.7 }); }

  // S11: Line 10: "Another runner was chased an entire mile off-course by a pack of wild feral dogs."
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'Len Taunyane sprinting terrified through bushes escaping barking dogs', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCarvajal.group.visible = false;
      stRunner4.group.visible = true; stRunner4.at(-1.0 - k * 3.0, 0, -4.0);
      stRunner4.set({ mood: 'shock', legs: 'run', phase: t * 18, armL: [100, 30], armR: [100, 30], sweat: 1.0 });
      shoot(MD.scene, [stRunner4], V3(0, 2.2, -1.0), V3(-1.0, 1.8, -2.0), V3(-2.0, 1.3, -4.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); cue(st + 0.4, 'chug', { gain: 0.7 }); }

  // S12: Line 11: "Against all odds, he still finished ninth!"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'runner crossing finish line barefoot, out of breath but triumphant', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stRunner4.at(0, 0, -3.2);
      stRunner4.set({ mood: 'happy', legs: 'walk', phase: t * 5, armL: [30, 20], armR: [30, 20], talk: talk(t) });
      shoot(MD.scene, [stRunner4], V3(0.5, 1.6, -1.2), V3(0.1, 1.5, -1.8), V3(0, 1.4, -3.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.7 }); }

  // S13: Line 12: "Organizers were so horrified they nearly banned the marathon forever."
  { const st = cut(12);
    add({ id: 'S13', at: st, note: 'race official facepalming with medal in hand, runners laughing', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stRunner4.group.visible = false;
      stOfficial.group.visible = true; stOfficial.at(0, 0, -3.0);
      stOfficial.set({ mood: 'shock', holdR: PROPS.medal, armL: [120, 40], sweat: 1.0, talk: talk(t) });
      shoot(MD.scene, [stOfficial], V3(-0.4, 1.7, -1.0), V3(-0.1, 1.55, -1.8), V3(0, 1.4, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.8 }); cue(st + 0.4, 'ding', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
