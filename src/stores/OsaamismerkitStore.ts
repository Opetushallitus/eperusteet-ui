import { computed, reactive } from '@vue/composition-api';
import { Page } from '@shared/tyypit';
import { Osaamismerkit, OsaamismerkitQuery, OsaamismerkkiDto } from '@shared/api/eperusteet';
import { Debounced } from '@shared/utils/delay';
import { OsaamismerkkiKategoriaDto } from '@shared/generated/eperusteet';

export class OsaamismerkitStore {
  private state = reactive({
    osaamismerkkiPage: null as Page<OsaamismerkkiDto> | null,
    query: {} as OsaamismerkitQuery,
    isLoading: false,
    kokonaismaara: 0,
    kategoriat: [] as OsaamismerkkiKategoriaDto[] | null,
  });

  public readonly osaamismerkkiPage = computed(() => this.state.osaamismerkkiPage);
  public readonly osaamismerkit = computed(() => this.state.osaamismerkkiPage?.data || null);
  public readonly kokonaismaara = computed(() => this.state.osaamismerkkiPage?.kokonaismäärä);
  public readonly options = computed(() => this.state.query);
  public readonly kategoriat = computed(() => this.state.kategoriat);

  async init(query: OsaamismerkitQuery) {
    this.state.query = query;
    this.state.osaamismerkkiPage = null;
    await this.fetchKategoriat();
  }

  @Debounced(300)
  public async updateOsaamismerkkiQuery(query: OsaamismerkitQuery) {
    this.state.osaamismerkkiPage = null;
    this.state.osaamismerkkiPage = await this.fetchOsaamismerkitImpl(query);
  }

  private async fetchOsaamismerkitImpl(q: OsaamismerkitQuery) {
    const res = (await Osaamismerkit.findOsaamismerkitBy(
      q.sivu,
      q.sivukoko,
      q.nimi,
      q.tila,
      q.koodit,
      q.kategoria,
      q.voimassa,
      q.tuleva,
      q.poistunut,
      q.kieli,
    )).data as any;
    return res;
  }

  public async fetchKategoriat() {
    this.state.kategoriat = null;
    this.state.kategoriat = (await Osaamismerkit.getKategoriat()).data;
  }

  public async deleteOsaamismerkki(id) {
    await Osaamismerkit.deleteOsaamismerkki(id);
  }

  public async updateOsaamismerkki(osaamismerkki: OsaamismerkkiDto) {
    await Osaamismerkit.updateOsaamismerkki(osaamismerkki);
  }

  public async updateKategoria(kategoria: OsaamismerkkiKategoriaDto) {
    await Osaamismerkit.updateKategoria(kategoria);
  }

  public async deleteKategoria(id) {
    await Osaamismerkit.deleteKategoria(id);
  }
}
