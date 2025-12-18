import { AikatauluStore } from '@/stores/AikatauluStore';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { Murupolku } from '@shared/stores/murupolku';
import { PerusteStore } from '@/stores/PerusteStore';
import { OmatPerusteetStore } from '@/stores/OmatPerusteetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { OppaatStore } from '@/stores/OppaatStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { TermitStore } from '@/stores/TermitStore';
import { TilastotStore } from '@/stores/TilastotStore';
import { PoistetutStore } from './PoistetutStore';
import { PerusteetStore } from './PerusteetStore';
import { YllapitoStore } from '@/stores/YllapitoStore';
import { OsaamismerkitStore } from '@/stores/OsaamismerkitStore';

// Create instances of class-based stores
const arviointiStore = new ArviointiStore(Kielet);
const kayttajaStore = Kayttajat;
const perusteOppaatStore = new OmatPerusteetStore({ tyyppi: ['OPAS'] } as any);
const perusteStore = new PerusteStore();
const perusteetStore = new OmatPerusteetStore({ tyyppi: ['NORMAALI'] });
const perusteprojektiStore = new PerusteprojektiStore();
const pohjatStore = new OmatPerusteetStore({ tyyppi: ['POHJA'] } as any);
const digitaalisetOsaamisetStore = new PerusteetStore({ tyyppi: ['DIGITAALINEN_OSAAMINEN'] } as any);
const kieliKaantajaTutkinnotStore = new PerusteetStore({ tyyppi: ['KIELI_KAANTAJA_TUTKINTO'] } as any);
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
const poistetutStore = new PoistetutStore();
const yllapitoStore = new YllapitoStore();
const osaamismerkitStore = new OsaamismerkitStore();

// Export class-based stores
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
  digitaalisetOsaamisetStore,
  kieliKaantajaTutkinnotStore,
  perusteprojektiStore,
  pohjatStore,
  tiedotteetStore,
  tutkinnonOsaStore,
  tyoryhmaStore,
  ulkopuolisetStore,
  termitStore,
  tilastotStore,
  poistetutStore,
  yllapitoStore,
  osaamismerkitStore,
});
