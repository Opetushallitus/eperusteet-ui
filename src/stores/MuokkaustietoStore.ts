import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MuokkaustietoKayttajallaDto, Muokkaustiedot } from '@shared/api/eperusteet';
import _ from 'lodash';

export const useMuokkaustietoStore = defineStore('muokkaustieto', () => {
  // State
  const muokkaustiedot = ref<MuokkaustietoKayttajallaDto[] | null>(null);
  const viimeinenHaku = ref<MuokkaustietoKayttajallaDto[] | null>(null);
  const perusteId = ref<number | null>(null);
  const hakuLukumaara = ref<number>(8);

  // Actions
  function clear() {
    muokkaustiedot.value = null;
  }

  async function init(id: number) {
    perusteId.value = id;
    muokkaustiedot.value = null;
    await update();
  }

  async function fetch() {
    muokkaustiedot.value = null;
    await update();
  }

  async function update() {
    if (perusteId.value) {
      if (muokkaustiedot.value && !_.isEmpty(muokkaustiedot.value)) {
        viimeinenHaku.value = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(
          perusteId.value,
          (_.last(muokkaustiedot.value) as any).luotu,
          hakuLukumaara.value) as any).data;

        if (viimeinenHaku.value) {
          muokkaustiedot.value = [
            ...muokkaustiedot.value,
            ...viimeinenHaku.value,
          ];
        }
      }
      else {
        muokkaustiedot.value = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(
          perusteId.value,
          undefined,
          hakuLukumaara.value) as any).data;
      }
    }
  }

  return {
    // State
    muokkaustiedot,
    viimeinenHaku,
    hakuLukumaara,
    perusteId,

    // Actions
    clear,
    init,
    fetch,
    update,
  };
});
