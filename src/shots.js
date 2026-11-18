// THE MAN WHO SOLD THE EIFFEL TOWER TWICE: the shot list (Tall Tale 3D)
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

// Custom Props for the con
PROPS.suitcase = (g, x, y) => {
  g.fillStyle = '#654321'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.roundRect(x - 35, y - 60, 70, 50, 6); g.fill(); g.stroke();
  g.fillStyle = '#E2B33C'; g.fillRect(x - 10, y - 62, 20, 6);
  g.fillStyle = '#4A3525'; g.fillRect(x - 28, y - 60, 10, 50); g.fillRect(x + 18, y - 60, 10, 50);
  g.fillStyle = '#85BB65'; g.fillRect(x - 18, y - 48, 36, 26);
};

PROPS.contract = (g, x, y) => {
  g.fillStyle = '#FFF8DC'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(x - 25, y - 65, 50, 65, 4); g.fill(); g.stroke();
  g.fillStyle = '#D8343F'; g.beginPath(); g.arc(x, y - 20, 10, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#222'; g.fillRect(x - 18, y - 55, 36, 4); g.fillRect(x - 18, y - 45, 36, 4); g.fillRect(x - 18, y - 35, 25, 4);
};

PROPS.eiffelMini = (g, x, y) => {
  g.fillStyle = '#706E6B'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x, y - 75);
  g.lineTo(x + 22, y - 10);
  g.lineTo(x - 22, y - 10);
  g.closePath();
  g.fill(); g.stroke();
  g.fillStyle = '#504E4B';
  g.fillRect(x - 12, y - 38, 24, 6);
  g.fillRect(x - 18, y - 18, 36, 6);
};

// Character definitions
const LOOK = {
  victor: { body: '#2A2638', pattern: 'vest', patCol: '#9E4A3A', hat: 'tophat', hatCol: '#1E1B28', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache'] },
  dealer: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A', extra: ['mustache'] },
  dealer2: { body: '#B5553C', pattern: 'vest', patCol: '#2E4E3F', hat: 'cap', hatCol: '#3C6FB6', extra: ['glasses'] },
  cop: { body: '#2E4E8A', hat: 'mailcap', hatCol: '#1E3E7A', neck: 'tie', neckCol: '#D8343F' },
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

  // ── SET 1: Paris Main Street ───────────────────────────────────────────
  const SHOP_ORDER = [
    ['GRAND HOTEL', '#9E4A3A', 'brick', null], ['CAFE DE PARIS', '#E58A6A', 'wood', '#2E4E3F'],
    ['BAKERY', '#C9603F', 'brick', '#D8343F'], ['FIRST BANK', '#C7B79A', 'brick', '#2E4E8A']
  ];
  const ST = WD.mainStreet(E, { shops: SHOP_ORDER });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const HOTEL_BLD = ST.buildings.find((b) => b.name === 'GRAND HOTEL') || ST.buildings[0];
  const stVictor = person('victor'), stDealer = person('dealer'), stDealer2 = person('dealer2'), stCop = person('cop');
  [stVictor, stDealer, stDealer2, stCop].forEach((p) => ST.scene.add(p.group));

  // ── SET 2: Luxury Hotel Suite (Hotel de Crillon) ────────────────────────
  const IN = WD.interior(E, { wall: '#4A3A2A', motif: '#6A5236', ceiling: '#2A1E14', signText: 'HOTEL DE CRILLON', picture: false });
  const inVictor = person('victor'), inDealer = person('dealer');
  inVictor.at(1.5, 0, -2.2); inDealer.at(3.5, 0, -2.4);
  [inVictor, inDealer].forEach((p) => IN.scene.add(p.group));

  // ── SET 3: Railway / Train to Austria ───────────────────────────────────
  const TR = WD.meadow(E, { fenceOn: false, treesOn: false });
  TR.sun.key.position.set(6, 12, 10); TR.sun.key.target.position.set(0, 0, -12);
  const rl = PR.rails(300); rl.position.set(0, 0, -12); TR.scene.add(rl);
  const tr = PR.train(); tr.position.set(0, 0, -12); TR.scene.add(tr);
  const trVictor = person('victor');
  trVictor.at(1.0, 1.2, -11.5);
  TR.scene.add(trVictor.group);

  // S01: Line 0: "In 1925, a smooth-talking con artist named Victor Lustig"
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'street outside Grand Hotel: Victor walking like a king', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stVictor.at(-4.5, 0.18, HOTEL_BLD.z + 1.2);
      stVictor.set({ mood: 'smug', legs: 'walk', phase: lt * 5, armL: [20, 20], armR: [-20, 10], talk: talk(t) });
      stDealer.group.visible = false; stDealer2.group.visible = false; stCop.group.visible = false;
      shoot(ST.scene, [stVictor], V3(-1.8, 2.2, HOTEL_BLD.z + 5.5), V3(-3.2, 1.9, HOTEL_BLD.z + 3.8), V3(-4.5, 1.4, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "sold the Eiffel Tower for scrap metal."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'close-up on Victor holding Eiffel Tower miniature proudly', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stVictor.set({ mood: 'proud', blink: blink(t), armL: [30, 20], armR: [60, -40], holdR: PROPS.eiffelMini, talk: talk(t) });
      shoot(ST.scene, [stVictor], V3(-3.5, 1.78, HOTEL_BLD.z + 2.8), V3(-4.0, 1.72, HOTEL_BLD.z + 2.0), V3(-4.5, 1.68, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'ding', { gain: 0.7 }); }

  // S03: Line 2: "And then, a month later... he sold it again."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'Victor smirks at camera, showing two fingers & contract', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stVictor.set({ mood: 'laugh', armL: [120, 30], holdL: PROPS.contract, armR: [40, 20], talk: talk(t) });
      shoot(ST.scene, [stVictor], V3(-3.6, 1.75, HOTEL_BLD.z + 2.4), V3(-4.0, 1.70, HOTEL_BLD.z + 1.8), V3(-4.5, 1.65, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S04: Line 3: "See, Paris was struggling with the tower's massive repair bills,"
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'Victor surveying Paris with critical eye, calculating', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stVictor.set({ mood: 'sly', armL: [40, 20], armR: [70, 30], talk: talk(t), blink: blink(t) });
      shoot(ST.scene, [stVictor], V3(-2.2, 2.0, HOTEL_BLD.z + 4.0), V3(-3.0, 1.8, HOTEL_BLD.z + 2.8), V3(-4.5, 1.5, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'boing', { gain: 0.5 }); }

  // S05: Line 4: "so Victor forged fake government seals"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'hotel suite: Victor stamping forged official government seals', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      inVictor.set({ mood: 'proud', armL: [30, 20], armR: [90, 40], holdR: PROPS.contract, talk: talk(t) });
      inDealer.group.visible = false;
      shoot(IN.scene, [inVictor], V3(0.5, 1.65, -0.6), V3(0.8, 1.58, -1.2), V3(1.5, 1.45, -2.2), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S06: Line 5: "and invited the city's top scrap dealers to a luxury hotel."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'Victor presenting proposal to gullible dealer in luxury hotel', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inVictor.set({ mood: 'smug', armL: [60, 40], armR: [40, 20], talk: talk(t) });
      inDealer.group.visible = true;
      inDealer.set({ mood: 'shock', armL: [20, 20], armR: [20, 20], blink: blink(t, 1) });
      shoot(IN.scene, [inVictor, inDealer], V3(0.2, 1.6, 0.4), V3(0.6, 1.55, -0.6), V3(2.5, 1.5, -2.3), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'chug', { gain: 0.3 }); }

  // S07: Line 6: "He whispered that the city was secretly tearing the tower down,"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'Victor leaning in, whispering secret plot to amazed dealer', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      inVictor.set({ mood: 'sly', armL: [80, 50], armR: [30, 10], talk: talk(t) });
      inDealer.set({ mood: 'shock', armL: [50, 40], armR: [50, 40], sweat: 0.8 });
      shoot(IN.scene, [inVictor, inDealer], V3(1.2, 1.55, -0.8), V3(1.6, 1.50, -1.3), V3(2.5, 1.45, -2.3), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.6 }); }

  // S08: Line 7: "and accepted a massive suitcase of cash from a gullible dealer."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'dealer hands over suitcase of cash, Victor beaming', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inVictor.set({ mood: 'laugh', armR: [80, 40], holdR: PROPS.suitcase, talk: talk(t) });
      inDealer.set({ mood: 'proud', armL: [60, -30], armR: [60, -30] });
      shoot(IN.scene, [inVictor, inDealer], V3(0.6, 1.55, -0.5), V3(1.0, 1.50, -1.0), V3(2.0, 1.45, -2.2), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); }

  // S09: Line 8: "Victor hopped the first train to Austria with fifty thousand dollars."
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'train leaving station: Victor waving from train with suitcase', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      tr.position.x = -15 + k * 25;
      trVictor.at(tr.position.x + 2.0, 1.2, -11.5);
      trVictor.set({ mood: 'laugh', armR: [140, 20], holdL: PROPS.suitcase, talk: talk(t) });
      shoot(TR.scene, [trVictor], V3(-4.0, 2.5, -4.0), V3(2.0, 2.2, -4.5), V3(0, 1.8, -11.5), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.7 }); }

  // S10: Line 9: "The victim was so utterly humiliated"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'hotel suite: scrap dealer sitting in shock and despair', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      inVictor.group.visible = false;
      inDealer.at(2.5, 0, -2.2);
      inDealer.set({ mood: 'worried', armL: [110, 40], armR: [110, 40], sweat: 1.0, talk: talk(t) });
      shoot(IN.scene, [inDealer], V3(1.8, 1.5, -0.6), V3(2.1, 1.45, -1.2), V3(2.5, 1.35, -2.2), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'boing', { gain: 0.5 }); }

  // S11: Line 10: "that he never even called the police."
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'street outside: dealer hides head in hands, cop walks past clueless', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stVictor.group.visible = false; stDealer2.group.visible = false;
      stDealer.group.visible = true; stCop.group.visible = true;
      stDealer.at(-4.5, 0.18, HOTEL_BLD.z + 1.2);
      stDealer.set({ mood: 'worried', armL: [100, 30], armR: [100, 30], sweat: 0.8, talk: talk(t) });
      stCop.at(-2.5, 0.18, HOTEL_BLD.z + 2.0);
      stCop.set({ mood: 'neutral', legs: 'walk', phase: lt * 4, armL: [20, 20], armR: [-20, 10] });
      shoot(ST.scene, [stDealer, stCop], V3(-1.5, 1.9, HOTEL_BLD.z + 4.5), V3(-2.8, 1.7, HOTEL_BLD.z + 3.2), V3(-4.0, 1.4, HOTEL_BLD.z + 1.5), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S12: Line 11: "So six months later, Victor returned to Paris,"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'Victor returns boldly to Paris street with swagger', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stDealer.group.visible = false; stCop.group.visible = false;
      stVictor.group.visible = true;
      stVictor.at(-4.5, 0.18, HOTEL_BLD.z + 1.2);
      stVictor.set({ mood: 'smug', legs: 'walk', phase: lt * 6, armL: [30, 20], armR: [-20, 10], holdL: PROPS.contract, talk: talk(t) });
      shoot(ST.scene, [stVictor], V3(-2.0, 2.0, HOTEL_BLD.z + 4.8), V3(-3.2, 1.8, HOTEL_BLD.z + 3.2), V3(-4.5, 1.45, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'chug', { gain: 0.4 }); }

  // S13: Line 12: "found another dealer, and tried to sell it a second time!"
  { const st = cut(12);
    add({ id: 'S13', at: st, note: 'Victor with new dealer, pitching Eiffel Tower again! Freeze & pop', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stVictor.group.visible = true; stDealer2.group.visible = true;
      stVictor.at(-4.8, 0.18, HOTEL_BLD.z + 1.0);
      stDealer2.at(-3.6, 0.18, HOTEL_BLD.z + 1.4);
      stVictor.set({ mood: 'laugh', armR: [100, 30], holdR: PROPS.eiffelMini, talk: talk(t) });
      stDealer2.set({ mood: 'shock', armL: [40, 30], armR: [40, 30], blink: blink(t, 2) });
      shoot(ST.scene, [stVictor, stDealer2], V3(-2.2, 1.8, HOTEL_BLD.z + 3.8), V3(-3.0, 1.7, HOTEL_BLD.z + 2.8), V3(-4.2, 1.45, HOTEL_BLD.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.7 }); cue(st + 0.4, 'ding', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
