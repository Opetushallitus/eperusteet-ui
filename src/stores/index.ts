import { ArviointiStore } from '@/stores/ArviointiStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { virheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';

const arviointiStore = new ArviointiStore(Kielet);
const kayttajatStore = Kayttajat;
const oppaatStore = new PerusteetStore({ tyyppi: 'OPAS' } as any);
const perusteStore = new PerusteStore();
const perusteetStore = new PerusteetStore({ tyyppi: 'NORMAALI' } as any);
const perusteprojektiStore = new PerusteprojektiStore();
const pohjatStore = new PerusteetStore({ tyyppi: 'POHJA' } as any);
const ulkopuolisetStore = new UlkopuolisetStore();
const tutkinnonOsaStore = new TutkinnonOsaStore();
const muokkaustietoStore = new MuokkaustietoStore();
const aikatauluStore = new AikatauluStore();
const tiedotteetStore = new TiedotteetStore();

export const stores = Object.freeze({
  aikatauluStore,
  arviointiStore,
  kayttajatStore,
  muokkaustietoStore,
  oppaatStore,
  perusteStore,
  perusteetStore,
  perusteprojektiStore,
  pohjatStore,
  TiedotteetStore,
  tutkinnonOsaStore,
  tutoriaaliStore,
  ulkopuolisetStore,
  virheellisetPerusteetStore,
  tiedotteetStore,
});
