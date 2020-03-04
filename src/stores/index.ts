import { ArviointiStore } from '@/stores/ArviointiStore';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { PerusteprojektiStore } from '@/stores/PerusteprojektiStore';
import { UlkopuolisetStore } from '@/stores/UlkopuolisetStore';
import { tiedotteetStore } from '@/stores/tiedotteet';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { virheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';

const arviointiStore = new ArviointiStore(Kielet);
const kayttajatStore = Kayttajat;
const oppaatStore = new PerusteetStore({ tyyppi: 'OPAS' } as any);
const perusteStore = new PerusteStore();
const perusteetStore = new PerusteetStore({ tyyppi: 'NORMAALI' } as any);
const perusteprojektiStore = new PerusteprojektiStore();
const pohjatStore = new PerusteetStore({ tyyppi: 'POHJA' } as any);
const ulkopuolisetStore = new UlkopuolisetStore();

export const stores = Object.freeze({
  arviointiStore,
  kayttajatStore,
  oppaatStore,
  perusteStore,
  perusteetStore,
  perusteprojektiStore,
  pohjatStore,
  tiedotteetStore,
  tutoriaaliStore,
  ulkopuolisetStore,
  virheellisetPerusteetStore,
});
