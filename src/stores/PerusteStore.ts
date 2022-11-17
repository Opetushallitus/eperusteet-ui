import Vue from 'vue';
import VueCompositionApi, { watch, reactive, computed } from '@vue/composition-api';
import { Julkaisut, NavigationNodeDto, PerusteprojektiDto, PerusteDto, Ulkopuoliset, Perusteprojektit, Perusteet, TilaUpdateStatus, PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { Kieli } from '@shared/tyypit';
import { Murupolku } from '@shared/stores/murupolku';
import { isAmmatillinenKoulutustyyppi, isVapaasivistystyoKoulutustyyppi, perusteenSuoritustapa, isKoulutustyyppiPdfTuettu } from '@shared/utils/perusteet';
import _ from 'lodash';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteDtoTilaEnum } from '@shared/generated/eperusteet';
import { isKoulutustyyppiSupported } from '@/utils/perusteet';

Vue.use(VueCompositionApi);

export class PerusteStore implements IEditoitava {
  private blocklist = [] as (() => void)[];

  private state = reactive({
    projekti: null as PerusteprojektiDto | null,
    peruste: null as PerusteDto | null,
    navigation: null as NavigationNodeDto | null,
    perusteId: null as number | null,
    isInitialized: false,
    julkaisut: null as any,
    initializing: false,
    projektiStatus: null as TilaUpdateStatus | null,
    julkaisemattomiaMuutoksia: null as boolean | null,
  });

  public readonly projekti = computed(() => this.state.projekti);
  public readonly peruste = computed(() => this.state.peruste);
  public readonly suoritustavat = computed(() => _.map(this.state.peruste?.suoritustavat, suoritustapa => _.toString(suoritustapa.suoritustapakoodi)) as string[]);
  public readonly perusteId = computed(() => this.state.perusteId);
  public readonly projektiId = computed(() => this.state.projekti?.id);
  public readonly tutkinnonOsat = computed(() => this.state.perusteId);
  public readonly julkaisukielet = computed(() => (this.state.peruste?.kielet || []) as unknown as Kieli[]);
  public readonly projektiStatus = computed(() => this.state.projektiStatus);
  public readonly isAmmatillinen = computed(() => isAmmatillinenKoulutustyyppi(this.state.peruste?.koulutustyyppi));
  public readonly isVapaasivistystyo = computed(() => isVapaasivistystyoKoulutustyyppi(this.state.peruste?.koulutustyyppi));
  public readonly julkaisut = computed(() => this.state.julkaisut);
  public readonly isPohja = computed(() => this.state.peruste?.tyyppi === _.toLower(PerusteDtoTyyppiEnum.POHJA));
  public readonly pdfEnabled = computed(() => isKoulutustyyppiPdfTuettu(this.peruste.value?.koulutustyyppi));
  public readonly koulutustyyppiSupported = computed(() => isKoulutustyyppiSupported(this.peruste.value?.koulutustyyppi));
  public readonly julkaisemattomiaMuutoksia = computed(() => this.state.julkaisemattomiaMuutoksia);
  public readonly isJulkaistu = computed(() => (_.size(this.julkaisut.value) > 0 || this.peruste.value?.tila === PerusteDtoTilaEnum.VALMIS) && this.peruste.value?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU));

  public readonly isOpas = computed(() => {
    if (this.state.peruste) {
      return _.lowerCase((this.state.peruste as PerusteDto).tyyppi) === _.lowerCase(PerusteDtoTyyppiEnum.OPAS);
    }
  });

  public readonly perusteSuoritustapa = computed(() => {
    if (this.state.peruste) {
      if (this.isOpas.value) {
        return 'OPAS';
      }
      else if (perusteenSuoritustapa(this.peruste.value)) {
        return perusteenSuoritustapa(this.peruste.value);
      }
      else {
        return 'REFORMI';
      }
    }
  });

  public readonly navigation = computed(() => {
    if (!this.state.peruste || !this.state.navigation) {
      return null;
    }

    if (isAmmatillinenKoulutustyyppi(this.state.peruste?.koulutustyyppi)) {
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
      this.state.projektiStatus = null;
      if (this.peruste.value?.tila !== _.toLower(PerusteDtoTilaEnum.POISTETTU)) {
        try {
          const res = await Perusteprojektit.getPerusteprojektiValidointi(this.state.projekti!.id!);
          this.state.projektiStatus = res.data;
        }
        catch (e) {
          this.state.projektiStatus = {};
        }
      }
      else {
        this.state.projektiStatus = {};
      }
    }

    await this.fetchJulkaisemattomiaMuutoksia();
  }

  async init(projektiId: number) {
    if (this.state.initializing || (this.state.isInitialized && projektiId === this.projektiId.value)) {
      return;
    }

    try {
      this.state.initializing = true;
      this.state.isInitialized = false;
      this.state.peruste = null;
      this.state.projekti = null;
      this.state.projektiStatus = null;
      this.state.julkaisut = null;
      Murupolku.tyhjenna();

      this.state.projekti = (await Perusteprojektit.getPerusteprojekti(projektiId)).data;
      const perusteId = Number((this.state.projekti as any)._peruste);
      this.state.perusteId = perusteId;

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
      console.error(err);
    }
    finally {
      this.state.initializing = false;
    }
  }

  async updateCurrent() {
    this.state.projekti = (await Perusteprojektit.getPerusteprojekti(this.projekti.value!.id!)).data;
    this.state.peruste = (await Perusteet.getPerusteenTiedot(this.peruste.value!.id!)).data;

    await this.updateValidointi();
  }

  public async updateNavigation() {
    if (!this.state.perusteId) {
      return;
    }
    const res = await Perusteet.getNavigation(this.state.perusteId);
    this.state.navigation = res.data;
  }

  public removeNavigationEntry(item: { id: number, type: string }) {
    if (this.state.navigation) {
      this.state.navigation = this.removeImpl(this.state.navigation, item);
    }
  }

  removeImpl(node: NavigationNodeDto, item: { id: number, type: string }): NavigationNodeDto {
    node.children = _(node.children || [])
      .reject(child => child.id === item.id && child.type === item.type)
      .map(child => this.removeImpl(child, item))
      .value();
    return node;
  }

  public updateNavigationEntry(item: { id: number, type: string, label: { [key: string]: string }}) {
    if (this.state.navigation) {
      this.state.navigation = this.updateImpl(this.state.navigation, item);
    }
  }

  updateImpl(node: NavigationNodeDto, item: { id: number, type: string, label: { [key: string]: string }}): NavigationNodeDto {
    node.children = _(node.children || [])
      .map(child => {
        if (child.id === item.id && child.type === item.type) {
          return { ...child, label: item.label };
        }

        return child;
      })
      .map(child => this.updateImpl(child, item))
      .value();
    return node;
  }

  public async blockUntilInitialized() {
    return new Promise(resolve => {
      if (this.state.isInitialized) {
        resolve();
      }
      else {
        this.blocklist.push(resolve);
      }
    });
  }

  private readonly blockResolver = watch(() => {
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
      const res = await Julkaisut.teeJulkaisu(projektiId, tiedot);
      this.state.julkaisut = [...this.state.julkaisut, res.data];
      await this.updateCurrent();
    }
  }

  async palautaJulkaisu(julkaisu: any) {
    const projektiId = this.state.projekti?.id;
    if (projektiId) {
      const res = await Julkaisut.aktivoiJulkaisu(projektiId, julkaisu.revision);
      this.state.julkaisut = [...this.state.julkaisut, res.data];
      await this.updateCurrent();
    }
  }

  async fetchJulkaisut() {
    this.state.julkaisut = (await Julkaisut.getJulkaisut(this.state.perusteId!)).data;
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.onkoMuutoksia(this.state.perusteId!)).data;
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
