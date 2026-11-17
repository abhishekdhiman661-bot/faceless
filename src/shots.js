// THE MAN WHO MAILED HIMSELF HOME: Reg Spiers, 1964
// Tall Tale 3D vertical short.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);

// Characters
const LOOK = {
  reg: { body: '#F2A93B', pattern: 'stripes', patCol: '#3C6FB6', hat: 'cap', hatCol: '#2E4E8A', extra: [] },
  clerk: { body: '#4FB3A9', hat: 'visor', hatCol: '#2F8F5B', neck: 'collar', pattern: 'vest', patCol: '#2B5E73', extra: ['pencil'] },
  handler: { body: '#3E5FA8', hat: 'cap', hatCol: '#B5372E', pattern: 'overalls', patCol: '#2A2638' },
  agent: { body: '#6FA35A', hat: 'boater', hatCol: '#E8C77A', extra: ['mustache'] },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LOOKS = {
    street: { bloom: 0.15, aperture: 0.0012, maxblur: 0.008 },
    room: { bloom: 0.3, aperture: 0.001, maxblur: 0.008 },
    field: { bloom: 0.25, aperture: 0.001, maxblur: 0.007 },
  };
  const shoot = (scene, people, from, to, at, at2, k, look, focus) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(at2 ? mix(at, at2, k) : at) });
  };

  // ── sets ─────────────────────────────────────────────────────────────
  const SHOPS = [
    ['AIR CARGO', '#7FA36A', 'brick', '#2E4E8A'],
    ['AIRWAYS', '#6FA3B8', 'wood', null],
    ['POST', '#C9603F', 'brick', '#D8343F'],
    ['HOTEL', '#9E4A3A', 'brick', null],
  ];
  const ST = WD.mainStreet(E, { shops: SHOPS });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const AC = ST.buildings.find((b) => b.name === 'AIR CARGO') || ST.buildings[0];

  const stReg = person('reg');
  const stHandler = person('handler');
  [stReg, stHandler].forEach((p) => ST.scene.add(p.group));

  // The Wooden Crate
  const bigCrate = PR.parcel(1.1, 0.75, 0.85);
  bigCrate.position.set(-4.5, 0.18, AC.z - 1.5);
  ST.scene.add(bigCrate);

  const view = (scene, from, look, people = []) => {
    const c = new THREE.PerspectiveCamera(42, 4 / 3, 0.1, 800);
    c.position.copy(from); c.lookAt(look);
    people.forEach((p) => p.face(c));
    const t = WD.snapshot(E, scene, c);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  };

  // Cargo office inside
  const IN = WD.interior(E, {
    wall: '#2F6B5A', motif: '#3B7D69', ceiling: '#5A3A2A',
    signText: 'AIR FREIGHT',
    view: view(ST.scene, V3(2, 1.8, -12), V3(-3, 2.2, 10), [stReg]),
    picture: false,
  });
  const inScale = PR.platformScale(); inScale.position.set(2.7, 1.18, -2.0); IN.scene.add(inScale);
  const inBox = PR.parcel(1.0, 0.7, 0.8, true); inBox.position.set(1.15, 0, -1.9); IN.scene.add(inBox);
  const inClerk = person('clerk');
  const inReg = person('reg');
  const inAgent = person('agent');
  inClerk.at(3.55, 0, -2.5);
  [inClerk, inReg, inAgent].forEach((p) => IN.scene.add(p.group));

  // Sunny Airport tarmac / field
  const MD = WD.meadow(E, { fenceOn: false });
  MD.sun.key.position.set(9, 14, 8); MD.sun.key.target.position.set(5, 0, -6);
  const signAir = PR.signpost([['LONDON 0 MI', 'l'], ['PERTH 9000 MI', 'r']]); signAir.position.set(5.5, 0, 2.5); MD.scene.add(signAir);
  const mdCrate = PR.parcel(1.1, 0.75, 0.85); mdCrate.position.set(3.5, 0, -2.0); MD.scene.add(mdCrate);
  const mdReg = person('reg');
  const mdHandler = person('handler');
  [mdReg, mdHandler].forEach((p) => MD.scene.add(p.group));

  // Runway tracks
  const TR = WD.meadow(E, { fenceOn: false, treesOn: false });
  const tr = PR.train(); tr.position.set(0, 0, -12); TR.scene.add(tr);
  const rl = PR.rails(400); rl.position.set(0, 0, -12); TR.scene.add(rl);

  // Cargo Hold Interior
  const MC = WD.interior(E, {
    w: 4.4, depth: 8, h: 3.4, wall: '#555566', motif: '#666677', floor: '#444455', ceiling: '#222233',
    signText: null, picture: false, litter: false,
    view: view(TR.scene, V3(0, 1.6, 8), V3(0, 2.2, -40)),
  });
  const mcCrate = PR.parcel(1.1, 0.75, 0.85); mcCrate.position.set(-0.5, 0, -3.5); MC.scene.add(mcCrate);
  const mcReg = person('reg'); mcReg.at(-0.5, 0.1, -3.5); MC.scene.add(mcReg.group);

  // ══════════════════════════════════════════════════════════════════════
  // SHOTS
  // ══════════════════════════════════════════════════════════════════════

  // S01 · Line 0: "In 1964, an athlete mailed himself home in a wooden box."
  { const st = 0;
    add({ id: 'S01', at: st, note: 'London street: Reg poses beside a wooden crate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stReg.at(-4.8, 0.18, AC.z - 2.5);
      stReg.set({ mood: 'proud', armR: [60, -30], armL: [20, 10], blink: blink(t) });
      stHandler.group.visible = false;
      shoot(ST.scene, [stReg], V3(-1.8, 2.6, AC.z - 7.5), V3(-2.2, 1.8, AC.z - 5.5), V3(-4.6, 1.3, AC.z - 2.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st + 0.05, 'whoosh', { gain: 0.6 }); cue(Wd('athlete', 0), 'ding', { gain: 0.6 }); cue(Wd('box', 0), 'thud'); }

  // S02 · Line 1: "Just to avoid paying for a plane ticket."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'close-up Reg holding plane ticket "$$$", horrified', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inReg.at(1.5, 0, -2.5); inClerk.group.visible = false; inAgent.group.visible = false;
      inReg.set({ mood: 'shock', armR: [45, -80], holdR: PROPS.ticket, sweat: 1, look: [0.3, 0.5], v: 'tk' });
      shoot(IN.scene, [inReg], V3(0.5, 1.8, 0.5), V3(0.8, 1.7, -0.2), V3(1.5, 1.5, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('ticket', 1), 'zip'); }

  // S03 · Line 2: "See, Reg was stranded in London with zero dollars,"
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'Reg on street with empty pockets shrugging', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stReg.at(-4.9, 0.18, AC.z - 3.2);
      stReg.set({ mood: 'sad', armL: [75, -50], armR: [75, -50], look: [0, 0.8], sweat: 1 });
      shoot(ST.scene, [stReg], V3(-2.0, 1.9, AC.z - 7.0), V3(-2.4, 1.6, AC.z - 6.0), V3(-4.9, 1.3, AC.z - 3.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('stranded', 2), 'boing', { gain: 0.5 }); }

  // S04 · Line 3: "and a flight back home cost three hundred pounds,"
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'counter clerk points to expensive price sheet', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inReg.group.visible = true; inClerk.group.visible = true; inAgent.group.visible = false;
      inReg.at(1.4, 0, -2.5); inReg.set({ mood: 'worried', armL: [20, 10], look: [-0.6, 0.2] });
      inClerk.at(3.55, 0, -2.5); inClerk.set({ mood: 'smug', armL: [50, -40], holdL: PROPS.book('£300', 0), talk: talk(t), v: 'bk' });
      shoot(IN.scene, [inReg, inClerk], V3(0.6, 1.8, 0.8), V3(1.0, 1.75, 0.1), V3(2.5, 1.6, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('pounds', 3), 'ding', { gain: 0.8 }); }

  // S05 · Line 4: "which he definitely didn't have."
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'close-up Reg shook head with empty pockets', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inReg.set({ mood: 'dizzy', armL: [40, -90], armR: [40, -90], blink: blink(t), lean: Math.sin(t * 8) * 3 });
      shoot(IN.scene, [inReg], V3(1.0, 1.75, -0.8), V3(1.2, 1.7, -1.3), V3(1.5, 1.55, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('have', 4), 'pop'); }

  // S06 · Line 5: "So he built a five foot wooden crate,"
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'Reg hammering together the wooden crate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stReg.at(-4.2, 0.18, AC.z - 2.8);
      const hit = Math.sin(t * 14);
      stReg.set({ mood: 'proud', armR: [lerp(120, 40, hit > 0 ? hit : 0), -40], holdR: PROPS.stamp, armL: [40, 20], v: 'h' });
      shoot(ST.scene, [stReg], V3(-1.8, 1.9, AC.z - 6.2), V3(-2.2, 1.7, AC.z - 5.0), V3(-4.4, 1.2, AC.z - 2.0), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('crate', 5), 'thud'); }

  // S07 · Line 6: "labelled it paint,"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'stamp PLASTIC PAINT slams onto crate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stReg.at(-4.2, 0.18, AC.z - 2.8);
      stReg.set({ mood: 'smug', armL: [30, -30], armR: [60, -20] });
      shoot(ST.scene, [stReg], V3(-3.2, 1.6, AC.z - 3.8), V3(-3.6, 1.45, AC.z - 3.0), V3(-4.5, 1.0, AC.z - 1.8), null, k, LOOKS.street);
      blit();
      ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.08);
      ctx.strokeStyle = '#2E4E8A'; ctx.lineWidth = 10; ctx.strokeRect(-240, -70, 480, 140);
      ctx.fillStyle = '#2E4E8A'; ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('PLASTIC PAINT', 0, 0);
      ctx.restore();
    } });
    cue(st, 'whoosh'); cue(Wd('paint', 6), 'stamp', { gain: 1.0 }); }

  // S08 · Line 7: "and climbed inside with some canned food and a pillow."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'Reg inside open crate with pillow and canned food', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inBox.visible = true; inReg.at(1.15, 0.05, -1.9); inReg.set({ mood: 'happy', armL: [30, 20], armR: [40, 30], blink: blink(t) });
      inClerk.group.visible = false;
      shoot(IN.scene, [inReg], V3(0.2, 1.6, 0.2), V3(0.5, 1.45, -0.6), V3(1.15, 1.0, -1.9), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('pillow', 7), 'plop'); }

  // S09 · Line 8: "He shipped the box cash on delivery,"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'freight clerk stamps COD on waybill', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inClerk.group.visible = true; inReg.group.visible = false;
      inClerk.at(3.55, 0, -2.5); inScale.set(160);
      inClerk.set({ mood: 'happy', armR: [90, -40], holdR: PROPS.stamp, armL: [40, -30], v: 'cod' });
      shoot(IN.scene, [inClerk], V3(1.0, 1.9, 0.5), V3(1.4, 1.85, -0.2), V3(3.1, 1.6, -2.3), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('delivery', 8), 'stamp', { gain: 0.9 }); }

  // S10 · Line 9: "meaning he didn't have to pay a single dime upfront."
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'Reg smug thumbs up from crate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inReg.group.visible = true; inClerk.group.visible = false;
      inReg.at(1.15, 0.05, -1.9); inReg.set({ mood: 'smug', armR: [120, -10], armL: [20, 10], blink: blink(t) });
      shoot(IN.scene, [inReg], V3(0.4, 1.65, -0.2), V3(0.65, 1.5, -0.9), V3(1.15, 1.0, -1.9), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('upfront', 9), 'ding', { gain: 0.7 }); }

  // S11 · Line 10: "For sixty-three hours,"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'wide airfield runway sign LONDON to PERTH', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      mdReg.group.visible = false; mdHandler.group.visible = false;
      shoot(MD.scene, [], V3(3.2, 2.3, 5.2), V3(4.2, 4.2, 3.0), V3(6.2, 2.4, 2.4), V3(40, 3, -60), eio(k), LOOKS.field, 4);
      blit();
      ctx.save(); ctx.translate(540, 480);
      ctx.fillStyle = '#FFFFFF'; ctx.font = '900 86px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000'; ctx.shadowBlur = 12;
      ctx.fillText('63 HOURS', 0, 0);
      ctx.restore();
    } });
    cue(st, 'whoosh'); cue(Wd('hours', 10), 'tock', { gain: 0.8 }); }

  // S12 · Line 11: "he flew across three continents,"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'cargo rolling across the world', draw(lt, d, t, blit) {
      const k = clamp(lt / d); const x = -10 + lt * 5.5; tr.position.x = x; tr.update(t);
      shoot(TR.scene, [], V3(x + 8, 1.4, -3.5), V3(x + 5.5, 2.6, -4.5), V3(x + 0.5, 2.0, -12), V3(x - 1.5, 2.0, -12), k, { ...LOOKS.field, aperture: 0.0005, fov: 48 }, 11);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('continents', 11), 'slide', { dur: 1.2, gain: 0.5 }); }

  // S13 · Line 12: "mostly upside down in freezing cargo holds."
  { const st = cut(12);
    add({ id: 'S13', at: st, note: 'inside cargo hold, crate tilting upside down with dizzy Reg', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      mcCrate.rotation.z = Math.sin(t * 3) * 0.45 + 0.3;
      mcReg.set({ mood: 'dizzy', sweat: 1, look: [0, 0.8], lean: Math.sin(t * 4) * 8 });
      shoot(MC.scene, [mcReg], V3(-0.5, 1.8, 1.2), V3(-0.5, 1.6, 0.2), V3(-0.5, 1.1, -3.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('down', 12), 'boing', { gain: 0.7 }); }

  // S14 · Line 13: "When the crate finally touched down in Australia,"
  { const st = cut(13);
    add({ id: 'S14', at: st, note: 'sunny Australian airport runway with crate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      mdHandler.group.visible = true; mdReg.group.visible = false;
      mdHandler.at(2.0, 0, -2.5); mdHandler.set({ mood: 'tired', legs: 'walk', phase: t * 5, armL: [30, 0] });
      shoot(MD.scene, [mdHandler], V3(0.5, 2.2, 5.0), V3(1.2, 1.8, 3.2), V3(3.2, 1.2, -2.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('Australia', 13), 'ding', { gain: 0.8 }); }

  // S15 · Line 14: "Reg waited for the handlers to walk away,"
  { const st = cut(14);
    add({ id: 'S15', at: st, note: 'handlers walk away into distance, crate wobbles', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      mdHandler.at(2.0 - k * 3.0, 0, -2.5 - k * 4.0); mdHandler.set({ legs: 'walk', phase: t * 6, mood: 'neutral' });
      mdCrate.rotation.y = Math.sin(t * 8) * 0.08;
      shoot(MD.scene, [mdHandler], V3(1.2, 1.8, 3.2), V3(1.8, 1.6, 2.0), V3(3.2, 1.1, -2.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('away', 14), 'tock'); }

  // S16 · Line 15: "popped the wooden latch open,"
  { const st = cut(15);
    add({ id: 'S16', at: st, note: 'Reg pops up from crate, stretching arms and grinning', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      mdHandler.group.visible = false; mdReg.group.visible = true;
      mdReg.at(3.5, 0.4, -2.0);
      mdReg.set({ mood: 'happy', armL: [140, 20], armR: [140, 20], blink: blink(t) });
      shoot(MD.scene, [mdReg], V3(2.5, 1.8, 1.5), V3(2.8, 1.6, 0.6), V3(3.5, 1.3, -2.0), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(Wd('open', 15), 'pop', { gain: 0.9 }); }

  // S17 · Line 16: "and casually strolled right out of the airport."
  { const st = cut(16);
    add({ id: 'S17', at: st, note: 'Reg strolls into Australian sunshine, completely free! Stamp DELIVERED', draw(lt, d, t, blit) {
      const k = clamp(lt / d);
      stReg.at(-4.9, 0.18, AC.z - 5.0 + k * 4.5);
      stReg.set({ legs: 'walk', phase: t * 7, mood: 'proud', armR: [40, 0], armL: [40, 0], blink: blink(t) });
      shoot(ST.scene, [stReg], V3(-2.2, 1.7, AC.z - 8.0 + k * 2.0), V3(-2.6, 1.55, AC.z - 6.0 + k * 2.0), V3(-4.8, 1.25, AC.z - 3.0 + k * 2.0), null, eio(k), LOOKS.street);
      blit();
      const sp = clamp((lt - 0.8) / 0.25);
      if (sp > 0) {
        ctx.save(); ctx.translate(540, 680); ctx.rotate(-0.12);
        const s = lerp(2.4, 1.1, eo(sp)); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, sp * 1.5);
        ctx.strokeStyle = '#2F8F5B'; ctx.lineWidth = 14; ctx.beginPath(); ctx.roundRect(-300, -85, 600, 170, 20); ctx.stroke();
        ctx.fillStyle = '#2F8F5B'; ctx.font = '900 80px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('DELIVERED', 0, 0);
        ctx.restore();
      }
    } });
    cue(st, 'whoosh'); cue(st + 0.8, 'stamp', { gain: 1.0 }); cue(Wd('airport', 16), 'ding', { gain: 0.8 }); }

  return { shots: S, cues: CUES };
}
