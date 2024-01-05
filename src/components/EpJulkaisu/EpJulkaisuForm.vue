<template>
  <div>
    <div class="mb-5" v-if="muutosmaarays">
      <b-form-group :label="$t('lataa-uusi-muutosmaaraus') + asterisk">
        <ep-tiedosto-lataus ref="tiedostoLataus" :fileTypes="['application/pdf']" v-model="file" :as-binary="true" v-if="!file" />
        <div v-if="julkaisuLiitteet && julkaisuLiitteet.length > 0">
          <table class="table">
            <thead>
            <tr>
              <th class="w-40">{{ $t('nimi') }}*</th>
              <th class="w-20">{{ $t('kieli') }}*</th>
              <th class="w-30">{{ $t('tiedosto') }}</th>
              <th class="w-10">{{ $t('poista') }}</th>
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
              <td class="file-name">
                <span>{{ liiteData.liite.nimi }}</span>
              </td>
              <td>
                <ep-button variant="link" icon="delete" @click="poistaLiite(index)"></ep-button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </b-form-group>

      <b-form-group :label="$t('muutosmaarays-astuu-voimaan') + asterisk" class="mt-4 col-lg-3">
        <ep-datepicker v-model="julkaisu.muutosmaaraysVoimaan"
                        :is-editing="true"/>
      </b-form-group>
    </div>

    <b-form-group :label="$t('tiedote-hallintanakymaan')">
      <div class="mb-3">{{ $t('tiedote-naytetaan-taman-sivun-julkaisuhistoriassa') }}</div>
      <ep-content v-model="julkaisu.tiedote"
                  layout="simplified"
                  :is-editable="true" />
      <ep-toggle v-model="julkaisu.julkinen" :isSWitch="false" class="mt-4" :is-editing="!isLatest">
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
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import EpTiedostoLataus from '@shared/components/EpTiedosto/EpTiedostoLataus.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import { Validations } from 'vuelidate-property-decorators';
import { validationMixin } from 'vuelidate';
import { notNull } from '@shared/validators/required';
import { requiredIf } from 'vuelidate/lib/validators';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpTiedostoLataus,
    EpContent,
    EpDatepicker,
    EpToggle,
    EpButton,
    EpMultiSelect,
    EpInput,
    EpMaterialIcon,
  },
})
export default class EpJulkaisuForm extends Mixins(validationMixin) {
  @Prop({ required: true })
  private store!: PerusteStore;

  @Prop({ required: true })
  private julkaisu: any;

  @Prop({ default: false, type: Boolean })
  private isLatest!: boolean;

  @Prop({ default: false, type: Boolean })
  private muutosmaarays!: boolean;

  private file: any | null = null;

  @Validations()
  validations = {
    julkaisu: {
      liitteet: {
        $each: {
          nimi: notNull(),
          kieli: notNull(),
        },
        required: requiredIf(() => this.julkaisu.muutosmaaraysVoimaan),
      },
      muutosmaaraysVoimaan: {
        required: requiredIf(() => this.julkaisu.liitteet.length > 0),
      },
    },
  };

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
    (this.$refs['tiedostoLataus'] as any).resetFile();
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

  get isMuutosmaaraysDataRequired() {
    return this.julkaisuLiitteet.length > 0 || this.julkaisu.muutosmaaraysVoimaan;
  }

  get asterisk() {
    return this.isMuutosmaaraysDataRequired ? '*' : '';
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
    this.$emit('setInvalid', this.$v.$invalid);
  }
};
</script>

<style lang="scss" scoped>

::v-deep table {
  table-layout: fixed;
}

.w-10 {
  width: 10%;
}

.w-20 {
  width: 20%;
}

.w-30 {
  width: 30%;
}

.file-name {
  vertical-align: middle;
  overflow: auto;
}

</style>
