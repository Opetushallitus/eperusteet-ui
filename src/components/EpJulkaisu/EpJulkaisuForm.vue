<template>
  <div>
    <b-form-group :label="$t('lataa-uusi-muutosmaaraus')">
      <ep-tiedosto-lataus :fileTypes="['application/pdf']" v-model="file" :as-binary="true" v-if="!file" />
      <div v-if="julkaisuLiitteet && julkaisuLiitteet.length > 0">
        <table class="table">
          <thead>
          <tr>
            <th class="w-50">{{ $t('nimi') }}</th>
            <th class="w-20">{{ $t('kieli') }}</th>
            <th class="w-20">{{ $t('tiedosto') }}</th>
            <th class="w-10"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(liiteData, index) in julkaisuLiitteet" :key="'liite'+index">
            <td>
              <ep-input v-model="liiteData.nimi" :is-editing="true"></ep-input>
            </td>
            <td>
              <ep-multi-select v-model="liiteData.kieli"
                               :options="julkaisukielet"
                               :searchable="false"
                               :clear-on-select="false"
                               :allowEmpty="false">
                <template v-slot:singleLabel="{ option }">{{ $t(option) }}</template>
                <template v-slot:option="{ option }">{{ $t(option) }}</template>
                <template v-slot:tag="{ option }">{{ $t(option) }}</template>
              </ep-multi-select>
            </td>
            <td class="vertical-center">
              <span>{{ liiteData.liite.nimi }}</span>
            </td>
            <td>
              <ep-button variant="link" icon="roskalaatikko" @click="poistaLiite(index)"></ep-button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
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
import { PerusteStore } from '@/stores/PerusteStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import _ from 'lodash';

@Component({
  components: {
    EpTiedostoLataus,
    EpContent,
    EpDatepicker,
    EpToggle,
    EpButton,
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

  lisaaLiite() {
    this.julkaisuLiitteet.push({
      data: window.btoa(this.file.binary),
      kieli: '',
      nimi: this.file.file.name,
      liite: {
        nimi: this.file.file.name,
        tyyppi: 'julkaisumuutosmaarays',
      },
    });
    this.file = null;
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

  @Watch('file')
  fileChange() {
    if (this.file) {
      this.lisaaLiite();
    }
  }

  @Watch('julkaisuLiitteet', { deep: true })
  liitteetChange() {
    this.checkValidity();
  }

  @Watch('julkaisu.muutosmaaraysVoimaan')
  julkaisuChange() {
    this.checkValidity();
  }

  checkValidity() {
    let isInvalid = true;
    if (this.julkaisu.liitteet.length > 0 && this.julkaisu.muutosmaaraysVoimaan) {
      isInvalid = _.some(this.julkaisu.liitteet, liite => {
        return _.isEmpty(_.get(liite, 'nimi')) || _.isEmpty(_.get(liite, 'kieli'));
      });
    }
    else if (this.julkaisu.liitteet.length === 0 && !this.julkaisu.muutosmaaraysVoimaan) {
      isInvalid = false;
    }
    this.$emit('setInvalid', isInvalid);
  }
};
</script>

<style lang="scss" scoped>

.w-10 {
  width: 10% !important;
}

.w-20 {
  width: 20% !important;
}

.vertical-center {
  vertical-align: middle;
}

</style>
