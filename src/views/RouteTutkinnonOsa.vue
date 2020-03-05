<template>
  <div v-if="store">
    <EpEditointi :store="store">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <div class="mt-1" v-if="isEditing">
          <h4>{{ $t('tutkinnon-osan-nimi') }}</h4>
          <ep-input v-model="data.tutkinnonOsa.nimi" :is-editing="true"></ep-input>
        </div>

        <div class="mt-4" v-if="data.tutkinnonOsa.koodi">
          <h4>{{ $t('koodi') }}</h4>
          <span>{{ $kaanna(data.tutkinnonOsa.koodi.nimi) }}</span>
          <span class="ml-2">({{ data.tutkinnonOsa.koodi.arvo }})</span>
          <!-- <ep-input type="number" v-model="data.tutkinnonOsa.koodi" :is-editing="isEditing"></ep-input> -->
        </div>

        <div class="mt-4">
          <h4>{{ $t('laajuus') }}</h4>
          <ep-input type="number" v-model="data.laajuus" :is-editing="isEditing"></ep-input>
        </div>

        <div class="mt-4">
          <h4>{{ $t('tutkinnon-suorittaneen-osaaminen') }}</h4>
          <ep-content v-model="data.tutkinnonOsa.ammattitaidonOsoittamistavat" layout="normal" :is-editable="isEditing"></ep-content>
        </div>
        <pre>{{ data }}</pre>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusteStore } from '@/stores/PerusteStore';
import { TutkinnonOsaEditStore } from '@/stores/TutkinnonOsaEditStore';

@Component({
  components: {
    EpContent,
    EpEditointi,
    EpInput,
    EpSpinner,
  },
})
export default class RouteTutkinnonosa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  private store: EditointiStore | null = null;

  get tutkinnonOsaId() {
    return this.$route.params.tutkinnonOsaId;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  @Watch('tutkinnonOsaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }

    await this.perusteStore.blockUntilInitialized();
    const tkstore = new TutkinnonOsaEditStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
  }
}
</script>

<style lang="scss" scoped>
</style>
