<template>
  <div>
    <b-form-group :label="$t('lataa-uusi-muutosmaaraus')">
      <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="file" :as-binary="true" v-if="!file" />
      <div v-if="file">
        <table class="table">
          <thead>
          <tr>
            <th class="w-50">{{ $t('nimi') }}</th>
            <th class="w-30">{{ $t('kieli') }}</th>
            <th class="w-20"></th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              <ep-input v-model="liitteenNimi" :is-editing="true"></ep-input>
            </td>
            <td>
              <ep-multi-select v-model="liitteenKieli"
                               :options="julkaisukielet"
                               :searchable="false"
                               :clear-on-select="false"
                               :allowEmpty="false">
                <template v-slot:singleLabel="{ option }">{{ $t(option) }}</template>
                <template v-slot:option="{ option }">{{ $t(option) }}</template>
                <template v-slot:tag="{ option }">{{ $t(option) }}</template>
              </ep-multi-select>
            </td>
            <td>
              <b-button @click="peruutaLiite()" variant="secondary">
                {{ $t('peruuta') }}
              </b-button>
              <b-button @click="lisaaLiite()" icon="plus" variant="primary" :disabled="!liitteenNimi || !liitteenKieli">
                {{ $t('lisaa-liite') }}
              </b-button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <b-table v-if="julkaisuLiitteet && julkaisuLiitteet.length > 0"
               :items="julkaisuLiitteet"
               :fields="liitetableFields"
               responsive
               borderless
               striped
               fixed
               hover>
        <template v-slot:cell(toiminnot)="data">
          <div class="text-center">
            <ep-button variant="link" icon="roskalaatikko" @click="poistaLiite(data.index)"></ep-button>
          </div>
        </template>
      </b-table>
    </b-form-group>

    <b-form-group :label="$t('muutosmaarays-astuu-voimaan')" class="mt-4 col-lg-3">
      <ep-datepicker v-model="julkaisu.muutosmaaraysVoimaan" :is-editing="true"/>
    </b-form-group>

    <b-form-group :label="$t('tiedote-hallintanakymaan')" class="mt-4">
      <div class="mb-3">{{ $t('tiedote-naytetaan-taman-sivun-julkaisuhistoriassa') }}</div>
      <ep-content v-model="julkaisu.tiedote"
                  layout="simplified"
                  :is-editable="true" />
      <ep-toggle v-model="julkaisu.julkinen" :isSWitch="false" class="mt-4">
        {{$t('julkaisu-naytetaan-julkisen-sivuston-julkaisuhistoriassa')}}
      </ep-toggle>
    </b-form-group>
    <b-form-group v-if="julkaisu.julkinen" :label="$t('tiedote-julkiselle-sivustolle')" class="mt-4">
      <div class="mb-3">{{ $t('tiedote-naytetaan-perusteen-tiedot-näkyman-julkaisuhistoriassa') }}</div>
      <ep-content v-model="julkaisu.julkinenTiedote"
                  layout="simplified"
                  :is-editable="true" />
    </b-form-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedostoLataus/EpTiedostoLataus.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpJulkaisuLiitteet from './EpJulkaisuLiitteet.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpInput from '@shared/components/forms/EpInput.vue';

@Component({
  components: {
    EpTiedostoLataus,
    EpContent,
    EpDatepicker,
    EpToggle,
    EpButton,
    EpJulkaisuLiitteet,
    EpMultiSelect,
    EpInput,
  },
})
export default class EpJulkaisuForm extends Vue {
  @Prop({ required: true })
  private store!: PerusteStore;

  @Prop({ required: true })
  private julkaisu: any;

  private file: any | null = null;
  private liitteenNimi = '';
  private liitteenKieli = '';

  async lisaaLiite() {
    this.julkaisuLiitteet.push({
      data: window.btoa(this.file.binary),
      kieli: this.liitteenKieli,
      liite: {
        nimi: this.liitteenNimi,
        tyyppi: 'julkaisumuutosmaarays',
      },
    });
    this.resetValues();
  }

  peruutaLiite() {
    this.resetValues();
  }

  resetValues() {
    this.file = null;
    this.liitteenNimi = '';
    this.liitteenKieli = '';
  }

  async poistaLiite(index) {
    Vue.delete(this.julkaisuLiitteet, index);
  }

  get perusteId() {
    return this.store.perusteId.value;
  }

  get julkaisukielet() {
    return this.store.julkaisukielet.value;
  }

  get julkaisuLiitteet() {
    return this.julkaisu.liitteet;
  }

  get liitetableFields() {
    return [{
      key: 'liite.nimi',
      label: this.$t('nimi'),
      thStyle: { width: '50%' },
      sortable: true,
    },
    {
      key: 'kieli',
      label: this.$t('kieli'),
      sortable: true,
      thStyle: { width: '30%' },
      formatter: (value: any) => {
        return (this as any).$t(value);
      },
    },
    {
      key: 'toiminnot',
      label: '',
      thStyle: { width: '20%', borderBottom: '0px' },
      sortable: false,
    }];
  }

  @Watch('file')
  fileChange() {
    if (this.file) {
      this.liitteenNimi = this.file.file.name;
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
