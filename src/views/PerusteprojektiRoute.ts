import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { PerusteStore } from '@/stores/PerusteStore';
import { BrowserStore } from '@shared/stores/BrowserStore';
import _ from 'lodash';
import { PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { isYleissivistavaKoulutustyyppi } from '@shared/utils/perusteet';

const browserStore = new BrowserStore();

export function usePerusteprojekti(props: {
  perusteStore?: PerusteStore;
  kayttajaStore?: KayttajaStore;
  tiedotteetStore?: TiedotteetStore;
  muokkaustietoStore?: MuokkaustietoStore;
  aikatauluStore?: AikatauluStore;
  tyoryhmaStore?: TyoryhmaStore;
}) {
  const route = useRoute();
  const isInitingProjekti = ref(false);

  const showNavigation = computed(() => {
    return browserStore.navigationVisible.value;
  });

  const isInitializing = computed(() => {
    return isInitingProjekti.value;
  });

  const projektiId = computed(() => {
    return route.params.projektiId as string;
  });

  const perusteId = computed(() => {
    return props.perusteStore?.perusteId.value;
  });

  const isAmmatillinen = computed(() => {
    return props.perusteStore?.isAmmatillinen.value;
  });

  const isVapaasivistystyo = computed(() => {
    return props.perusteStore?.isVapaasivistystyo.value;
  });

  const peruste = computed(() => {
    return props.perusteStore?.peruste?.value || null;
  });

  const projekti = computed(() => {
    return props.perusteStore?.projekti?.value || null;
  });

  const julkaisukielet = computed(() => {
    return props.perusteStore?.julkaisukielet.value;
  });

  const isPohja = computed(() => {
    if (peruste.value) {
      return _.toLower(peruste.value.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.POHJA);
    }
    return false;
  });

  const isNormaali = computed(() => {
    if (peruste.value) {
      return _.toLower(peruste.value.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.NORMAALI);
    }
    return false;
  });

  const koulutustyyppiKohtaisetKaannokset = computed(() => {
    return {
      perusteentiedot: isYleissivistavaKoulutustyyppi(props.perusteStore?.peruste.value?.koulutustyyppi)
        ? 'perusteen-tiedot-yleissivistava'
        : 'perusteen-tiedot',
      perusteennimi: isYleissivistavaKoulutustyyppi(props.perusteStore?.peruste.value?.koulutustyyppi)
        ? 'perusteen-nimi-yleissivistava'
        : 'perusteen-nimi',
    };
  });

  const onProjektiChange = async (projektiId?: number, perusteId?: number) => {
    // This can be overridden in the component using this composition function
  };

  // Watch for changes in the project ID
  // watch(projektiId, async (newValue, oldValue) => {
  //   if (newValue && newValue !== oldValue && !isInitingProjekti.value) {
  //     const projektiIdNumber = _.parseInt(newValue);
  //     isInitingProjekti.value = true;
  //     window.scrollTo(0, 0);
  //     try {
  //       props.kayttajaStore?.clear();
  //       props.muokkaustietoStore?.clear();
  //       props.aikatauluStore?.clear();
  //       props.tiedotteetStore?.clear();
  //       props.tyoryhmaStore?.clear();
  //       await props.kayttajaStore?.setPerusteprojekti(projektiIdNumber);
  //       await props.perusteStore?.init(projektiIdNumber);
  //       await props.perusteStore?.blockUntilInitialized();
  //       await onProjektiChange(projektiIdNumber, props.perusteStore?.perusteId.value!);
  //     }
  //     catch (err) {
  //       console.error(err);
  //       throw err;
  //     }
  //     finally {
  //       isInitingProjekti.value = false;
  //     }
  //   }
  // }, { immediate: true });

  return {
    showNavigation,
    isInitializing,
    projektiId,
    perusteId,
    isAmmatillinen,
    isVapaasivistystyo,
    peruste,
    projekti,
    julkaisukielet,
    isPohja,
    isNormaali,
    koulutustyyppiKohtaisetKaannokset,
    onProjektiChange,
  };
}
