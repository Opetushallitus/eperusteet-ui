import { AikatauluStore } from '@/stores/AikatauluStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { BreadcrumbStore } from '@/stores/BreadcrumbStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { Murupolku } from '@shared/stores/murupolku';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { virheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { OppaatStore } from '@/stores/OppaatStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { TermitStore } from '@/stores/TermitStore';
import { TilastotStore } from '@/stores/TilastotStore';

const arviointiStore = new ArviointiStore(Kielet);
const kayttajaStore = Kayttajat;
const perusteOppaatStore = new PerusteetStore({ tyyppi: 'OPAS' } as any);
const perusteStore = new PerusteStore();
const perusteetStore = new PerusteetStore({ tyyppi: 'NORMAALI' } as any);
const perusteprojektiStore = new PerusteprojektiStore();
const pohjatStore = new PerusteetStore({ tyyppi: 'POHJA' } as any);
const ulkopuolisetStore = new UlkopuolisetStore();
const tutkinnonOsaStore = new TutkinnonOsaStore(perusteStore);
const muokkaustietoStore = new MuokkaustietoStore();
const aikatauluStore = new AikatauluStore();
const tiedotteetStore = new TiedotteetStore();
const browserStore = new BrowserStore();
const oppaatStore = new OppaatStore();
const tyoryhmaStore = new TyoryhmaStore();
const termitStore = new TermitStore();
const tilastotStore = new TilastotStore();

export const stores = Object.freeze({
  aikatauluStore,
  arviointiStore,
  murupolkuStore: Murupolku,
  browserStore,
  kayttajaStore,
  muokkaustietoStore,
  oppaatStore,
  perusteOppaatStore,
  perusteStore,
  perusteetStore,
  perusteprojektiStore,
  pohjatStore,
  tiedotteetStore,
  tutkinnonOsaStore,
  tutoriaaliStore,
  tyoryhmaStore,
  ulkopuolisetStore,
  virheellisetPerusteetStore,
  termitStore,
  tilastotStore,
});
