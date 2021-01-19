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
        <div class="asteikko mt-4" v-for="(asteikko, idx) in arviointiasteikot" :key="asteikko.id">
          <span class="text-nowrap">
            <h3>{{$t('arviointiasteikko') + ' ' + (idx+1)}}</h3>
            <ep-spinner v-if="!asteikko.osaamistasot" />
            <div v-else>
              <div
                v-for="(taso, index) in asteikko.osaamistasot"
                :key="taso.id"
                class="taso py-2"
                :class="{ 'pl-3': !isEditing, 'is-editing': isEditing }">
                <template v-if="!isEditing">
                  {{ $kaanna(taso.otsikko) }}
                </template>
                <b-form-group
                  :label="$t('osaamistaso') + ' ' + (index + 1)"
                  v-else>
                  <ep-input
                    :name="$t('osaamistaso')"
                    v-model="taso.otsikko"
                    :is-editing="true"/>
                </b-form-group>
              </div>
            </div>
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
import EpInput from '@shared/components/forms/EpInput.vue';

import { ArviointiStore } from '@/stores/ArviointiStore';

import { ArviointiAsteikkoDto, OsaamistasoDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpMainView,
    EpIcon,
    EpJulkiLista,
    EpButton,
    EpSpinner,
    EpInput,
  },
})
export default class RouteArviointiasteikot extends Vue {
  @Prop({ required: true })
  arviointiStore!: ArviointiStore;

  private isEditing = false;
  private isSaving = false;
  private arviointiasteikot: ArviointiAsteikkoDto[] | null = null;

  mounted() {
    this.init();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.init();
    }
  }

  async init() {
    await this.arviointiStore.fetchArviointiasteikot();
    this.arviointiasteikot = this.arviointiStore.arviointiasteikot.value as ArviointiAsteikkoDto[];
  }

  async saveArviointiAsteikko() {
    this.isSaving = true;
    this.isEditing = false;

    try {
      await this.arviointiStore.updateArviointiasteikot(this.arviointiasteikot as ArviointiAsteikkoDto[]);
      this.$success(this.$t('arviointiasteikko-tallennettu-onnistuneesti') as string);
    }
    catch (_err) {
      this.$fail(this.$t('arviointiasteikon-tallennus-epaonnistui') as string);
      this.init();
    }
    finally {
      this.isSaving = false;
    }
  }
}
</script>

<style lang="scss">
@import "@shared/styles/_variables.scss";

.asteikko {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;
}

.taso-wrapper {
  min-height: 75vh;
}

.taso {
  &:nth-of-type(even):not(.is-editing) {
    background-color: $table-even-row-bg-color;
  }
  &:nth-of-type(odd):not(.is-editing) {
    background-color: $table-odd-row-bg-color;
  }
}

.form-group {
  margin: 0;
}
</style>
