<template>
  <div class="mt-2">
    <ep-tekstikappale-lisays
      :tallenna="tallennaUusiTekstikappale"
      :tekstikappaleet="perusteenOsat"
      :paatasovalinta="true"
      :otsikkoRequired="!tekstikappaleLisatieto.osaamisala"
      v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
      <template v-slot:default="{tekstikappale}">
        <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
        {{ $kaanna(tekstikappale.label) }}
      </template>

      <template #custom-content v-if="osaamisalat.length > 0 ">
        <div class="mb-4">
          <h3>{{ $t('tekstikappaleen-tyyppi') }}</h3>
          <b-form-radio v-model="tekstikappaleTyyppi"
                        value="tekstikappale"
                        name="tekstikappaleTyyppi">{{ $t('tekstikappale') }}</b-form-radio>
          <b-form-radio v-model="tekstikappaleTyyppi"
                        value="osaamisala"
                        name="tekstikappaleTyyppi">{{ $t('osaamisala') }}</b-form-radio>

          <ep-select class="mb-5 mt-2 ml-4"
                v-model="tekstikappaleLisatieto.osaamisala"
                :items="osaamisalat"
                :is-editing="true"
                :enable-empty-option="true"
                :disabled="tekstikappaleTyyppi !== 'osaamisala'"
                :emptyOptionDisabled="true">
            <template slot-scope="{ item }">
              {{ $kaanna(item.nimi) }}
            </template>
          </ep-select>
        </div>
      </template>

    </ep-tekstikappale-lisays>

    <template v-if="lisasisaltoLisays.length > 0">
      <div v-for="(lisasisalto, index) in lisasisaltoLisays" :key="'lisasisalto'+index">

        <b-dropdown v-if="lisasisalto.groupedSisalto && lisasisalto.groupedSisalto.length > 0"
                    variant="link"
                    class="lisasisalto-dropdown mt-2"
                    toggle-class="text-decoration-none"
                    no-caret>
          <template v-slot:button-content>
            <ep-button variant="link" buttonClass="text-decoration-none">
              <EpMaterialIcon :color="'inherit'" :background="'inherit'" size="18px">add</EpMaterialIcon>
              {{ $t(lisasisalto.groupedLinkkiteksti) }}
            </ep-button>
          </template>

          <div v-for="(groupedLisasisalto, index) in lisasisalto.groupedSisalto" :key="'groupedLisasisalto'+index">

            <hr v-if="index > 0" class="mt-2 mb-2"/>

            <ep-tekstikappale-lisays
              :tallenna="groupedLisasisalto.save"
              :tekstikappaleet="perusteenOsat"
              :paatasovalinta="true"
              :otsikkoRequired="false"
              :modalId="'groupedLisasisaltoLisays'+index"
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
              <template v-slot:lisays-btn-icon>
                <span/>
              </template>
              <template v-slot:lisays-btn-text>
                {{ $t(groupedLisasisalto.label['uusi']) }}
              </template>
              <template v-slot:modal-title>
                {{ $t(groupedLisasisalto.label['uusi']) }}
              </template>
              <template v-slot:footer-lisays-btn-text>
                {{ $t(groupedLisasisalto.label['lisaa']) }}
              </template>
              <template v-slot:header>
                {{ $t(groupedLisasisalto.label['sijainti']) }}
              </template>
              <template v-slot:default="{tekstikappale}">
                <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                {{ $kaanna(tekstikappale.label) }}
              </template>
            </ep-tekstikappale-lisays>

          </div>
        </b-dropdown>

        <ep-button
          v-else-if="lisasisalto.call"
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="link"
          buttonClass="text-decoration-none"
          @click="makeCall(lisasisalto.call)"
          :showSpinner="loading">
          <EpMaterialIcon :color="'inherit'" :background="'inherit'" size="18px">add</EpMaterialIcon>
          {{ $t(lisasisalto.label['uusi']) }}
        </ep-button>

        <ep-tekstikappale-lisays
          v-else
          :tallenna="lisasisalto.save"
          :tekstikappaleet="perusteenOsat"
          :paatasovalinta="true"
          :otsikkoRequired="false"
          :modalId="'lisasisaltoLisays'+index"
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          <template v-slot:lisays-btn-text>
            {{ $t(lisasisalto.label['uusi']) }}
          </template>
          <template v-slot:modal-title>
            {{ $t(lisasisalto.label['uusi']) }}
          </template>
          <template v-slot:footer-lisays-btn-text>
            {{ $t(lisasisalto.label['lisaa']) }}
          </template>
          <template v-slot:header>
            {{ $t(lisasisalto.label['sijainti']) }}
          </template>
          <template v-slot:default="{tekstikappale}">
            <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
            {{ $kaanna(tekstikappale.label) }}
          </template>
        </ep-tekstikappale-lisays>
      </div>

    </template>

  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import * as _ from 'lodash';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import { KotoKielitaitotasoStore } from '@/stores/Koto/KotoKielitaitotasoStore';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { NavigationNodeDtoTypeEnum, PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { chapterStringSort } from '@shared/utils/NavigationBuilder';
import { KotoLaajaalainenOsaaminenStore } from '@/stores/Koto/KotoLaajaalainenOsaaminenStore';
import { OsaamiskokonaisuusStore } from '@/stores/OsaamiskokonaisuusStore';
import { TaiteenalaStore } from '@/stores/TaiteenalaStore';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';

@Component({
  components: {
    EpTekstikappaleLisays,
    EpButton,
    EpMaterialIcon,
    EpSelect,
  },
})
export default class EpSisallonLisays extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  naviStore!: EpTreeNavibarStore;

  loading: boolean = false;
  tekstikappaleTyyppi: 'osaamisala' | 'tekstikappale' = 'tekstikappale';
  tekstikappaleLisatieto: any = {};

  get projekti() {
    return this.perusteStore.projekti.value;
  }

  get peruste() {
    return this.perusteStore.peruste.value;
  }

  get tekstikappaleet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Viite);
  }

  get opintokokonaisuudet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }

  get koulutuksenosat() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
  }

  get laajaalaisetosaamiset() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Laajaalainenosaaminen);
  }

  get tavoitesisaltoalueet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Tavoitesisaltoalue);
  }

  get kotoKielitaitotasot() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.KotoKielitaitotaso);
  }

  get kotoOpinnot() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.KotoOpinto);
  }

  get perusteenOsat() {
    return _.sortBy([
      ...this.tekstikappaleet,
      ...this.opintokokonaisuudet,
      ...this.koulutuksenosat,
      ...this.laajaalaisetosaamiset,
      ...this.tavoitesisaltoalueet,
      ...this.kotoKielitaitotasot,
      ...this.kotoOpinnot,
    ], osa => chapterStringSort(osa.chapter));
  }

  get tekstikappaleRoute() {
    if (this.peruste && (this.peruste.tyyppi as any) === 'opas') {
      return 'oppaanTekstikappale';
    }

    return 'tekstikappale';
  }

  async makeCall(call) {
    this.loading = true;
    try {
      await call();
    }
    finally {
      this.loading = false;
    }
  }

  async tallennaUusiTekstikappale(otsikko, tekstikappaleIsa) {
    const tkstore = new TekstikappaleStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa, this.tekstikappaleLisatieto);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: this.tekstikappaleRoute,
      params: {
        tekstiKappaleId: '' + tallennettu!.id,
      },
    });
    this.tekstikappaleLisatieto = {};
  }

  async tallennaUusiOpintokokonaisuus(otsikko, tekstikappaleIsa) {
    const tkstore = new OpintokokonaisuusStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'opintokokonaisuus',
      params: {
        opintokokonaisuusId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiTavoitesisaltoalue(otsikko, tekstikappaleIsa) {
    const tkstore = new TavoitesisaltoalueStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'tavoitesisaltoalue',
      params: {
        tavoitesisaltoalueId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiKoulutuksenOsa(otsikko, tekstikappaleIsa) {
    const tkstore = new KoulutuksenOsaStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'koulutuksenosa',
      params: {
        koulutuksenosaId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiLaajaAlainenOsaaminen(otsikko, tekstikappaleIsa) {
    const tkstore = new LaajaalainenOsaaminenStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'laajaalainenosaaminen',
      params: {
        laajaalainenosaaminenId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaKotoKielitaito(otsikko, tekstikappaleIsa) {
    const tkstore = new KotoKielitaitotasoStore();
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'koto_kielitaitotaso',
      params: {
        kotokielitaitotasoId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaKotoOpinto(otsikko, tekstikappaleIsa) {
    const tallennettu = await new KotoOpintoStore().create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'koto_opinto',
      params: {
        kotoOpintoId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiKotoLaajaAlainenOsaaminen(otsikko, tekstikappaleIsa) {
    const kotoStore = new KotoLaajaalainenOsaaminenStore(this.peruste!.id!, 0);
    const tallennettu = await kotoStore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'koto_laajaalainenosaaminen',
      params: {
        kotoLaajaalainenOsaaminenId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiOsaamiskokonaisuus(otsikko, tekstikappaleIsa) {
    const osaamiskokonaisuusStore = new OsaamiskokonaisuusStore(this.peruste!.id!, 0);
    const tallennettu = await osaamiskokonaisuusStore.create(tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'osaamiskokonaisuus',
      params: {
        osaamiskokonaisuusId: '' + tallennettu!.id,
      },
    });
  }

  async uusiVaihe() {
    this.$router.push({ name: 'aipevaihe' });
  }

  async uusiLukioOppiaine(oppiaineId?) {
    this.$router.push({
      name: 'lukio_oppiaine',
      ...(oppiaineId && { params: { parentId: oppiaineId } }),
    });
  }

  async uusiLukioModuuli(oppiaineId) {
    this.$router.push({
      name: 'moduuli',
      params: {
        oppiaineId,
      },
    });
  }

  async uusiTaiteenala() {
    const taiteenalaStore = new TaiteenalaStore(this.peruste!.id!, 0);
    const tallennettu = await taiteenalaStore.create();
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: 'taiteenala',
      params: {
        taiteenalaId: '' + tallennettu!.id,
        uusi: 'uusi',
      },
    });
  }

  async uusiPerusopetusoppiaine() {
    const newOppiaine = await PerusopetusOppiaineStore.create(this.peruste!.id!, this.$route.params?.oppiaineId);
    await this.perusteStore.updateNavigation();
    this.$router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
  }

  get isLisasisaltoLisays() {
    return !!this.peruste && (!!this.koulutustyypinLisasisaltoLisays[this.peruste.koulutustyyppi!] || !!this.perusteTyyppiSisaltoLisays[this.peruste.tyyppi!]);
  }

  get lisasisaltoLisays() {
    return this.koulutustyypinLisasisaltoLisays[this.peruste!.koulutustyyppi!] || this.perusteTyyppiSisaltoLisays[this.peruste!.tyyppi!] || [];
  }

  get oppiaineId() {
    return this.$route.params?.oppiaineId;
  }

  get lukioSisaltoLisays() {
    return [
      ...(this.oppiaineId && !this.currentLukioOppimaara ? [
        {
          call: () => this.uusiLukioOppiaine(this.oppiaineId),
          label: {
            'uusi': 'uusi-oppimaara',
          },
        },
      ] : []),
      ...(this.oppiaineId ? [
        {
          call: () => this.uusiLukioModuuli(this.oppiaineId),
          label: {
            'uusi': 'uusi-moduuli',
          },
        },
      ] : []),
      {
        call: this.uusiLukioOppiaine,
        label: {
          'uusi': 'uusi-oppiaine',
        },
      },
    ];
  }

  get currentLukioOppimaara() {
    if (this.oppiaineId) {
      return _.get(_.find(this.naviStore.connected.value, node => node.id === _.toNumber(this.oppiaineId)), 'depth') === 3;
    }
  }

  get koulutustyypinLisasisaltoLisays() {
    return {
      [Koulutustyyppi.aikuistenperusopetus]: [
        {
          groupedSisalto: [],
          call: this.uusiVaihe,
          label: {
            'uusi': 'uusi-vaihe',
          },
        },
      ],
      [Koulutustyyppi.tpo]: [
        {
          groupedSisalto: [],
          call: this.uusiTaiteenala,
          label: {
            'uusi': 'uusi-taiteenala',
          },
        },
      ],
      [Koulutustyyppi.perusopetus]: [
        {
          groupedSisalto: [],
          call: this.uusiPerusopetusoppiaine,
          label: {
            'uusi': this.$route.params?.oppiaineId ? 'uusi-oppimaara' : 'uusi-oppiaine',
          },
        },
      ],
      [Koulutustyyppi.lukiokoulutus]: [
        ...this.lukioSisaltoLisays,
      ],
      [Koulutustyyppi.aikuistenlukiokoulutus]: [
        ...this.lukioSisaltoLisays,
      ],
      [Koulutustyyppi.vapaasivistystyo]: [
        {
          groupedSisalto: [],
          save: this.tallennaUusiOpintokokonaisuus,
          label: {
            'uusi': 'uusi-opintokokonaisuus',
            'lisaa': 'lisaa-opintokokonaisuus',
            'sijainti': 'opintokokonaisuuden-sijainti',
          },
        }],
      [Koulutustyyppi.vapaasivistystyolukutaito]: [
        {
          groupedSisalto: [],
          save: this.tallennaUusiTavoitesisaltoalue,
          label: {
            'uusi': 'tavoitteet-ja-sisaltoalueet',
            'lisaa': 'lisaa-tavoite-ja-sisaltoalue',
            'sijainti': 'tavoite-ja-sisaltoalue-sijainti',
          },
        }],
      [Koulutustyyppi.maahanmuuttajienkotoutumiskoulutus]: [
        {
          groupedLinkkiteksti: 'tavoitteet-ja-keskeiset-sisallot',
          groupedSisalto: [
            {
              save: this.tallennaKotoKielitaito,
              label: {
                'uusi': 'kielitaitotasot',
                'lisaa': 'lisaa-kielitaitotaso',
                'sijainti': 'kielitaitotasot-sijainti',
              },
            },
            {
              save: this.tallennaKotoOpinto,
              label: {
                'uusi': 'tyoelama-ja-yhteiskuntataitojen-opinnot',
                'lisaa': 'lisaa-tyoelama-ja-yhteiskuntataitojen-opinto',
                'sijainti': 'tyoelama-ja-yhteiskuntataitojen-opinnot-sijainti',
              },
            },
          ],
        },
        {
          groupedSisalto: [],
          save: this.tallennaUusiKotoLaajaAlainenOsaaminen,
          label: {
            'uusi': 'uusi-laaja-alainen-osaaminen',
            'lisaa': 'lisaa-laaja-alainen-osaaminen-perusteen-osa',
            'sijainti': 'laaja-alaisen-osaamisen-sijainti',
          },
        },
      ],
      [Koulutustyyppi.tutkintoonvalmentava]: [
        {
          groupedSisalto: [],
          save: this.tallennaUusiKoulutuksenOsa,
          label: {
            'uusi': 'uusi-koulutuksenosa',
            'lisaa': 'lisaa-koulutuksenosa',
            'sijainti': 'koulutuksen-osan-sijainti',
          },
        },
        {
          groupedSisalto: [],
          save: this.tallennaUusiLaajaAlainenOsaaminen,
          label: {
            'uusi': 'uusi-laaja-alainen-osaaminen',
            'lisaa': 'lisaa-laaja-alainen-osaaminen-perusteen-osa',
            'sijainti': 'laaja-alaisen-osaamisen-sijainti',
          },
        },
      ],
    };
  }

  get perusteTyyppiSisaltoLisays() {
    return {
      [_.toLower(PerusteDtoTyyppiEnum.DIGITAALINENOSAAMINEN)]: [
        {
          groupedSisalto: [],
          save: this.tallennaUusiOsaamiskokonaisuus,
          label: {
            'uusi': 'uusi-osaamiskokonaisuus',
            'lisaa': 'lisaa-osaamiskokonaisuus',
            'sijainti': 'osaamiskokonaisuuden-sijainti',
          },
        }],
    };
  }

  get osaamisalat() {
    return this.perusteStore.peruste.value?.osaamisalat;
  }

  @Watch('tekstikappaleTyyppi')
  osaamisalatChange() {
    if (this.tekstikappaleTyyppi === 'tekstikappale') {
      this.tekstikappaleLisatieto.osaamisala = null;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.lisasisalto-dropdown ::v-deep ep-button,
.navigation ::v-deep .ep-button .btn {
  font-size: 14px;
}

.lisasisalto-dropdown ::v-deep {
  .btn {
    &.dropdown-toggle {
      padding: 0;
      border: 0;

      .btn {
        padding-top: 0px;
      }
    }
  }
}

.lisasisalto-dropdown ::v-deep .dropdown-menu .ep-button .btn {
  color: $black;
  padding: 0;
}

</style>
