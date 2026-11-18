// THE WORLD'S LUCKIEST IDIOT: TIMOTHY DEXTER: the shot list (Tall Tale 3D)
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
PROPS.pan = (g, x, y) => {
  g.fillStyle = '#E2B33C'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y - 45, 22, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#654321'; g.fillRect(x - 4, y - 48, 8, 48); // wooden handle
};

PROPS.cat = (g, x, y) => {
  g.fillStyle = '#E8734A'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.ellipse(x, y - 35, 20, 16, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x - 14, y - 45); g.lineTo(x - 8, y - 62); g.lineTo(x - 2, y - 45); g.fill(); g.stroke(); // ear
  g.beginPath(); g.moveTo(x + 2, y - 45); g.lineTo(x + 8, y - 62); g.lineTo(x + 14, y - 45); g.fill(); g.stroke(); // ear
  g.fillStyle = '#222'; g.beginPath(); g.arc(x - 6, y - 38, 3, 0, 7); g.arc(x + 6, y - 38, 3, 0, 7); g.fill(); // eyes
};

PROPS.coal = (g, x, y) => {
  g.fillStyle = '#222222'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x - 25, y - 20); g.lineTo(x - 10, y - 48); g.lineTo(x + 15, y - 45); g.lineTo(x + 28, y - 22);
  g.closePath(); g.fill(); g.stroke();
};

PROPS.book = (g, x, y) => {
  g.fillStyle = '#F5F5DC'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(x - 25, y - 60, 50, 60, 4); g.fill(); g.stroke();
  g.fillStyle = '#000';
  g.font = 'bold 14px sans-serif'; g.textAlign = 'center';
  g.fillText('! ! ? ? , ,', x, y - 40);
  g.fillText('. . ; ; ! !', x, y - 20);
};

// Character definitions
const LOOK = {
  dexter: { body: '#B98ACF', pattern: 'vest', patCol: '#3E5FA8', hat: 'tophat', hatCol: '#E2B33C', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache'] },
  rival: { body: '#2A2638', pattern: 'vest', patCol: '#9E4A3A', hat: 'bowler', hatCol: '#1E1B28', neck: 'tie', neckCol: '#E2B33C', extra: ['monocle', 'mustache'] },
  merchant: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A' },
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

  // ── SET 1: 18th Century Boston Harbor / Street ─────────────────────────
  const SHOP_ORDER = [
    ['DEXTER MANOR', '#9E4A3A', 'brick', null], ['MERCHANT BANK', '#C7B79A', 'brick', '#2E4E8A'],
    ['SHIPPING CO', '#5FA39A', 'wood', '#D8343F'], ['TAVERN', '#E58A6A', 'wood', '#2E4E3F']
  ];
  const ST = WD.mainStreet(E, { shops: SHOP_ORDER });
  ST.sun.key.target.position.set(-4, 0, 0); ST.sun.key.position.set(5, 13, 6);
  const MANOR = ST.buildings[0];

  const stDexter = person('dexter'), stRival = person('rival'), stMerchant = person('merchant');
  [stDexter, stRival, stMerchant].forEach((p) => ST.scene.add(p.group));

  // ── SET 2: Dexter's Parlor / Study ─────────────────────────────────────
  const IN = WD.interior(E, { wall: '#4A3A2A', motif: '#6A5236', ceiling: '#2A1E14', signText: 'LORD TIMOTHY DEXTER', picture: false });
  const inDexter = person('dexter'), inRival = person('rival');
  inDexter.at(1.5, 0, -2.5); inRival.at(3.5, 0, -2.4);
  [inDexter, inRival].forEach((p) => IN.scene.add(p.group));

  // S01: Line 0: "In 1789, a barely literate man named Timothy Dexter became the world's luckiest idiot."
  { const st = cut(0);
    add({ id: 'S01', at: st, note: 'street outside manor: Dexter struts confidently with eccentric gold tophat', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stDexter.at(-4.5, 0.18, MANOR.z + 1.2);
      stDexter.set({ mood: 'smug', legs: 'walk', phase: lt * 5, armL: [20, 20], armR: [-20, 10], talk: talk(t) });
      stRival.group.visible = false; stMerchant.group.visible = false;
      shoot(ST.scene, [stDexter], V3(-1.8, 2.2, MANOR.z + 5.5), V3(-3.2, 1.9, MANOR.z + 3.8), V3(-4.5, 1.4, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chug', { gain: 0.4 }); }

  // S02: Line 1: "His wealthy rivals constantly tricked him into awful business investments to bankrupt him."
  { const st = cut(1);
    add({ id: 'S02', at: st, note: 'rival laughing wickedly behind Dexter, plotting terrible scheme', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stDexter.at(-4.5, 0.18, MANOR.z + 1.2); stDexter.set({ mood: 'neutral', blink: blink(t) });
      stRival.group.visible = true; stRival.at(-3.0, 0.18, MANOR.z + 1.6);
      stRival.set({ mood: 'sly', armL: [80, 40], armR: [40, 20], talk: talk(t) });
      shoot(ST.scene, [stDexter, stRival], V3(-2.2, 1.8, MANOR.z + 4.0), V3(-3.0, 1.7, MANOR.z + 3.0), V3(-4.0, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'pop'); }

  // S03: Line 2: "First, they told him to ship heavy bed-warming pans to the tropical Caribbean."
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'rival points laughing as Dexter proudly holds bed warming pan', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stDexter.set({ mood: 'proud', holdR: PROPS.pan, armL: [30, 20], talk: talk(t) });
      stRival.set({ mood: 'laugh', armL: [110, 30], armR: [110, 30] });
      shoot(ST.scene, [stDexter, stRival], V3(-2.8, 1.75, MANOR.z + 3.0), V3(-3.4, 1.70, MANOR.z + 2.2), V3(-4.2, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.5 }); }

  // S04: Line 3: "Dexter did it."
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'close-up on Dexter giving a proud nod straight to camera', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stRival.group.visible = false;
      stDexter.set({ mood: 'smug', blink: blink(t), armL: [10, 10], armR: [10, 10], talk: talk(t) });
      shoot(ST.scene, [stDexter], V3(-3.6, 1.75, MANOR.z + 2.4), V3(-4.0, 1.70, MANOR.z + 1.8), V3(-4.5, 1.65, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'ding', { gain: 0.6 }); }

  // S05: Line 4: "Plantations bought the pans as giant molasses ladles, making Dexter a massive fortune!"
  { const st = cut(4);
    add({ id: 'S05', at: st, note: 'Caribbean merchant happily ladling molasses with the warming pan, Dexter beaming', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stMerchant.group.visible = true; stMerchant.at(-3.0, 0.18, MANOR.z + 1.5);
      stMerchant.set({ mood: 'happy', holdR: PROPS.pan, armL: [40, 20] });
      stDexter.set({ mood: 'laugh', armR: [140, 20], talk: talk(t) });
      shoot(ST.scene, [stDexter, stMerchant], V3(-2.2, 1.8, MANOR.z + 4.0), V3(-3.0, 1.7, MANOR.z + 2.8), V3(-4.0, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); }

  // S06: Line 5: "Next, rivals told him to ship thousands of stray alley cats to the islands."
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'Dexter surrounded by cute stray cats, rival smirking', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stMerchant.group.visible = false; stRival.group.visible = true;
      stDexter.set({ mood: 'happy', holdL: PROPS.cat, talk: talk(t) });
      stRival.set({ mood: 'sly', armL: [40, 20], armR: [40, 20] });
      shoot(ST.scene, [stDexter, stRival], V3(-2.6, 1.75, MANOR.z + 3.2), V3(-3.2, 1.70, MANOR.z + 2.4), V3(-4.0, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop'); }

  // S07: Line 6: "A sudden rat plague hit, and locals eagerly bought every single cat!"
  { const st = cut(6);
    add({ id: 'S07', at: st, note: 'islanders buying all cats with bags of gold', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stRival.group.visible = false; stMerchant.group.visible = true;
      stMerchant.set({ mood: 'happy', holdR: PROPS.cat });
      stDexter.set({ mood: 'laugh', armL: [120, 20], armR: [120, 20], talk: talk(t) });
      shoot(ST.scene, [stDexter, stMerchant], V3(-2.2, 1.8, MANOR.z + 3.8), V3(-3.0, 1.7, MANOR.z + 2.8), V3(-4.0, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.7 }); }

  // S08: Line 7: "Furious, rivals told him to ship coal to Newcastle—the coal-mining capital of England."
  { const st = cut(7);
    add({ id: 'S08', at: st, note: 'rival red with rage, shouting and pointing to coal pile', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      stMerchant.group.visible = false; stRival.group.visible = true;
      stRival.set({ mood: 'angry', armL: [130, 40], armR: [130, 40], sweat: 1.0, talk: talk(t) });
      stDexter.set({ mood: 'smug', holdR: PROPS.coal });
      shoot(ST.scene, [stDexter, stRival], V3(-2.5, 1.75, MANOR.z + 3.5), V3(-3.2, 1.70, MANOR.z + 2.5), V3(-4.0, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.6 }); }

  // S09: Line 8: "He arrived during an unexpected miners' strike and sold it for double the profit!"
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'Dexter selling coal at double price, laughing heartily', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      stRival.group.visible = false;
      stDexter.set({ mood: 'laugh', holdR: PROPS.coal, armL: [100, 30], talk: talk(t) });
      shoot(ST.scene, [stDexter], V3(-3.2, 1.75, MANOR.z + 3.0), V3(-3.8, 1.70, MANOR.z + 2.0), V3(-4.5, 1.45, MANOR.z + 1.2), null, k, LOOKS.street);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'ding', { gain: 0.8 }); }

  // S10: Line 9: "He finally published a book with zero punctuation marks,"
  { const st = cut(9);
    add({ id: 'S10', at: st, note: 'in his parlor: Dexter proudly presenting his book', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      inRival.group.visible = false;
      inDexter.set({ mood: 'proud', holdR: PROPS.book, armL: [30, 20], talk: talk(t) });
      shoot(IN.scene, [inDexter], V3(0.5, 1.65, -0.8), V3(0.8, 1.55, -1.5), V3(1.5, 1.45, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop'); }

  // S11: Line 10: "adding a whole page of commas and periods at the back,"
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'close-up on book page filled with rows of punctuation marks', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      inDexter.set({ mood: 'laugh', holdR: PROPS.book, armL: [60, 20], talk: talk(t) });
      shoot(IN.scene, [inDexter], V3(0.8, 1.60, -1.0), V3(1.1, 1.55, -1.6), V3(1.5, 1.45, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'boing', { gain: 0.5 }); }

  // S12: Line 11: "telling angry readers to 'salt and pepper the words as you please!'"
  { const st = cut(11);
    add({ id: 'S12', at: st, note: 'Dexter sprinkling invisible seasoning with a huge laugh!', draw(lt, d, t, blit) {
      const k = eo(clamp(lt / d));
      inDexter.set({ mood: 'laugh', armL: [140, 30], armR: [140, 30], talk: talk(t) });
      shoot(IN.scene, [inDexter], V3(0.4, 1.65, -0.6), V3(0.7, 1.55, -1.3), V3(1.5, 1.45, -2.5), null, k, LOOKS.room);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'ding', { gain: 0.8 }); cue(st + 0.4, 'pop', { gain: 0.9 }); }

  return { shots: S, cues: CUES };
}
