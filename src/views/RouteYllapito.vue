<template>
  <ep-main-view :container="true">
    <template slot="header">
      <h1>{{ $t('yllapito') }}</h1>
    </template>

    <EpSpinner v-if="!yllapitoTiedot" />
    <template v-else-if="yllapitoTiedot && yllapitoTiedot.length > 0">
      <div class="mt-4">
        <b-table
          striped
          hover
          responsive
          show-empty
          :empty-text="$t('ei-sisaltoa')"
          :items="yllapitoTiedot"
          :fields="fields">

          <template v-slot:cell(kuvaus)="data">
            <ep-input v-model="data.item.kuvaus"/>
          </template>

          <template v-slot:cell(key)="data">
            <ep-input v-model="data.item.key" :is-editing="false" />
          </template>

          <template v-slot:cell(value)="data">
            <ep-toggle v-model="data.item.value" :is-editing="isEditing" v-if="isBoolean(data.item.value)"/>
            <ep-input type="string" v-model="data.item.value" :is-editing="isEditing" v-else/>
          </template>

        </b-table>
      </div>
      <div v-if="!isEditing">
        <ep-button variant="primary ml-2" @click="onEdit()">{{ $t('muokkaa') }}</ep-button>
      </div>
      <div v-else class="d-flex justify-content-between">
        <div>
          <ep-button class="ml-2" variant="primary" @click="onSave()" :disabled="$v.$invalid">{{ $t('tallenna') }}</ep-button>
        </div>
      </div>
      <hr class="my-4"/>
    </template>

    <h2 class="mt-5">{{ $t('julkisivun-perusteiden-jarjestys') }}</h2>
    <EpButton @click="muokkaaPerusteidenJarjestysta" v-if="!isEditingPerusteJarjestys">{{ $t('muokkaa')}}</EpButton>
    <EpButton @click="peruuta" v-if="isEditingPerusteJarjestys" link>{{ $t('peruuta')}}</EpButton>
    <EpButton @click="tallenna" v-if="isEditingPerusteJarjestys">{{ $t('tallenna')}}</EpButton>
    <EpSpinner v-if="!julkisivunPerusteetRyhmiteltyna"/>
    <div v-for="perusteRyhma in julkisivunPerusteetRyhmiteltyna" :key="perusteRyhma.ryhma">
      <h3 class="mt-4">{{ $t(perusteRyhma.ryhma) }}</h3>
      <EpBalloonList v-model="perusteRyhma.perusteet" :isEditing="isEditingPerusteJarjestys" sortable>
        <template v-slot:default="{ item }">
          <div class="d-flex w-100 justify-content-between">
            <div>{{ $kaanna(item.nimi) }}</div>
            <EpToggle v-model="item.piilotaJulkisivulta" :isEditing="isEditingPerusteJarjestys"> {{ $t('piilota-julkisivulta') }}</EpToggle>
          </div>
        </template>
      </EpBalloonList>
    </div>

    <hr/>

    <h2 class="mb-5">{{ $t('muut-toimenpiteet') }}</h2>
    <EpButton @click="amosaaKoulutustoimijaPaivitys()" :showSpinner="amosaaKtPaivitysLoading">{{$t('paivita-amosaa-koulutustoimijat')}}</EpButton>
  </ep-main-view>
</template>

<script lang="ts" >
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { YllapitoStore } from '@/stores/YllapitoStore';
import { YllapitoDto } from '@shared/generated/eperusteet';
import { Validations } from 'vuelidate-property-decorators';
import { notNull } from '@shared/validators/required';
import { Maintenance } from '@shared/api/eperusteet';
import _ from 'lodash';
import { EperusteetKoulutustyyppiRyhmaSort, julkisivuPerusteKoosteJarjestys, themes } from '@shared/utils/perusteet';
import EpBalloonList from '@shared/components/EpBalloonList/EpBalloonList.vue';

@Component({
  components: {
    EpMainView,
    EpButton,
    EpInput,
    EpSpinner,
    EpToggle,
    EpBalloonList,
  },
})
export default class RouteYllapito extends Vue {
  @Prop({ required: true })
  private yllapitoStore!: YllapitoStore;

  private isEditing = false;
  private isEditingPerusteJarjestys = false;
  private yllapitoTiedot: YllapitoDto[] | null = null;
  private amosaaKtPaivitysLoading = false;
  private julkisivunPerusteetRyhmiteltyna: any[] | null = null;

  @Validations()
  validations = {
    inner: {
      $each: {
        kuvaus: notNull(),
        key: notNull(),
        value: notNull(),
      },
    },
  };

  async mounted() {
    this.yllapitoTiedot = await this.yllapitoStore.fetch();
    await this.fetchJulkisivunPerusteet();
  }

  async fetchJulkisivunPerusteet() {
    this.julkisivunPerusteetRyhmiteltyna = null;
    await this.yllapitoStore.fetchJulkisivunPerusteet();
    this.julkisivunPerusteetRyhmiteltyna = this.ryhmittelePerusteet();
  }

  get julkisivunPerusteet() {
    return this.yllapitoStore.julkisivunPerusteet.value;
  }

  ryhmittelePerusteet() {
    const ryhmitetty = _.map(this.julkisivunPerusteet, (peruste) => {
      return {
        ...peruste,
        ryhma: themes[peruste.koulutustyyppi!],
      };
    });

    return _.chain(ryhmitetty)
      .groupBy('ryhma')
      .map((perusteet, ryhma) => {
        return {
          ryhma,
          perusteet: _.chain(perusteet)
            .map(peruste => {
              return {
                ...peruste,
                kaannettyNimi: this.$kaanna(peruste.nimi!),
              };
            })
            .orderBy(julkisivuPerusteKoosteJarjestys.keys, julkisivuPerusteKoosteJarjestys.sortby)
            .value(),
        };
      })
      .orderBy(perusteRyhma => EperusteetKoulutustyyppiRyhmaSort[perusteRyhma.ryhma])
      .value();
  }

  async onSave() {
    await this.yllapitoStore.save(this.yllapitoTiedot!);
    this.$success(this.$t('tallennus-onnistui') as string);
    this.isEditing = false;
  }

  get fields() {
    return [{
      key: 'kuvaus',
      label: this.$t('kuvaus') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }, {
      key: 'key',
      label: this.$t('avain') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }, {
      key: 'value',
      label: this.$t('arvo') as string,
      thStyle: { width: '33%' },
      sortable: false,
    }];
  }

  onEdit() {
    this.isEditing = true;
  }

  isBoolean(val) {
    return val === false || val === true || val === 'false' || val === 'true';
  }

  async amosaaKoulutustoimijaPaivitys() {
    this.amosaaKtPaivitysLoading = true;
    try {
      await Maintenance.paivitaAmosaaKoulutustoimijat();
      this.$success('Päivitys käynnistetty');
    }
    catch (e) {
      this.$success(this.$t('virhe-palvelu-virhe') as string);
    }
    this.amosaaKtPaivitysLoading = false;
  }

  muokkaaPerusteidenJarjestysta() {
    this.isEditingPerusteJarjestys = !this.isEditingPerusteJarjestys;
  }

  async peruuta() {
    this.isEditingPerusteJarjestys = !this.isEditingPerusteJarjestys;
    await this.fetchJulkisivunPerusteet();
  }

  async tallenna() {
    const perusteet = _.chain(this.julkisivunPerusteetRyhmiteltyna)
      .reduce((acc, ryhma) => {
        return acc.concat(ryhma.perusteet);
      }, [])
      .map((peruste, index) => ({
        ...peruste as any,
        julkisivuJarjestysNro: index,
      }))
      .value();

    await this.yllapitoStore.tallennaJulkisivunPerusteet(perusteet);
    this.isEditingPerusteJarjestys = !this.isEditingPerusteJarjestys;
    this.$success(this.$t('tallennus-onnistui') as string);
    await this.fetchJulkisivunPerusteet();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
