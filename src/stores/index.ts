import { useAikatauluStore } from '@/stores/AikatauluStore';
import { useArviointiStore } from '@/stores/ArviointiStore';
import { useKayttajaStore } from '@/stores/kayttaja';
import { useMuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { Murupolku } from '@shared/stores/murupolku';
import { usePerusteStore } from '@/stores/PerusteStore';
import { usePerusteetStore } from '@/stores/PerusteetStore';
import { usePerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { useTiedotteetStore } from '@/stores/TiedotteetStore';
import { useTutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { useUlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { useOppaatStore } from '@/stores/OppaatStore';
import { useTyoryhmaStore } from '@/stores/TyoryhmaStore';
import { useTermitStore } from '@/stores/TermitStore';
import { useTilastotStore } from '@/stores/TilastotStore';
import { usePoistetutStore } from './PoistetutStore';
import { useDigitaalisetOsaamisetStore } from './DigitaalisetOsaamisetStore';
import { useYllapitoStore } from '@/stores/YllapitoStore';
import { useOsaamismerkitStore } from '@/stores/OsaamismerkitStore';
import { useMaarayksetStore } from '@shared/stores/MaarayksetStore';
import { pinia } from '@/stores/pinia';
import { useAipeVaiheStore } from '@/stores/AipeVaiheStore';
import { useAipeVaiheetStore } from '@/stores/AipeVaiheetStore';
import { useAipeLaajaAlainenOsaaminenStore } from '@/stores/AipeLaajaAlainenOsaaminenStore';
import { useAipeLaajaAlaisetOsaamisetStore } from '@/stores/AipeLaajaAlaisetOsaamisetStore';
import { useLaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import { usePerusopetusLaajaAlainenOsaaminenStore } from '@/stores/PerusopetusLaajaAlainenOsaaminenStore';
import { useJarjestysStore } from '@/stores/JarjestysStore';

// Function to create store instances
export function createStores() {
  // Initialize stores that don't need constructor parameters
  const aikatauluStore = useAikatauluStore(pinia);
  const arviointiStore = useArviointiStore(pinia);
  const perusteStore = usePerusteStore(pinia);
  const tyoryhmaStore = useTyoryhmaStore(pinia);
  const poistetutStore = usePoistetutStore(pinia);
  const yllapitoStore = useYllapitoStore(pinia);
  const tiedotteetStore = useTiedotteetStore(pinia);
  const termitStore = useTermitStore(pinia);
  const ulkopuolisetStore = useUlkopuolisetStore(pinia);
  const laajaalainenOsaaminenStore = useLaajaalainenOsaaminenStore(pinia);
  const perusopetusLaajaAlainenOsaaminenStore = usePerusopetusLaajaAlainenOsaaminenStore(pinia);
  const jarjestysStore = useJarjestysStore(pinia);

  // Migrated stores
  const muokkaustietoStore = useMuokkaustietoStore(pinia);
  const perusteprojektiStore = usePerusteprojektiStore(pinia);
  const oppaatStore = useOppaatStore(pinia);
  const tilastotStore = useTilastotStore(pinia);
  const osaamismerkitStore = useOsaamismerkitStore(pinia);
  const kayttajaStore = useKayttajaStore(pinia);
  const maarayksetStore = useMaarayksetStore(pinia);
  const aipeVaiheStore = useAipeVaiheStore(pinia);
  const aipeVaiheetStore = useAipeVaiheetStore(pinia);
  const aipeLaajaAlainenOsaaminenStore = useAipeLaajaAlainenOsaaminenStore(pinia);
  const aipeLaajaAlaisetOsaamisetStore = useAipeLaajaAlaisetOsaamisetStore(pinia);

  // Setup Pinia stores with parameters
  const perusteetStore = usePerusteetStore('perusteet')(pinia);
  perusteetStore.initialize({ tyyppi: ['NORMAALI', 'AMOSAA_YHTEINEN'] } as any);

  const perusteOppaatStore = usePerusteetStore('oppaat')(pinia);
  perusteOppaatStore.initialize({ tyyppi: ['OPAS'] } as any);

  const pohjatStore = usePerusteetStore('pohjat')(pinia);
  pohjatStore.initialize({ tyyppi: ['POHJA'] } as any);

  const digitaalisetOsaamisetStore = useDigitaalisetOsaamisetStore(pinia);
  digitaalisetOsaamisetStore.initialize({ tyyppi: ['DIGITAALINEN_OSAAMINEN'] } as any);

  // Setup TutkinnonOsaStore with perusteStore reference
  const tutkinnonOsaStore = useTutkinnonOsaStore(pinia);

  const browserStore = new BrowserStore();

  return {
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
    perusteprojektiStore,
    pohjatStore,
    tiedotteetStore,
    tutkinnonOsaStore,
    tutoriaaliStore,
    tyoryhmaStore,
    ulkopuolisetStore,
    termitStore,
    tilastotStore,
    poistetutStore,
    yllapitoStore,
    osaamismerkitStore,
    maarayksetStore,
    aipeVaiheStore,
    aipeVaiheetStore,
    aipeLaajaAlainenOsaaminenStore,
    aipeLaajaAlaisetOsaamisetStore,
    laajaalainenOsaaminenStore,
    perusopetusLaajaAlainenOsaaminenStore,
    jarjestysStore,
  };
}

// Export stores instance (for backwards compatibility)
export const stores = Object.freeze(createStores());
