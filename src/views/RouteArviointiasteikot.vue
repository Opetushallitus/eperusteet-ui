<template>
  <div class="mt-5">
    <div class="d-flex align-items-sm-center justify-content-sm-between flex-sm-row flex-column mb-1">
      <h2 class="m-0">{{ $t('arviointiasteikot') }}</h2>
      <ep-button
        v-if="!isEditing"
        variant="link"
        icon="kyna"
        @click="toggleEdit()"
        class="mt-sm-0 mt-3">
        <slot name="muokkaa">{{ $t('muokkaa') }}</slot>
      </ep-button>
      <div v-else class="mt-sm-0 mt-3">
        <ep-button
          v-if="isEditing"
          variant="link"
          @click="toggleEdit()">
          <slot name="peruuta">{{ $t('peruuta') }}</slot>
        </ep-button>
        <ep-button
          class="ml-2"
          v-if="isEditing"
          variant="primary"
          @click="saveArviointiAsteikko()"
          :show-spinner="isSaving">
          <slot name="tallenna">{{ $t('tallenna') }}</slot>
        </ep-button>
      </div>
    </div>
    <div class="taso-wrapper">
      <template v-if="arviointiasteikot">
        <div class="asteikko mt-4" v-for="(asteikko, idx) in arviointiasteikot" :key="idx">
          <span class="text-nowrap">
            <h3>{{$t('arviointiasteikko') + ' ' + (idx+1)}}</h3>
            <ep-arviointi-asteikko-lista
              :osaamistasot="asteikko.osaamistasot"
              :is-editing="isEditing"
              @osaamistasoInput="setOsaamistasoOtsikko"/>
          </span>
        </div>
      </template>
      <ep-spinner v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

import EpArviointiAsteikkoLista from '@/components/EpArviointiAsteikkoLista/EpArviointiAsteikkoLista.vue'

import { ArviointiStore } from '@/stores/ArviointiStore';

import { ArviointiAsteikkoDto, OsaamistasoDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpMainView,
    EpIcon,
    EpJulkiLista,
    EpButton,
    EpSpinner,
    EpArviointiAsteikkoLista,
  },
})
export default class RouteArviointiasteikot extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private isEditing = false;
  private isSaving = false;
  private arviointiAsteikkoData: ArviointiAsteikkoDto[] | undefined = undefined;

  async mounted() {
    await this.arviointiStore.fetchArviointiasteikot();
    this.arviointiStore.fetchGeneeriset();
    this.arviointiAsteikkoData = this.arviointiStore.arviointiasteikot.value as ArviointiAsteikkoDto[];
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  setOsaamistasoOtsikko(data: OsaamistasoDto) {
    this.arviointiAsteikkoData = this.arviointiStore.arviointiasteikot.value?.map(asteikko => ({
      ...asteikko,
      osaamistasot: asteikko.osaamistasot?.map(taso => {
        if (taso.id === data.id) {
          taso.otsikko = data.otsikko;
        }
        return taso;
      }),
    })
    );
  }

  async saveArviointiAsteikko() {
    this.isSaving = true;
    this.isEditing = false;

    try {
      await this.arviointiStore.updateArviointiasteikot(this.arviointiAsteikkoData);
      this.$success(this.$t('arviointiasteikko-tallennettu-onnistuneesti') as string);
    }
    catch (_err) {
      this.$fail(this.$t('arviointiasteikon-tallennus-epaonnistui') as string);
      this.arviointiStore.fetchArviointiasteikot();
    }
    finally {
      this.isSaving = false;
    }
  }

  get arviointiasteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get geneeriset() {
    return this.arviointiStore.geneeriset.value;
  }
}
</script>

<style lang="scss">
.asteikko {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;
}

.taso-wrapper {
  min-height: 75vh;
}
</style>
