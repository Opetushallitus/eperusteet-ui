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

    <template v-if="lisasisaltoLisays.length > 0">
      <template v-for="(lisasisalto, index) in lisasisaltoLisays">

        <b-dropdown v-if="lisasisalto.groupedSisalto.length > 0"
                    :key="'lisasisalto'+index"
                    variant="link"
                    class="lisasisalto-dropdown"
                    toggle-class="text-decoration-none"
                    no-caret>
          <template v-slot:button-content>
            <ep-button variant="link" buttonClass="text-decoration-none">
              <fas class="mr-2" icon="plussa"/>
              {{ $t(lisasisalto.linkkiteksti) }}
            </ep-button>
          </template>

          <div v-for="(groupedLisasisalto, index) in lisasisalto.groupedSisalto" :key="'groupedLisasisalto'+index">

            <hr v-if="index > 0" class="mt-2 mb-2"/>

            <ep-tekstikappale-lisays
              @save="groupedLisasisalto.save"
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

        <ep-tekstikappale-lisays
          v-else
          :key="'lisasisalto'+index"
          @save="lisasisalto.save"
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

  async tallennaUusiKotoLaajaAlainenOsaaminen(otsikko, tekstikappaleIsa) {
    window.alert('Ei vielä toteutettu!!!');
    // try {
    //   const tkstore = new LaajaalainenOsaaminenStore(this.peruste!.id!, 0);
    //   const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
    //   await this.perusteStore.updateNavigation();
    //   await this.$router.push({
    //     name: 'laajaalainenosaaminen',
    //     params: {
    //       laajaalainenosaaminenId: '' + tallennettu!.id,
    //     },
    //   });
    // }
    // catch (e) {
    //   this.$fail(this.$t('sisallon-lisaaminen-epaonnistui') as string);
    // }
  }

  get isLisasisaltoLisays() {
    return !!this.peruste && !!this.koulutustyypinLisasisaltoLisays[this.peruste.koulutustyyppi!];
  }

  get lisasisaltoLisays() {
    return this.koulutustyypinLisasisaltoLisays[this.peruste!.koulutustyyppi!];
  }

  get koulutustyypinLisasisaltoLisays() {
    return {
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
          linkkiteksti: 'tavoitteet-ja-keskeiset-sisallot',
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
