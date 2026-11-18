// THE GREAT EMU WAR OF 1932: the shot list (Tall Tale 3D)
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
PROPS.binoculars = (g, x, y) => {
  g.fillStyle = '#2A2A2A'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(x - 22, y - 50, 18, 35, 4); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(x + 4, y - 50, 18, 35, 4); g.fill(); g.stroke();
  g.fillRect(x - 5, y - 40, 10, 8);
};

PROPS.lewisGun = (g, x, y) => {
  g.fillStyle = '#3A3A3A'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.roundRect(x - 45, y - 45, 90, 16, 4); g.fill(); g.stroke();
  g.fillStyle = '#222'; g.beginPath(); g.ellipse(x - 5, y - 52, 22, 10, 0, 0, 7); g.fill(); g.stroke();
  g.fillRect(x + 40, y - 42, 25, 8); // barrel
  g.fillStyle = '#8B5A2B'; g.fillRect(x - 40, y - 30, 16, 25); // stock
};

PROPS.wheat = (g, x, y) => {
  g.fillStyle = '#E8C77A'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 30, x, y - 60);
  g.stroke();
  for (let i = 0; i < 5; i++) {
    const py = y - 20 - i * 8;
    g.beginPath(); g.ellipse(x - 8, py, 8, 4, -0.4, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(x + 8, py, 8, 4, 0.4, 0, 7); g.fill(); g.stroke();
  }
};

PROPS.flag = (g, x, y) => {
  g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.rect(x - 30, y - 65, 55, 35); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x - 30, y - 75); g.stroke();
};

// Character definitions
const LOOK = {
  major: { body: '#556B2F', pattern: 'plain', hat: 'mailcap', hatCol: '#3E4F23', neck: 'collar', extra: ['mustache'] },
  soldier: { body: '#6B8E23', pattern: 'plain', hat: 'cap', hatCol: '#4B6A1A' },
  farmer: { body: '#D2B48C', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A', extra: ['mustache'] },
  emu: { body: '#4A403A', head: '#3A322C', hat: 'none', neck: 'none', pattern: 'plain' },
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

  // ── SET 1: Western Australian Outback & Wheat Field ────────────────────
  const MD = WD.meadow(E, { fenceOn: true, treesOn: true });
  MD.sun.key.position.set(9, 14, 8); MD.sun.key.target.position.set(0, 0, -6);
  const farmHouse = PR.house({ wall: '#E8DFD0', roof: '#8B4513', door: '#3E5FA8' });
  farmHouse.position.set(6, 0, -10); MD.scene.add(farmHouse);

  const stMajor = person('major'), stSoldier = person('soldier'), stFarmer = person('farmer');
  const stEmu1 = person('emu', { height: 1.6 }), stEmu2 = person('emu', { height: 1.5 }), stEmu3 = person('emu', { height: 1.7 });
  [stMajor, stSoldier, stFarmer, stEmu1, stEmu2, stEmu3].forEach((p) => MD.scene.add(p.group));

  // S01: Line 0: "In 1932, the Australian military went to war"
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'outback meadow: Major Meredith surveys the landscape through binoculars', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stMajor.at(-1.5, 0, -4.0); stSoldier.at(0.5, 0, -4.5);
      stMajor.set({ mood: 'smug', armL: [110, 40], holdL: PROPS.binoculars, talk: talk(t) });
      stSoldier.set({ mood: 'proud', armR: [70, 30], holdR: PROPS.lewisGun });
      [stFarmer, stEmu1, stEmu2, stEmu3].forEach((p) => (p.group.visible = false));
      shoot(MD.scene, [stMajor, stSoldier], V3(-0.5, 1.8, -0.5), V3(-1.0, 1.6, -1.8), V3(-0.8, 1.4, -4.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "against an army of twenty thousand giant birds."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'wide shot: horde of emus staring down the army across the wheat field', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stMajor.group.visible = false; stSoldier.group.visible = false;
      stEmu1.at(-2.5, 0, -6.0); stEmu2.at(0, 0, -5.5); stEmu3.at(2.5, 0, -6.5);
      [stEmu1, stEmu2, stEmu3].forEach((e, i) => {
        e.group.visible = true;
        e.set({ mood: 'smug', blink: blink(t, i), legs: 'walk', phase: t * 4 + i });
      });
      shoot(MD.scene, [stEmu1, stEmu2, stEmu3], V3(0, 2.2, -1.0), V3(0, 1.8, -2.5), V3(0, 1.2, -6.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.5 }); }

  // S03: Line 2: "And the birds won."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'close-up on smug emu chewing wheat and staring into camera', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stEmu2.at(0, 0, -3.0);
      stEmu2.set({ mood: 'laugh', holdR: PROPS.wheat, talk: talk(t), blink: blink(t) });
      [stEmu1, stEmu3].forEach((p) => (p.group.visible = false));
      shoot(MD.scene, [stEmu2], V3(0.5, 1.6, -1.0), V3(0.1, 1.55, -1.8), V3(0, 1.45, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.7 }); }

  // S04: Line 3: "See, thousands of migrating emus invaded wheat farms, eating everything in sight."
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'panicked farmer shouting as emus devour the wheat crops', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stFarmer.group.visible = true; stFarmer.at(-1.8, 0, -4.0);
      stFarmer.set({ mood: 'shock', armL: [140, 20], armR: [140, 20], sweat: 1.0, talk: talk(t) });
      stEmu1.group.visible = true; stEmu1.at(1.2, 0, -4.2);
      stEmu1.set({ mood: 'happy', holdL: PROPS.wheat, legs: 'walk', phase: t * 5 });
      shoot(MD.scene, [stFarmer, stEmu1], V3(-0.2, 1.8, -1.0), V3(-0.4, 1.6, -2.0), V3(-0.5, 1.4, -4.1), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'boing', { gain: 0.5 }); }

  // S05: Line 4: "So the government sent soldiers armed with heavy machine guns and ten thousand rounds of ammo."
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'military arrives with Lewis machine gun and crates of bullets', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stFarmer.group.visible = false; stEmu1.group.visible = false;
      stMajor.group.visible = true; stSoldier.group.visible = true;
      stMajor.at(-1.5, 0, -3.5); stSoldier.at(1.2, 0, -3.5);
      stMajor.set({ mood: 'proud', armL: [40, 20], armR: [40, 20], talk: talk(t) });
      stSoldier.set({ mood: 'proud', holdR: PROPS.lewisGun, armL: [30, 20] });
      shoot(MD.scene, [stMajor, stSoldier], V3(0, 1.8, -0.8), V3(0, 1.55, -1.8), V3(0, 1.35, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S06: Line 5: "They expected an easy victory."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'Major Meredith smiling confidently, ready to fire', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stMajor.set({ mood: 'smug', armR: [100, 30], talk: talk(t), blink: blink(t) });
      stSoldier.set({ mood: 'happy', armR: [70, 30], holdR: PROPS.lewisGun });
      shoot(MD.scene, [stMajor, stSoldier], V3(-0.5, 1.6, -1.5), V3(-0.8, 1.5, -2.2), V3(-1.0, 1.4, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'chug', { gain: 0.4 }); }

  // S07: Line 6: "Instead, the emus deployed flawless guerrilla warfare tactics."
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'leader Emu wearing imaginary commander cap, surveying battlefield tactically', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stMajor.group.visible = false; stSoldier.group.visible = false;
      stEmu2.group.visible = true; stEmu2.at(0, 0, -3.2);
      stEmu2.set({ mood: 'sly', armL: [80, 40], armR: [80, 40], talk: talk(t), blink: blink(t) });
      shoot(MD.scene, [stEmu2], V3(0.5, 1.65, -1.0), V3(0.1, 1.55, -1.8), V3(0, 1.4, -3.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.6 }); }

  // S08: Line 7: "When soldiers opened fire, the emus split into small sprint squads in every direction."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'emus sprinting at high speed in zig-zag patterns across the field', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stEmu1.group.visible = true; stEmu2.group.visible = true; stEmu3.group.visible = true;
      stEmu1.at(-3.0 - k * 3.0, 0, -5.0); stEmu1.set({ mood: 'laugh', legs: 'run', phase: t * 15 });
      stEmu2.at(0, 0, -4.5 - k * 2.0); stEmu2.set({ mood: 'happy', legs: 'run', phase: t * 14 });
      stEmu3.at(2.5 + k * 3.5, 0, -5.5); stEmu3.set({ mood: 'laugh', legs: 'run', phase: t * 16 });
      shoot(MD.scene, [stEmu1, stEmu2, stEmu3], V3(0, 2.5, 0.5), V3(0, 2.0, -1.5), V3(0, 1.2, -5.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'pop'); cue(st + 0.3, 'chug', { gain: 0.6 }); }

  // S09: Line 8: "Desperate, the troops mounted a machine gun onto a speeding truck,"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'troops chasing emus in bouncing truck with mounted gun', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stMajor.group.visible = true; stSoldier.group.visible = true;
      [stEmu1, stEmu2, stEmu3].forEach((e) => (e.group.visible = false));
      stMajor.at(-1.0, 0.5 + Math.sin(t * 20) * 0.1, -4.0);
      stSoldier.at(1.0, 0.5 + Math.sin(t * 20) * 0.1, -4.0);
      stMajor.set({ mood: 'worried', armL: [100, 30], sweat: 0.8 });
      stSoldier.set({ mood: 'shock', holdR: PROPS.lewisGun, armR: [60, 40] });
      shoot(MD.scene, [stMajor, stSoldier], V3(0, 1.8, -1.0), V3(0, 1.6, -2.2), V3(0, 1.4, -4.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.7 }); }

  // S10: Line 9: "but the terrain was so bumpy the gunner couldn't land a single shot!"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'gunner rattling wildly on bumpy road, bullets missing completely', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stSoldier.at(0, 0.5 + Math.sin(t * 30) * 0.2, -3.0);
      stSoldier.set({ mood: 'dizzy', holdR: PROPS.lewisGun, armR: [120, 40], sweat: 1.0 });
      stMajor.group.visible = false;
      shoot(MD.scene, [stSoldier], V3(0.5, 1.6, -0.8), V3(0.1, 1.5, -1.5), V3(0, 1.3, -3.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'boing', { gain: 0.7 }); }

  // S11: Line 10: "After wasting thousands of bullets with almost zero effect,"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'soldier exhausted, surrounded by empty ammunition boxes', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stSoldier.at(0, 0, -3.2);
      stSoldier.set({ mood: 'tired', armL: [20, 10], armR: [20, 10], sweat: 0.9, talk: talk(t) });
      shoot(MD.scene, [stSoldier], V3(-0.6, 1.6, -1.2), V3(-0.2, 1.5, -1.8), V3(0, 1.3, -3.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S12: Line 11: "the humiliated army officially ordered a full retreat,"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'Major Meredith waves white flag, ordering complete retreat', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stMajor.group.visible = true; stSoldier.group.visible = false;
      stMajor.at(0, 0, -3.5);
      stMajor.set({ mood: 'sad', holdL: PROPS.flag, armL: [130, 20], sweat: 1.0, talk: talk(t) });
      shoot(MD.scene, [stMajor], V3(0.8, 1.7, -1.2), V3(0.3, 1.55, -2.0), V3(0, 1.35, -3.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'boing', { gain: 0.5 }); }

  // S13: Line 12: "leaving the emus completely victorious!"
  { const st = cut(12);
    add({ id: 'S13', at: st, note: 'emus celebrating hilarious victory with crowns and wheat feast!', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stMajor.group.visible = false;
      stEmu1.group.visible = true; stEmu2.group.visible = true; stEmu3.group.visible = true;
      stEmu1.at(-1.8, 0, -3.5); stEmu1.set({ mood: 'happy', legs: 'jump', phase: t * 8 });
      stEmu2.at(0, 0, -3.0); stEmu2.set({ mood: 'laugh', holdR: PROPS.wheat, talk: talk(t) });
      stEmu3.at(1.8, 0, -3.5); stEmu3.set({ mood: 'happy', legs: 'jump', phase: t * 8 + 2 });
      shoot(MD.scene, [stEmu1, stEmu2, stEmu3], V3(0, 1.8, -0.6), V3(0, 1.55, -1.4), V3(0, 1.3, -3.2), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'ding', { gain: 0.8 }); cue(st + 0.4, 'pop', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
