// Daimi personajlar (referans: karakterler/referans-komanda.jpg) — insan.js rig ilə, tam hərəkətli.
// Hər videoda EYNİ spec; yalnız {...o} ilə əlavə (boy, əşya) dəyişdir.
import { insan } from './insan.js';
export const ravan = (o = {}) => insan({ ten: '#e3ad88', sacRenk: '#4a2c1a', sac: 'modern', saqqal: 1, saqqalRenk: '#3a2216', big: 'nazik',
  geyim: 'pencek', ust: '#26386a', ic: '#f6f5f1', alt: '#1d2533', ayak: '#7a4526', ...o });
export const sahibkar = (o = {}) => insan({ ten: '#e6b493', sacRenk: '#9c9c9a', qas: '#6f6f6c', sac: 'geri', big: 'qalin', bigRenk: '#8e8e8b', yas: 1,
  geyim: 'yelek', ust: '#2e4470', ic: '#f2f3f6', alt: '#6c7078', ayak: '#3a2a22', kok: 1.06, ...o });
export const kofeshop = (o = {}) => insan({ ten: '#e0a983', sacRenk: '#4b2e1c', sac: 'modern', saqqal: 1, saqqalRenk: '#3a2416', big: 'nazik',
  geyim: 'koynek', ic: '#7d9161', onluk: '#9c6a3c', onlukLogo: 'K', alt: '#2e4256', ayak: '#6e4a2c', ...o });
export const ekspeditor = (o = {}) => insan({ ten: '#d69c76', sacRenk: '#24170f', sac: 'qivrim', big: 'bugrum', bigRenk: '#1a110b', kepka: { renk: '#2d4f86', kozyrek: '#e8772b' },
  geyim: 'forma', ust: '#2f5a96', forma2: '#e8772b', alt: '#56646f', ayak: '#3c3b39', zolaq: true, kok: 1.04, ...o });
