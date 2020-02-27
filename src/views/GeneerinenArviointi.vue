<template>
  <div class="geneerinen" v-if="inner">
    <div class="otsikko" role="button" @click="toggleOpen()">
      <div class="d-flex">
        <div class="flex-grow-1">
          {{ $kaanna(inner.nimi) }}
        </div>
        <div class="flex-shrink-1">
          <fas v-if="isOpen" icon="chevron-up" />
          <fas v-else icon="chevron-down" />
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="sisalto mt-4">
      <div v-if="isEditing && !inner.julkaistu">
        <div class="kohde-otsikko">{{ $t('arvioinnin-nimi') }}</div>
        <ep-input v-model="inner.nimi" :is-editing="true" />
      </div>
      <div class="mt-4">
        <div class="kohde-otsikko">{{ $t('arvioinnin-kohde') }}</div>
        <ep-input v-model="inner.kohde" :is-editing="isEditing" />
      </div>
      <div class="mt-4">
        <b-table
            striped
            hover
            responsive
            show-empty
            :empty-text="$t('ei-sisaltoa')"
            :items="osaamistasot"
            :fields="fields">

          <template v-slot:table-colgroup="scope">
            <col v-for="field in scope.fields" :key="field.key" :style="{ width: field.key === 'osaamistaso' && '160px' }"></col>
          </template>

          <template v-slot:cell(osaamistaso)="data">
            <div class="osaamistaso">{{ $kaanna(data.item.otsikko) }}</div>
          </template>

          <template v-slot:cell(kriteerit)="data">
            <EpBulletEditor kohde="" v-model="data.item.kriteerit" :is-editable="isEditing">
              <template slot="add">{{ $t('lisaa-kriteeri') }}</template>
            </EpBulletEditor>
          </template>
        </b-table>
      </div>
      <EpSpinner v-if="isLoading" />
      <div v-else>
        <div v-if="inner.julkaistu">
          <ep-button variant="primary" @click="onCopy()">{{ $t('kopioi') }}</ep-button>
        </div>
        <div v-else-if="!isEditing">
          <ep-button variant="primary" @click="onEdit()">{{ $t('muokkaa') }}</ep-button>
        </div>
        <div class="d-flex justify-content-between" v-else>
          <div>
            <ep-button variant="link" @click="onCancel()">{{ $t('peruuta') }}</ep-button>
            <ep-button class="ml-2" variant="primary" @click="onSave()">{{ $t('tallenna') }}</ep-button>
            <ep-button class="ml-2" variant="primary" @click="onPublish()">{{ $t('julkaise') }}</ep-button>
          </div>
          <div>
            <ep-button variant="danger" @click="onRemove()">{{ $t('poista') }}</ep-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator'
import EpMainView from '@shared/components/EpMainView/EpMainView.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'
import EpBulletEditor from '@/components/EpBulletEditor/EpBulletEditor.vue'
import EpButton from '@shared/components/EpButton/EpButton.vue'
import { ArviointiStore } from '@/stores/ArviointiStore'
import { ArviointiAsteikkoDto, GeneerinenArviointiasteikkoDto } from '@shared/api/eperusteet'
import { BvTableFieldArray } from 'bootstrap-vue'
import EpInput from '@shared/components/forms/EpInput.vue';
import * as _ from 'lodash'


@Component({
  components: {
    EpBulletEditor,
    EpButton,
    EpInput,
    EpMainView,
    EpSpinner,
  }
})
export default class GeneerinenArviointi extends Vue {
  @Prop({ required: true })
  private value!: GeneerinenArviointiasteikkoDto;

  @Prop({ required: true })
  private arviointiStore!: ArviointiStore;

  private isEditing = false;
  private inner: GeneerinenArviointiasteikkoDto | null = null;
  private isLoading = false;

  @Watch('value', { immediate: true })
  onValueChange(value) {
    this.inner = value;
  }

  get asteikot() {
    return this.arviointiStore.arviointiasteikot.value;
  }

  get osaamistasot() {
    if (!this.asteikot) {
      return null;
    }
    const asteikko = _.find(this.asteikot, asteikko => asteikko.id === _.parseInt((this.value as any)._arviointiAsteikko));
    if (asteikko) {
      return _.map(asteikko.osaamistasot, ot => ({
        ...ot,
        kriteerit: _.find(this.value.osaamistasonKriteerit,
          k => '' + (k as any)._osaamistaso === '' + ot.id)?.kriteerit || [],
      }));
    }
    return null;
  }

  get fields() {
    return [{
      key: 'osaamistaso',
      label: this.$t('osaamistaso') as string,
      sortable: false,
    }, {
      key: 'kriteerit',
      label: this.$t('kriteerit') as string,
      sortable: false,
    }];
  }

  get isOpen() {
    return !this.value.id || this.arviointiStore.closed.value[this.value.id] !== true;
  }

  toggleOpen() {
    this.arviointiStore.toggleOpen(this.value);
  }

  onEdit() {
    this.isEditing = true;
  }

  onCancel() {
    this.inner = this.value;
    this.isEditing = false;
  }

  async onSave() {
    try {
      this.isLoading = true;
      await this.arviointiStore.save(this.inner!);
    }
    finally {
      this.isEditing = false;
      this.isLoading = false;
    }
  }

  async onPublish() {
    await this.$bvModal.msgBoxConfirm(
      this.$t('julkaistaanko-geneerinen-arviointi-kuvaus') as any, {
        title: this.$t('julkaistaanko-geneerinen-arviointi') as any,
        okTitle: this.$t('julkaise') as any,
        cancelTitle: this.$t('peruuta') as any,
        size: 'lg',
      });
    this.isEditing = false;
    await this.arviointiStore.publish(this.inner!);
  }

  async onRemove() {
    await this.$bvModal.msgBoxConfirm(
      this.$t('poistetaanko-geneerinen-arviointi-kuvaus') as any, {
        title: this.$t('poistetaanko-geneerinen-arviointi') as any,
        okTitle: this.$t('poista') as any,
        cancelTitle: this.$t('peruuta') as any,
        size: 'lg',
      });
    await this.arviointiStore.remove(this.inner!);
  }

  async onCopy() {
    await this.$bvModal.msgBoxConfirm(
      this.$t('kopioi-geneerinen-arviointi-kuvaus') as any, {
        title: this.$t('kopioi-geneerinen-arviointi') as any,
        okTitle: this.$t('kopioi') as any,
        cancelTitle: this.$t('peruuta') as any,
        size: 'lg',
      });
    await this.arviointiStore.add({
      ...this.inner!,
      julkaistu: false,
      id: undefined,
    });
  }

}
</script>

<style lang="scss" scoped>
.geneerinen {
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 3px 3px 10px #eee;

  table {
    width: auto !important;
    table-layout: auto !important;
  }

  .osaamistaso {
    font-weight: 600;
  }

  .otsikko {
    font-weight: 600;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .sisalto {
  }

  .kohde-otsikko {
    font-weight: 600;
  }
  .kohde-arvo {
  }
}
</style>
