import { defineStore } from 'pinia';
import { watch, ref, computed } from 'vue';
import { Julkaisut, NavigationNodeDto, PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet, TilaUpdateStatus, PerusteDtoTyyppiEnum, JulkaisuBaseDto, Validointi, MaaraysDto, Maaraykset } from '@shared/api/eperusteet';
import { Kieli } from '@shared/tyypit';
import { Murupolku } from '@shared/stores/murupolku';
import { isAmmatillinenKoulutustyyppi, isVapaasivistystyoKoulutustyyppi, perusteenSuoritustapa, isKoulutustyyppiPdfTuettu } from '@shared/utils/perusteet';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { JulkaisuBaseDtoTilaEnum, PerusteDtoTilaEnum } from '@shared/generated/eperusteet';
import { isKoulutustyyppiSupported } from '@/utils/perusteet';
import { fail } from '@shared/utils/notifications';

export const usePerusteStore = defineStore('peruste', () => {
  // State
  const blocklist = ref<Array<() => void>>([]);
  const projekti = ref<PerusteprojektiDto | null>(null);
  const peruste = ref<PerusteDto | null>(null);
  const navigation = ref<NavigationNodeDto | null>(null);
  const perusteId = ref<number | null>(null);
  const isInitialized = ref(false);
  const julkaisut = ref<JulkaisuBaseDto[] | null>(null);
  const initializing = ref(false);
  const validoinnit = ref<Array<Validointi> | null>(null);
  const julkaisemattomiaMuutoksia = ref<boolean | null>(null);
  const viimeisinJulkaisuTila = ref<string | null>(null);
  const tilaPolling = ref<any | null>(null);
  const muutosmaaraykset = ref<MaaraysDto[] | null>(null);
  const maarays = ref<MaaraysDto | null>(null);

  // Getters
  const getProjekti = computed(() => projekti.value);
  const getPeruste = computed(() => peruste.value);
  const suoritustavat = computed(() => _.map(peruste.value?.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)) as string[]);
  const getPerusteId = computed(() => perusteId.value);
  const projektiId = computed(() => projekti.value?.id);
  const tutkinnonOsat = computed(() => perusteId.value);
  const julkaisukielet = computed(() => (peruste.value?.kielet || []) as unknown as Kieli[]);
  const getValidoinnit = computed(() => validoinnit.value);
  const isAmmatillinen = computed(() => isAmmatillinenKoulutustyyppi(peruste.value?.koulutustyyppi));
  const isVapaasivistystyo = computed(() => isVapaasivistystyoKoulutustyyppi(peruste.value?.koulutustyyppi));
  const getJulkaisut = computed(() => julkaisut.value);
  const isPohja = computed(() => _.toLower(peruste.value?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.POHJA));
  const isNormaali = computed(() => _.toLower(peruste.value?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.NORMAALI));
  const pdfEnabled = computed(() => isKoulutustyyppiPdfTuettu(peruste.value?.koulutustyyppi));
  const koulutustyyppiSupported = computed(() => isKoulutustyyppiSupported(peruste.value?.koulutustyyppi));
  const getJulkaisemattomiaMuutoksia = computed(() => julkaisemattomiaMuutoksia.value);
  const isJulkaistu = computed(() => (_.size(julkaisut.value) > 0 || peruste.value?.tila === PerusteDtoTilaEnum.VALMIS) && _.toLower(peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.POISTETTU));
  const getViimeisinJulkaisuTila = computed(() => viimeisinJulkaisuTila.value);
  const arkistointiReroute = computed(() => _.toLower(peruste.value?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.DIGITAALINENOSAAMINEN) ? 'digitaalisetosaamiset' : isPohja.value ? 'pohjat' : 'perusteprojektit');
  const getMuutosmaaraykset = computed(() => muutosmaaraykset.value ? _.reverse(_.sortBy(muutosmaaraykset.value, 'voimassaoloAlkaa')) : null);
  const getIsInitialized = computed(() => isInitialized.value);
  const getMaarays = computed(() => maarays.value);

  const isOpas = computed(() => {
    if (peruste.value) {
      return _.lowerCase((peruste.value as PerusteDto).tyyppi) === _.lowerCase(PerusteDtoTyyppiEnum.OPAS);
    }
    return false;
  });

  const perusteSuoritustapa = computed(() => {
    if (isOpas.value) {
      return 'OPAS';
    }
    else if (perusteenSuoritustapa(peruste.value)) {
      return perusteenSuoritustapa(peruste.value);
    }
    else {
      return 'REFORMI';
    }
  });

  const getNavigation = computed(() => {
    if (!peruste.value || !navigation.value) {
      return null;
    }

    if (isAmmatillinenKoulutustyyppi(peruste.value?.koulutustyyppi) && !isOpas.value) {
      return {
        ...navigation.value,
        children: [
          ...(navigation.value.children || []), {
            type: 'kvliite',
            children: [],
          },
        ],
      };
    }

    return navigation.value;
  });

  // Actions
  async function updateValidointi() {
    if (projekti.value?.id) {
      validoinnit.value = null;
      if (_.toLower(peruste.value?.tila) !== _.toLower(PerusteDtoTilaEnum.POISTETTU)) {
        try {
          const res = await Perusteprojektit.getPerusteprojektiValidointi(projekti.value!.id!);
          validoinnit.value = res.data;
        }
        catch (e) {
          validoinnit.value = [];
          fail('validointi-epaonnistui');
        }
      }
      else {
        validoinnit.value = [];
      }
    }

    await fetchJulkaisemattomiaMuutoksia();
  }

  function clear() {
    peruste.value = null;
    projekti.value = null;
    validoinnit.value = null;
    julkaisut.value = null;
  }

  async function init(projektiIdParam: number) {
    if (initializing.value || (isInitialized.value && projektiIdParam === projektiId.value)) {
      return;
    }

    try {
      initializing.value = true;
      isInitialized.value = false;
      peruste.value = null;
      projekti.value = null;
      validoinnit.value = null;
      julkaisut.value = null;
      Murupolku.tyhjenna();
      projekti.value = (await Perusteprojektit.getPerusteprojekti(projektiIdParam)).data;
      const perusteIdValue = Number((projekti.value as any)._peruste);
      perusteId.value = perusteIdValue;

      [
        peruste.value,
        navigation.value,
      ] = _.map(await Promise.all([
        Perusteet.getPerusteenTiedot(perusteIdValue),
        Perusteet.getNavigation(perusteIdValue),
      ]), 'data');

      await updateValidointi();
      await fetchJulkaisut();

      isInitialized.value = true;
    }
    catch (err) {
      console.error(err);
    }
    finally {
      initializing.value = false;
    }
  }

  async function updateCurrent() {
    projekti.value = (await Perusteprojektit.getPerusteprojekti(projekti.value!.id!)).data;
    peruste.value = (await Perusteet.getPerusteenTiedot(peruste.value!.id!)).data;

    await updateValidointi();
  }

  async function updateNavigation() {
    if (!perusteId.value) {
      return;
    }
    const res = await Perusteet.getNavigation(perusteId.value);
    navigation.value = res.data;
  }

  function removeNavigationEntry(item: { id: number }) {
    if (navigation.value) {
      navigation.value = removeImpl(navigation.value, item);
    }
  }

  function removeImpl(node: NavigationNodeDto, item: { id: number }): NavigationNodeDto {
    node.children = _(node.children || [])
      .reject(child => child.id === item.id)
      .map(child => removeImpl(child, item))
      .value();
    return node;
  }

  function updateNavigationEntry(item: { id: number, label: { [key: string]: string }}) {
    if (navigation.value) {
      navigation.value = updateImpl(navigation.value, item);
    }
  }

  function updateImpl(node: NavigationNodeDto, item: { id: number, label: { [key: string]: string }}): NavigationNodeDto {
    node.children = _(node.children || [])
      .map(child => {
        if (child.id === item.id) {
          return { ...child, label: item.label };
        }
        return child;
      })
      .map(child => updateImpl(child, item))
      .value();
    return node;
  }

  async function blockUntilInitialized(): Promise<void> {
    return new Promise(resolve => {
      if (isInitialized.value) {
        resolve();
      }
      else {
        blocklist.value.push(resolve);
      }
    });
  }

  // Watch for initialization completion to resolve blocked promises
  watch(getIsInitialized, () => {
    if (isInitialized.value) {
      while (blocklist.value.length > 0) {
        const fn = blocklist.value.shift();
        if (fn) {
          fn();
        }
      }
    }
  });

  async function julkaise(tiedot: any) {
    const projektiIdValue = projekti.value?.id;
    if (projektiIdValue) {
      await Julkaisut.teeJulkaisu(projektiIdValue, tiedot);
      await fetchJulkaisut();
      if (!_.includes(_.map(julkaisut.value, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
        await updateCurrent();
      }
    }
  }

  async function updateJulkaisu(julkaisuData: any) {
    const perusteIdValue = peruste.value?.id;
    if (perusteIdValue) {
      await Julkaisut.updateJulkaisu(perusteIdValue, julkaisuData);
      await fetchJulkaisut();
      if (!_.includes(_.map(julkaisut.value, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
        await updateCurrent();
      }
    }
  }

  async function fetchJulkaisut() {
    julkaisut.value = (await Julkaisut.getJulkaisut(perusteId.value!)).data;
    if (_.includes(_.map(julkaisut.value, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
      await fetchViimeisinJulkaisuTila();
      await pollTila();
    }
  }

  async function fetchViimeisinJulkaisuTila() {
    viimeisinJulkaisuTila.value = (await Julkaisut.viimeisinJulkaisuTila(perusteId.value!)).data;

    if (viimeisinJulkaisuTila.value !== JulkaisuBaseDtoTilaEnum.KESKEN) {
      clearInterval(tilaPolling.value);
      tilaPolling.value = null;
      julkaisut.value = (await Julkaisut.getJulkaisut(perusteId.value!)).data;
      await updateCurrent();
    }
  }

  async function pollTila() {
    if (viimeisinJulkaisuTila.value === JulkaisuBaseDtoTilaEnum.KESKEN) {
      tilaPolling.value = setInterval(() => fetchViimeisinJulkaisuTila(), 2500);
    }
  }

  async function palautaJulkaisu(julkaisu: any) {
    const projektiIdValue = projekti.value?.id;
    if (projektiIdValue) {
      const res = (await Julkaisut.aktivoiJulkaisu(projektiIdValue, julkaisu.revision)).data as any;
      julkaisut.value = [...julkaisut.value!, res.data];
      await updateCurrent();
      await fetchJulkaisut();
    }
  }

  async function fetchJulkaisemattomiaMuutoksia() {
    julkaisemattomiaMuutoksia.value = null;
    julkaisemattomiaMuutoksia.value = (await Julkaisut.julkaisemattomiaMuutoksia(perusteId.value!)).data;
  }

  async function fetchMaaraykset() {
    muutosmaaraykset.value = null;
    maarays.value = null;
    muutosmaaraykset.value = (await Maaraykset.getPerusteenMuutosmaaraykset(perusteId.value!)).data;
    maarays.value = (await Maaraykset.getMaaraysPerusteella(Number((projekti.value as any)._peruste))).data;
  }

  async function tallennaMuutosmaarays(muutosmaarays: any) {
    if (muutosmaarays.id) {
      const tallennettu = (await Maaraykset.updateMaarays(muutosmaarays.id, muutosmaarays)).data;
      muutosmaaraykset.value = _.map(muutosmaaraykset.value, nykyinen => {
        return nykyinen.id === tallennettu.id ? tallennettu : nykyinen;
      });
    }
    else {
      const tallennettu = (await Maaraykset.addMaarays(muutosmaarays)).data;
      muutosmaaraykset.value = [
        ...(muutosmaaraykset.value || []),
        tallennettu,
      ];
    }
  }

  async function poistaMuutosmaarays(poistettavaMuutosmaarays: any) {
    await Maaraykset.deleteMaarays(poistettavaMuutosmaarays.id, perusteId.value!);
    muutosmaaraykset.value = _.reject(muutosmaaraykset.value, muutosmaarays => muutosmaarays.id === poistettavaMuutosmaarays.id);
  }

  // IEditoitava implementation
  async function acquire() {
    return null;
  }

  async function cancel() {
  }

  async function editAfterLoad() {
    return false;
  }

  async function history() {
  }

  async function load() {
  }

  async function preview() {
    return null;
  }

  async function release() {
  }

  async function lock() {
    return null;
  }

  async function remove() {
  }

  async function restore() {
  }

  async function revisions() {
    return [];
  }

  async function save() {
  }

  async function start() {
  }

  const validator = computed(() => {
    return {
    };
  });

  // Create store instance that implements IEditoitava
  const storeInstance: IEditoitava = {
    acquire,
    cancel,
    editAfterLoad,
    history,
    load,
    preview,
    release,
    lock,
    remove,
    restore,
    revisions,
    save,
    start,
    validator,
  };

  return {
    // State
    projekti,
    peruste,
    navigation,
    perusteId,
    isInitialized,
    julkaisut,
    initializing,
    validoinnit,
    julkaisemattomiaMuutoksia,
    viimeisinJulkaisuTila,
    tilaPolling,
    muutosmaaraykset,
    maarays,
    // Getters
    getProjekti,
    getPeruste,
    suoritustavat,
    getPerusteId,
    projektiId,
    tutkinnonOsat,
    julkaisukielet,
    getValidoinnit,
    isAmmatillinen,
    isVapaasivistystyo,
    getJulkaisut,
    isPohja,
    isNormaali,
    pdfEnabled,
    koulutustyyppiSupported,
    getJulkaisemattomiaMuutoksia,
    isJulkaistu,
    getViimeisinJulkaisuTila,
    arkistointiReroute,
    getMuutosmaaraykset,
    getIsInitialized,
    getMaarays,
    isOpas,
    perusteSuoritustapa,
    getNavigation,
    // Actions
    updateValidointi,
    clear,
    init,
    updateCurrent,
    updateNavigation,
    removeNavigationEntry,
    updateNavigationEntry,
    blockUntilInitialized,
    julkaise,
    updateJulkaisu,
    fetchJulkaisut,
    fetchViimeisinJulkaisuTila,
    pollTila,
    palautaJulkaisu,
    fetchJulkaisemattomiaMuutoksia,
    fetchMaaraykset,
    tallennaMuutosmaarays,
    poistaMuutosmaarays,
    // IEditoitava methods
    acquire,
    cancel,
    editAfterLoad,
    history,
    load,
    preview,
    release,
    lock,
    remove,
    restore,
    revisions,
    save,
    start,
    validator,
    // Store instance for interface compatibility
    storeInstance,
  };
});
