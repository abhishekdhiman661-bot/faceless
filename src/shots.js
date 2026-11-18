// THE BOSTON MOLASSES FLOOD OF 1919: the shot list (Tall Tale 3D)
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
PROPS.molassesWave = (g, x, y) => {
  g.fillStyle = '#4A2A14'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath();
  g.moveTo(x - 80, y);
  g.quadraticCurveTo(x - 60, y - 90, x - 20, y - 70);
  g.quadraticCurveTo(x + 20, y - 110, x + 60, y - 80);
  g.quadraticCurveTo(x + 80, y - 50, x + 90, y);
  g.closePath();
  g.fill(); g.stroke();
  g.fillStyle = '#6A3E1E';
  g.beginPath(); g.arc(x - 25, y - 50, 16, 0, 7); g.arc(x + 35, y - 60, 20, 0, 7); g.fill();
};

PROPS.hose = (g, x, y) => {
  g.fillStyle = '#C0C0C0'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.rect(x - 10, y - 45, 45, 12); g.fill(); g.stroke();
  g.fillStyle = 'rgba(78, 205, 196, 0.7)'; // water spray
  g.beginPath();
  g.moveTo(x + 35, y - 39);
  g.lineTo(x + 85, y - 55);
  g.lineTo(x + 85, y - 23);
  g.closePath();
  g.fill();
};

// Character definitions
const LOOK = {
  citizen: { body: '#6FA3B8', pattern: 'overalls', patCol: '#3E5FA8', hat: 'cap', hatCol: '#2E4E8A' },
  cop: { body: '#2E4E8A', hat: 'mailcap', hatCol: '#1E3E7A', neck: 'tie', neckCol: '#D8343F', extra: ['mustache'] },
  fireman: { body: '#B5553C', pattern: 'plain', hat: 'visor', hatCol: '#8B0000', neck: 'collar' },
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

  // ── SET 1: Boston Harbor Commercial Street ──────────────────────────────
  const SHOP_ORDER = [
    ['PURITY DISTILLERY', '#8B4513', 'brick', '#2E4E8A'], ['BOSTON BAKERY', '#C9603F', 'brick', '#D8343F'],
    ['NORTH HARBOR', '#5FA39A', 'wood', '#3C6FB6'], ['FREIGHT DEPOT', '#C7B79A', 'brick', null]
  ];
  const ST = WD.mainStreet(E, { shops: SHOP_ORDER });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const TANK_BLD = ST.buildings[0];

  const stCitizen = person('citizen'), stCop = person('cop'), stFireman = person('fireman');
  [stCitizen, stCop, stFireman].forEach((p) => ST.scene.add(p.group));

  // S01: Line 0: "In 1919, Boston was hit by a disaster that sounds completely made up."
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'Boston North End: citizen walking calmly on cobblestone street', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCitizen.at(-4.5, 0.18, TANK_BLD.z + 1.2);
      stCitizen.set({ mood: 'happy', legs: 'walk', phase: lt * 5, armL: [20, 20], armR: [-20, 10], talk: talk(t) });
      stCop.group.visible = false; stFireman.group.visible = false;
      shoot(ST.scene, [stCitizen], V3(-1.8, 2.2, TANK_BLD.z + 5.5), V3(-3.2, 1.9, TANK_BLD.z + 3.8), V3(-4.5, 1.4, TANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "A giant steel tank holding over two million gallons of molasses suddenly exploded."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'huge explosion sound, rivets popping, citizen spins around in shock', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stCitizen.set({ mood: 'shock', armL: [130, 40], armR: [130, 40], sweat: 1.0, talk: talk(t) });
      shoot(ST.scene, [stCitizen], V3(-2.8, 2.0, TANK_BLD.z + 3.5), V3(-3.6, 1.8, TANK_BLD.z + 2.5), V3(-4.5, 1.4, TANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.8 }); cue(st + 0.2, 'pop', { gain: 1.0 }); }

  // S03: Line 2: "It unleashed a twenty-five-foot tidal wave of thick brown syrup"
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'giant wave of molasses rising into the air', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCitizen.at(-4.5, 0.18, TANK_BLD.z + 1.0);
      stCitizen.set({ mood: 'shock', holdR: PROPS.molassesWave, armL: [110, 30] });
      shoot(ST.scene, [stCitizen], V3(-1.8, 2.4, TANK_BLD.z + 4.5), V3(-2.8, 2.0, TANK_BLD.z + 3.0), V3(-4.0, 1.5, TANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'chug', { gain: 0.8 }); }

  // S04: Line 3: "racing through city streets at thirty-five miles per hour!"
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'citizen and cop sprinting for their lives from the racing syrup wave', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCitizen.group.visible = true; stCop.group.visible = true;
      stCitizen.at(-4.5, 0.18, TANK_BLD.z + 1.2 - k * 3.0);
      stCitizen.set({ mood: 'worried', legs: 'run', phase: t * 18, armL: [120, 30], armR: [120, 30], sweat: 1.0 });
      stCop.at(-3.0, 0.18, TANK_BLD.z + 1.8 - k * 3.0);
      stCop.set({ mood: 'shock', legs: 'run', phase: t * 16, armL: [100, 30], armR: [100, 30], sweat: 1.0 });
      shoot(ST.scene, [stCitizen, stCop], V3(-1.0, 2.2, TANK_BLD.z + 5.0), V3(-2.2, 1.8, TANK_BLD.z + 3.0), V3(-3.8, 1.4, TANK_BLD.z + 0.5), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); cue(st + 0.4, 'chug', { gain: 0.7 }); }

  // S05: Line 4: "The sticky tsunami destroyed buildings and lifted a train right off its tracks,"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'chaos in the street, buildings rocking, cop waving hands frantically', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stCitizen.group.visible = false;
      stCop.at(-3.5, 0.18, TANK_BLD.z + 1.0);
      stCop.set({ mood: 'shock', armL: [140, 20], armR: [140, 20], sweat: 1.0, talk: talk(t) });
      shoot(ST.scene, [stCop], V3(-2.0, 1.9, TANK_BLD.z + 3.5), V3(-2.8, 1.7, TANK_BLD.z + 2.5), V3(-3.5, 1.45, TANK_BLD.z + 1.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.7 }); }

  // S06: Line 5: "trapping terrified pedestrians in warm gooey syrup."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'citizen stuck in waist-deep gooey molasses, struggling comically', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCop.group.visible = false; stCitizen.group.visible = true;
      stCitizen.at(-4.0, 0.0, TANK_BLD.z + 1.0);
      stCitizen.set({ mood: 'dizzy', legs: 'sit', armL: [80, 40], armR: [80, 40], sweat: 1.0, talk: talk(t) });
      shoot(ST.scene, [stCitizen], V3(-2.8, 1.6, TANK_BLD.z + 2.8), V3(-3.4, 1.5, TANK_BLD.z + 2.0), V3(-4.0, 1.25, TANK_BLD.z + 1.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S07: Line 6: "Rescue workers had to wade through waist-deep molasses,"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'firefighter wading in molasses, pulling citizens to safety', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stCitizen.group.visible = true; stFireman.group.visible = true;
      stFireman.at(-3.0, 0.1, TANK_BLD.z + 1.2);
      stFireman.set({ mood: 'worried', armL: [60, 30], armR: [60, 30], legs: 'walk', phase: t * 4, talk: talk(t) });
      stCitizen.at(-4.2, 0.0, TANK_BLD.z + 1.0);
      shoot(ST.scene, [stFireman, stCitizen], V3(-2.0, 1.8, TANK_BLD.z + 3.5), V3(-2.8, 1.65, TANK_BLD.z + 2.5), V3(-3.6, 1.35, TANK_BLD.z + 1.1), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'chug', { gain: 0.5 }); }

  // S08: Line 7: "and millions of gallons of saltwater were pumped just to scrub the streets."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'firefighter blasting high-pressure saltwater hose to wash away molasses', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stCitizen.group.visible = false;
      stFireman.at(-3.5, 0.18, TANK_BLD.z + 1.0);
      stFireman.set({ mood: 'proud', holdR: PROPS.hose, armL: [40, 20], talk: talk(t) });
      shoot(ST.scene, [stFireman], V3(-2.2, 1.7, TANK_BLD.z + 3.2), V3(-2.8, 1.6, TANK_BLD.z + 2.2), V3(-3.5, 1.45, TANK_BLD.z + 1.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.6 }); }

  // S09: Line 8: "For decades afterward, locals swore that on hot summer days,"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'sunny summer day in Boston, citizen taking a deep sniff with smile', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stFireman.group.visible = false; stCitizen.group.visible = true;
      stCitizen.at(-4.2, 0.18, TANK_BLD.z + 1.2);
      stCitizen.set({ mood: 'happy', armL: [30, 20], armR: [30, 20], talk: talk(t), blink: blink(t) });
      shoot(ST.scene, [stCitizen], V3(-2.5, 1.8, TANK_BLD.z + 3.8), V3(-3.4, 1.65, TANK_BLD.z + 2.5), V3(-4.2, 1.45, TANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.4 }); }

  // S10: Line 9: "the entire city of Boston still smelled like sweet molasses!"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'citizen and cop smiling and nodding happily at the sweet smell, freeze & pop!', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stCitizen.group.visible = true; stCop.group.visible = true;
      stCitizen.at(-4.5, 0.18, TANK_BLD.z + 1.0);
      stCitizen.set({ mood: 'laugh', armR: [120, 20], talk: talk(t) });
      stCop.at(-3.2, 0.18, TANK_BLD.z + 1.4);
      stCop.set({ mood: 'happy', armL: [40, 20], armR: [40, 20], blink: blink(t, 1) });
      shoot(ST.scene, [stCitizen, stCop], V3(-2.2, 1.8, TANK_BLD.z + 3.6), V3(-3.0, 1.7, TANK_BLD.z + 2.6), V3(-4.0, 1.45, TANK_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.7 }); cue(st + 0.4, 'ding', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
