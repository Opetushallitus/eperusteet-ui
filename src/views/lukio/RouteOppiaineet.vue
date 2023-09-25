<template>
  <EpEditointi :store="store">
    <template #header>
      <h3>{{$t('oppiaineet')}}</h3>
    </template>
    <template #muokkaa>
      {{$t('muokkaa-jarjestysta')}}
    </template>
    <template #default="{ data, isEditing }">
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="add" @click="lisaaOppiaine" :disabled="isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-oppiaine')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0" v-if="data.oppiaineet.length > 0">
        <b-col cols="5" class="font-weight-bold pb-2">{{$t('nimi')}}</b-col>
      </b-row>

      <draggable
        v-bind="defaultDragOptions"
        tag="div"
        v-model="data.oppiaineet">

        <b-row v-for="(oppiaine, index) in data.oppiaineet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
          <b-col cols="5" class="d-flex">
            <div class="order-handle mr-2" v-if="isEditing">
              <EpMaterialIcon>drag_indicator</EpMaterialIcon>
            </div>
            <div>
              <router-link :to="{ name: 'lukio_oppiaine', params: { oppiaineId: oppiaine.id } }">{{ $kaanna(oppiaine.nimi) }}</router-link>
            </div>
          </b-col>
          <b-col cols="5">
            <span v-if="oppiaine.muokattu">{{$sdt(oppiaine.muokattu)}}</span>
          </b-col>
        </b-row>
      </draggable>
    </template>
  </EpEditointi>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { LukioOppiaineetStore } from '@/stores/LukioOppiaineetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import draggable from 'vuedraggable';

@Component({
  components: {
    EpButton,
    EpSpinner,
    draggable,
    EpEditointi,
    EpMaterialIcon,
  },
})
export default class RouteOppiaineet extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: EditointiStore | null = null;

  async mounted() {
    const store = new LukioOppiaineetStore(this.perusteId!);
    this.store = new EditointiStore(store);
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get fields() {
    return [{
      label: this.$t('nimi'),
      key: 'nimi',
      sortable: true,
    }, {
      label: this.$t('muokattu'),
      key: 'muokattu',
      thStyle: { width: '30%' },
      sortable: true,
      formatter: (value: any, key: string, item: any) => {
        return value != null ? this.$sdt(value) : '';
      },
    }];
  }

  lisaaOppiaine() {
    this.$router.push({
      name: 'lukio_oppiaine',
    });
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'oppiaineet',
      },
    };
  }

  get isEditing() {
    return this.store?.isEditing.value;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
