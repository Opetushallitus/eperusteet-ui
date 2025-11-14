import Vue from 'vue';
import { watch, reactive, computed, ref } from 'vue';
import { Julkaisut, NavigationNodeDto, PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet, TilaUpdateStatus, PerusteDtoTyyppiEnum, JulkaisuBaseDto, Validointi, MaaraysDto, Maaraykset } from '@shared/api/eperusteet';
import { Kieli } from '@shared/tyypit';
import { Murupolku } from '@shared/stores/murupolku';
import { isAmmatillinenKoulutustyyppi, isVapaasivistystyoKoulutustyyppi, perusteenSuoritustapa, isKoulutustyyppiPdfTuettu } from '@shared/utils/perusteet';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { JulkaisuBaseDtoTilaEnum, PerusteDtoTilaEnum } from '@shared/generated/eperusteet';
import { isKoulutustyyppiSupported } from '@/utils/perusteet';
import { $fail, $t } from '@shared/utils/globals';
import { unref } from 'vue';

export class PerusteStore implements IEditoitava {
  private blocklist = [] as (() => void)[];

  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
    isInitialized: false,
    julkaisut: null as JulkaisuBaseDto[] | null,
    initializing: false,
    validoinnit: null as Array<Validointi> | null,
    julkaisemattomiaMuutoksia: null as boolean | null,
    viimeisinJulkaisuTila: null as string | null,
    tilaPolling: null as any | null,
    muutosmaaraykset: null as MaaraysDto[] | null,
    maarays: null as MaaraysDto | null,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly suoritustavat = computed(() => _.map(this.state.peruste?.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)) as string[]);
  public readonly perusteId = computed(() => this.state.peruste?.id);
  public readonly projektiId = computed(() => this.state.projekti?.id);
  public readonly julkaisukielet = computed(() => (this.state.peruste?.kielet || []) as unknown as Kieli[]);
  public readonly validoinnit = computed(() => this.state.validoinnit);
  public readonly isAmmatillinen = computed(() => isAmmatillinenKoulutustyyppi(this.state.peruste?.koulutustyyppi));
  public readonly isVapaasivistystyo = computed(() => isVapaasivistystyoKoulutustyyppi(this.state.peruste?.koulutustyyppi));
  public readonly julkaisut = computed(() => this.state.julkaisut);
  public readonly isPohja = computed(() => _.toLower(this.state.peruste?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.POHJA));
  public readonly isNormaali = computed(() => _.toLower(this.state.peruste?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.NORMAALI));
  public readonly pdfEnabled = computed(() => isKoulutustyyppiPdfTuettu(this.state.peruste?.koulutustyyppi));
  public readonly koulutustyyppiSupported = computed(() => isKoulutustyyppiSupported(this.state.peruste?.koulutustyyppi));
  public readonly julkaisemattomiaMuutoksia = computed(() => this.state.julkaisemattomiaMuutoksia);
  public readonly isJulkaistu = computed(() => (_.size(this.state.julkaisut) > 0 || this.state.peruste?.tila === PerusteDtoTilaEnum.VALMIS) && _.toLower(this.state.peruste?.tila) !== _.toLower(PerusteDtoTilaEnum.POISTETTU));
  public readonly viimeisinJulkaisuTila = computed(() => this.state.viimeisinJulkaisuTila);
  public readonly arkistointiReroute = computed(() => _.toLower(this.state.peruste?.tyyppi) === _.toLower(PerusteDtoTyyppiEnum.DIGITAALINENOSAAMINEN) ? 'digitaalisetosaamiset' : unref(this.isPohja) ? 'pohjat' : 'perusteprojektit');
  public readonly muutosmaaraykset = computed(() => this.state.muutosmaaraykset ? _.reverse(_.sortBy(this.state.muutosmaaraykset, 'voimassaoloAlkaa')) : null);
  public readonly isInitialized = computed(() => this.state.isInitialized);
  public readonly maarays = computed(() => this.state.maarays);

  public readonly isOpas = computed(() => {
    if (this.state.peruste) {
      return _.lowerCase((this.state.peruste as PerusteDto).tyyppi) === _.lowerCase(PerusteDtoTyyppiEnum.OPAS);
    }

    return false;
  });

  public readonly perusteSuoritustapa = computed(() => {
    if (unref(this.isOpas)) {
      return 'OPAS';
    }
    else if (perusteenSuoritustapa(this.state.peruste)) {
      return perusteenSuoritustapa(this.state.peruste);
    }
    else {
      return 'REFORMI';
    }
  });

  public readonly navigation = computed(() => {
    if (!this.state.peruste || !this.state.navigation) {
      return null;
    }

    if (isAmmatillinenKoulutustyyppi(this.state.peruste?.koulutustyyppi) && !unref(this.isOpas)) {
      return {
        ...this.state.navigation,
        children: [
          ...(this.state.navigation.children || []), {
            type: 'kvliite',
            children: [],
          },
        ],
      };
    }

    return this.state.navigation;
  });

  public async updateValidointi() {
    if (this.state.projekti?.id) {
      this.state.validoinnit = null;
      if (_.toLower(this.state.peruste?.tila) !== _.toLower(PerusteDtoTilaEnum.POISTETTU)) {
        try {
          const res = await Perusteprojektit.getPerusteprojektiValidointi(this.state.projekti!.id!);
          this.state.validoinnit = res.data;
        }
        catch (e) {
          this.state.validoinnit = [];
          $fail($t('validointi-epaonnistui'));
        }
      }
      else {
        this.state.validoinnit = [];
      }
    }

    await this.fetchJulkaisemattomiaMuutoksia();
  }

  clear() {
    this.state.peruste = null;
    this.state.projekti = null;
    this.state.validoinnit = null;
    this.state.julkaisut = null;
  }

  async init(projektiId: number) {
    if (this.state.initializing || (this.state.isInitialized && projektiId === unref(this.projektiId))) {
      return;
    }

    try {
      this.state.initializing = true;
      this.state.isInitialized = false;
      this.state.peruste = null;
      this.state.projekti = null;
      this.state.validoinnit = null;
      this.state.julkaisut = null;
      Murupolku.tyhjenna();
      this.state.projekti = (await Perusteprojektit.getPerusteprojekti(projektiId)).data;
      const perusteId = Number((this.state.projekti as any)._peruste);

      [
        this.state.peruste,
        this.state.navigation,
      ] = _.map(await Promise.all([
        Perusteet.getPerusteenTiedot(perusteId),
        Perusteet.getNavigation(perusteId),
      ]), 'data');

      await this.updateValidointi();
      await this.fetchJulkaisut();

      this.state.isInitialized = true;
    }
    catch (err) {
      $fail($t('perusteen-hakeminen-epaonnistui'));
    }
    finally {
      this.state.initializing = false;
    }
  }

  async updateCurrent() {
    this.state.projekti = (await Perusteprojektit.getPerusteprojekti(this.state.projekti!.id!)).data;
    this.state.peruste = (await Perusteet.getPerusteenTiedot(this.state.peruste!.id!)).data;

    await this.updateValidointi();
  }

  public async updateNavigation() {
    if (!unref(this.perusteId)) {
      return;
    }
    const res = await Perusteet.getNavigation(unref(this.perusteId)!);
    this.state.navigation = res.data;
  }

  public removeNavigationEntry(item: { id: number }) {
    if (this.state.navigation) {
      this.state.navigation = this.removeImpl(this.state.navigation, item);
    }
  }

  removeImpl(node: NavigationNodeDto, item: { id: number }): NavigationNodeDto {
    node.children = _(node.children || [])
      .reject(child => child.id === item.id)
      .map(child => this.removeImpl(child, item))
      .value();
    return node;
  }

  public updateNavigationEntry(item: { id: number, label: { [key: string]: string }}) {
    if (this.state.navigation) {
      this.state.navigation = this.updateImpl(this.state.navigation, item);
    }
  }

  updateImpl(node: NavigationNodeDto, item: { id: number, label: { [key: string]: string }}): NavigationNodeDto {
    node.children = _(node.children || [])
      .map(child => {
        if (child.id === item.id) {
          return { ...child, label: item.label };
        }
        return child;
      })
      .map(child => this.updateImpl(child, item))
      .value();
    return node;
  }

  public async blockUntilInitialized(): Promise<void> {
    return new Promise(resolve => {
      if (this.state.isInitialized) {
        resolve();
      }
      else {
        this.blocklist.push(resolve);
      }
    });
  }

  private readonly blockResolver = watch(this.isInitialized, () => {
    if (this.state.isInitialized) {
      while (this.blocklist.length > 0) {
        const fn = this.blocklist.shift();
        if (fn) {
          fn();
        }
      }
    }
  });

  async julkaise(tiedot: any) {
    const projektiId = this.state.projekti?.id;
    if (projektiId) {
      await Julkaisut.teeJulkaisu(projektiId, tiedot);
      await this.fetchJulkaisut();
      if (!_.includes(_.map(this.state.julkaisut, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
        await this.updateCurrent();
      }
    }
  }

  async updateJulkaisu(julkaisuData: any) {
    const perusteId = this.state.peruste?.id;
    if (perusteId) {
      await Julkaisut.updateJulkaisu(perusteId, julkaisuData);
      await this.fetchJulkaisut();
      if (!_.includes(_.map(this.state.julkaisut, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
        await this.updateCurrent();
      }
    }
  }

  async fetchJulkaisut() {
    this.state.julkaisut = (await Julkaisut.getJulkaisut(unref(this.perusteId)!)).data;
    if (_.includes(_.map(this.state.julkaisut, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
      await this.fetchViimeisinJulkaisuTila();
      await this.pollTila();
    }
  }

  async fetchViimeisinJulkaisuTila() {
    this.state.viimeisinJulkaisuTila = (await Julkaisut.viimeisinJulkaisuTila(unref(this.perusteId)!)).data;

    if (this.state.viimeisinJulkaisuTila !== JulkaisuBaseDtoTilaEnum.KESKEN) {
      clearInterval(this.state.tilaPolling);
      this.state.tilaPolling = null;
      this.state.julkaisut = (await Julkaisut.getJulkaisut(unref(this.perusteId)!)).data;
      await this.updateCurrent();
    }
  }

  async pollTila() {
    if (this.state.viimeisinJulkaisuTila === JulkaisuBaseDtoTilaEnum.KESKEN) {
      this.state.tilaPolling = setInterval(() => this.fetchViimeisinJulkaisuTila(), 2500);
    }
  }

  async palautaJulkaisu(julkaisu: any) {
    const projektiId = this.state.projekti?.id;
    if (projektiId) {
      const res = (await Julkaisut.aktivoiJulkaisu(projektiId, julkaisu.revision)).data as any;
      this.state.julkaisut = [...this.state.julkaisut!, res.data];
      await this.updateCurrent();
      await this.fetchJulkaisut();
    }
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.state.julkaisemattomiaMuutoksia = null;
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.julkaisemattomiaMuutoksia(unref(this.perusteId)!)).data;
  }

  public async fetchMaaraykset() {
    this.state.muutosmaaraykset = null;
    this.state.maarays = null;
    this.state.muutosmaaraykset = (await Maaraykset.getPerusteenMuutosmaaraykset(unref(this.perusteId)!)).data;
    this.state.maarays = (await Maaraykset.getMaaraysPerusteella(Number((this.state.projekti as any)._peruste))).data;
  }

  public async tallennaMuutosmaarays(muutosmaarays) {
    if (muutosmaarays.id) {
      const tallennettu = (await Maaraykset.updateMaarays(muutosmaarays.id, muutosmaarays)).data;
      this.state.muutosmaaraykset = _.map(this.state.muutosmaaraykset, nykyinen => {
        return nykyinen.id === tallennettu.id ? tallennettu : nykyinen;
      });
    }
    else {
      const tallennettu = (await Maaraykset.addMaarays(muutosmaarays)).data;
      this.state.muutosmaaraykset = [
        ...(this.state.muutosmaaraykset || []),
        tallennettu,
      ];
    }
  }

  public async poistaMuutosmaarays(poistettavaMuutosmaarays) {
    await Maaraykset.deleteMaarays(poistettavaMuutosmaarays.id, unref(this.perusteId)!);
    this.state.muutosmaaraykset = _.reject(this.state.muutosmaaraykset, muutosmaarays => muutosmaarays.id === poistettavaMuutosmaarays.id);
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async remove() {
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async save() {
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {
    };
  });
}
