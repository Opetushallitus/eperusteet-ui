<template>
  <div>
    <b-modal ref="modal" size="lg">
      <template slot="modal-header">
      </template>
      <template v-slot:modal-footer="{ ok, cancel }">
        <ep-button variant="secondary" @click="onClose">{{ $t('peruuta') }}</ep-button>
        <ep-button variant="primary" :disabled="!model" @click="onOk">{{ $t('ok') }}</ep-button>
      </template>

      <b-form-group :label="$t('arviointiasteikot')">
        <b-form-radio-group v-model="model" @change="onInput" stacked>
          <b-form-radio :value="asteikko.id" v-for="asteikko in asteikot" :key="asteikko.id">
            <span class="text-nowrap">
              <span v-for="(taso, idx) in asteikko.osaamistasot" :key="'taso-' + taso.id">
                <span v-if="idx !== 0" class="text-muted">/</span>
                {{ $kaanna(taso.otsikko) }}
              </span>
            </span>
          </b-form-radio>
        </b-form-radio-group>
      </b-form-group>
    </b-modal>
    <ep-button @click="onOpen" variant="outline" icon="plus">{{ $t('valitse-arviointiasteikko') }}</ep-button>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ArviointiStore } from '@/stores/ArviointiStore';
import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet';
import { BvTableFieldArray } from 'bootstrap-vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import * as _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpInput,
    EpMainView,
    EpSpinner,
  },
})
export default class GeneerinenArviointi extends Vue {
  @Prop({ default: null })
  value!: number | null;

  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private model: number | null = null;

  @Watch('value', { immediate: true })
  onValueChange(value: number | null) {
    this.model = value;
  }

  get asteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  onInput(value: number | null) {
    this.model = value;
  }

  onOk() {
    this.$emit('input', this.model);
    this.model = null;
    (this.$refs.modal as any).hide();
  }

  onClose() {
    this.model = null;
    (this.$refs.modal as any).hide();
  }

  onOpen() {
    (this.$refs.modal as any).show();
  }
}
</script>

<style lang="scss" scoped>
</style>
