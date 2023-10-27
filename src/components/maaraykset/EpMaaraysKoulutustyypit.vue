<template>
  <div>

    <template v-if="isEditing">
      <div v-for="(koulutustyyppi, index) in model" :key="'koulutustyyppi' + index" class="d-flex align-items-center mb-2">
        <KoulutustyyppiSelect v-model="model[index]" :isEditing="isEditing" required class="w-40"/>

        <div class="default-icon clickable ml-2" @click="poistaKoulutustyyppi(koulutustyyppi)">
          <EpMaterialIcon>delete</EpMaterialIcon>
        </div>

      </div>
      <ep-button @click="lisaaKoulutustyyppi()" variant="outline" icon="add">
        {{ $t('lisaa-koulutustyyppi') }}
      </ep-button>
    </template>

    <div v-else class="ml-2">
      <KoulutustyyppiSelect v-for="(koulutustyyppi, index) in model" :key="'koulutustyyppi' + index" :value="koulutustyyppi"/>
    </div>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpMaterialIcon from '@shared/components//EpMaterialIcon/EpMaterialIcon.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    KoulutustyyppiSelect,
    EpMaterialIcon,
    EpButton,
  },
})
export default class EpMaaraysKoulutustyypit extends Vue {
  @Prop({ required: true })
  value!: any[];

  @Prop({ required: false })
  isEditing!: boolean;

  set model(val) {
    this.$emit('input', val);
  }

  get model() {
    return this.value;
  }

  poistaKoulutustyyppi(koulutustyyppi) {
    this.model = _.without(this.model, koulutustyyppi);
  }

  lisaaKoulutustyyppi() {
    this.model = [
      ...this.model,
      {},
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
