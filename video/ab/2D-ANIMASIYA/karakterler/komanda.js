// Rəvanın daimi personajları (referans: referans-komanda.jpg). Hər videoda eyni görünsünlər.
// İstifadə: import { ravan, sahibkar, kofeshop, ekspeditor } from './kit/komanda.js';
import { karakter } from './karakter.js';
export const ravan = (o = {}) => karakter({ seed: 21, cins: 'kisi', ten: '#e0aa86', sacRenk: '#5a3a26', sacStil: 'qisa', quiff: true, saqqal: 1, saqqalGuclu: true, saqqalRenk: '#3d2616',
  pencek: '#24396b', ust: '#24396b', astar: '#f7f7f5', alt: '#1b2330', ayak: '#6a3f26', boy: 0.9, ...o });
export const sahibkar = (o = {}) => karakter({ seed: 22, cins: 'kisi', ten: '#e2b08c', sacRenk: '#9b9b9b', sacStil: 'qisa', big: true, bigRenk: '#8a8a8a',
  ust: '#f1f2f4', yelek: '#2f4466', alt: '#6d7178', ayak: '#2a2220', boy: 0.9, ...o });
export const kofeshop = (o = {}) => karakter({ seed: 23, cins: 'kisi', ten: '#dca67f', sacRenk: '#4a2f1f', sacStil: 'qisa', quiff: true, saqqal: 1, saqqalGuclu: true, saqqalRenk: '#34200f',
  ust: '#7a8f5a', onluk: true, onlukRenk: '#a8703c', onlukLogo: 'K', alt: '#2f4458', ayak: '#5a3a26', boy: 0.9, ...o });
export const ekspeditor = (o = {}) => karakter({ seed: 24, cins: 'kisi', ten: '#d49a74', sacRenk: '#2a1b12', sacStil: 'sapka', sapkaRenk: '#2d4f86', kozyrek: '#e8772b', qivrim: true, big: true, bigRenk: '#16100c',
  ust: '#2f5d9c', alt: '#586670', ayak: '#3b3a38', boy: 0.9, ...o });
