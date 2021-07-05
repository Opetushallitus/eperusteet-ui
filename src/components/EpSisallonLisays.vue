<template>
  <div class="mt-2">
    <ep-tekstikappale-lisays
      @save="tallennaUusiTekstikappale"
      :tekstikappaleet="perusteenOsat"
      :paatasovalinta="true"
      v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
      <template v-slot:default="{tekstikappale}">
        <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
        {{ $kaanna(tekstikappale.label) }}
      </template>
    </ep-tekstikappale-lisays>

    <template v-if="isLisasisaltoLisays">
      <ep-tekstikappale-lisays
        v-if="lisasisaltoLisays.length === 1"
        @save="lisasisaltoLisays[0].save"
        :tekstikappaleet="perusteenOsat"
        :paatasovalinta="true"
        :otsikkoRequired="false"
        modalId="lisasisaltoLisays"
        v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
        <template v-slot:lisays-btn-text>
          {{$t(lisasisaltoLisays[0].label['uusi'])}}
        </template>
        <template v-slot:modal-title>
          {{$t(lisasisaltoLisays[0].label['uusi'])}}
        </template>
        <template v-slot:footer-lisays-btn-text>
          {{$t(lisasisaltoLisays[0].label['lisaa'])}}
        </template>
        <template v-slot:header>
          {{$t(lisasisaltoLisays[0].label['sijainti'])}}
        </template>
        <template v-slot:default="{tekstikappale}">
          <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
          {{ $kaanna(tekstikappale.label) }}
        </template>
      </ep-tekstikappale-lisays>

      <b-dropdown v-else-if="lisasisaltoLisays.length > 1 && lisasisaltoLisays[0].linkkiteksti" variant="link" class="lisasisalto-dropdown" toggle-class="text-decoration-none" no-caret>
        <template v-slot:button-content>
          <ep-button variant="link" buttonClass="text-decoration-none">
            <fas class="mr-2" icon="plussa" />
            {{$t(lisasisaltoLisays[0].linkkiteksti)}}
          </ep-button>
        </template>

        <div v-for="(lisasisalto, index) in lisasisaltoLisays" :key="'lisasisalto'+index">

          <hr v-if="index > 0" class="mt-2 mb-2" />

          <ep-tekstikappale-lisays
            @save="lisasisalto.save"
            :tekstikappaleet="perusteenOsat"
            :paatasovalinta="true"
            :otsikkoRequired="false"
            :modalId="'lisasisaltoLisays'+index"
            v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
            <template v-slot:lisays-btn-icon>
              <span/>
            </template>
            <template v-slot:lisays-btn-text>
              {{$t(lisasisalto.label['uusi'])}}
            </template>
            <template v-slot:modal-title>
              {{$t(lisasisalto.label['uusi'])}}
            </template>
            <template v-slot:footer-lisays-btn-text>
              {{$t(lisasisalto.label['lisaa'])}}
            </template>
            <template v-slot:header>
              {{$t(lisasisalto.label['sijainti'])}}
            </template>
            <template v-slot:default="{tekstikappale}">
              <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
              {{ $kaanna(tekstikappale.label) }}
            </template>
          </ep-tekstikappale-lisays>

        </div>
      </b-dropdown>

      <template v-else-if="lisasisaltoLisays.length > 1">
        <ep-tekstikappale-lisays
            v-for="(lisasisalto, index) in lisasisaltoLisays" :key="'lisasisalto'+index"
            @save="lisasisalto.save"
            :tekstikappaleet="perusteenOsat"
            :paatasovalinta="true"
            :otsikkoRequired="false"
            :modalId="'lisasisaltoLisays'+index"
            v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
            <template v-slot:lisays-btn-text>
              {{$t(lisasisalto.label['uusi'])}}
            </template>
            <template v-slot:modal-title>
              {{$t(lisasisalto.label['uusi'])}}
            </template>
            <template v-slot:footer-lisays-btn-text>
              {{$t(lisasisalto.label['lisaa'])}}
            </template>
            <template v-slot:header>
              {{$t(lisasisalto.label['sijainti'])}}
            </template>
            <template v-slot:default="{tekstikappale}">
              <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
              {{ $kaanna(tekstikappale.label) }}
            </template>
          </ep-tekstikappale-lisays>
      </template>

    </template>

  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import * as _ from 'lodash';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import { KotoKielitaitotasoStore } from '@/stores/KotoKielitaitotasoStore';
import { KotoOpintoStore } from '@/stores/KotoOpintoStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { NavigationNodeDtoTypeEnum } from '@shared/api/eperusteet';
import { chapterStringSort } from '@shared/utils/NavigationBuilder';

@Component({
  components: {
    EpTekstikappaleLisays,
    EpButton,
  },
})
export default class EpSisallonLisays extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  naviStore!: EpTreeNavibarStore;

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

  async tallennaUusiTekstikappale(otsikko, tekstikappaleIsa) {
    const tkstore = new TekstikappaleStore(this.peruste!.id!, 0);
    const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    await this.perusteStore.updateNavigation();
    await this.$router.push({
      name: this.tekstikappaleRoute,
      params: {
        tekstiKappaleId: '' + tallennettu!.id,
      },
    });
  }

  async tallennaUusiOpintokokonaisuus(otsikko, tekstikappaleIsa) {
    try {
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
    catch (e) {
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  async tallennaUusiTavoitesisaltoalue(otsikko, tekstikappaleIsa) {
    try {
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
    catch (e) {
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  async tallennaUusiKoulutuksenOsa(otsikko, tekstikappaleIsa) {
    try {
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
    catch (e) {
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  async tallennaUusiLaajaAlainenOsaaminen(otsikko, tekstikappaleIsa) {
    try {
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
    catch (e) {
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  async tallennaKotoKielitaito(otsikko, tekstikappaleIsa) {
    try {
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
    catch (e) {
      console.log(e);
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  async tallennaKotoOpinto(otsikko, tekstikappaleIsa) {
    try {
      const tallennettu = await new KotoOpintoStore().create(otsikko, tekstikappaleIsa);
      await this.perusteStore.updateNavigation();
      await this.$router.push({
        name: 'koto_opinto',
        params: {
          kotoOpintoId: '' + tallennettu!.id,
        },
      });
    }
    catch (e) {
      this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    }
  }

  get isLisasisaltoLisays() {
    return !!this.peruste && !!this.koulutustyypinLisasisaltoLisays[this.peruste.koulutustyyppi!];
  }

  get lisasisaltoLisays() {
    return this.koulutustyypinLisasisaltoLisays[this.peruste!.koulutustyyppi!];
  }

  get koulutustyypinLisasisaltoLisays() {
    return {
      [Koulutustyyppi.vapaasivistystyo]: [{
        save: this.tallennaUusiOpintokokonaisuus,
        label: {
          'uusi': 'uusi-opintokokonaisuus',
          'lisaa': 'lisaa-opintokokonaisuus',
          'sijainti': 'opintokokonaisuuden-sijainti',
        },
      }],
      [Koulutustyyppi.vapaasivistystyolukutaito]: [{
        save: this.tallennaUusiTavoitesisaltoalue,
        label: {
          'uusi': 'tavoitteet-ja-sisaltoalueet',
          'lisaa': 'lisaa-tavoite-ja-sisaltoalue',
          'sijainti': 'tavoite-ja-sisaltoalue-sijainti',
        },
      }],
      [Koulutustyyppi.maahanmuuttajienkotoutumiskoulutus]: [
        {
          linkkiteksti: 'tavoitteet-ja-keskeiset-sisallot',
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
        }],
      [Koulutustyyppi.tutkintoonvalmentava]: [{
        save: this.tallennaUusiKoulutuksenOsa,
        label: {
          'uusi': 'uusi-koulutuksenosa',
          'lisaa': 'lisaa-koulutuksenosa',
          'sijainti': 'koulutuksen-osan-sijainti',
        },
      }, {
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
      border:0;

      .btn {
        padding-top: 0px;
      }
    }
  }
}

.lisasisalto-dropdown ::v-deep .dropdown-menu .ep-button .btn{
  color: $black;
  padding: 0;
}

</style>
