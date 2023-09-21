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
        <EpButton variant="outline" :disabled="isEditing" icon="add" @click="lisaaOppiaine" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-oppiaine')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0 pb-2" v-if="data.oppiaineet.length > 0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
      </b-row>

      <draggable
        v-bind="defaultDragOptions"
        tag="div"
        v-model="data.oppiaineet">

        <b-row v-for="(oppiaine, index) in data.oppiaineet" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
          <b-col cols="5" class="d-flex">
            <div class="order-handle mr-2" v-if="isEditing">
              <fas icon="grip-vertical"></fas>
            </div>
            <div>
              <router-link :to="{ name: 'perusopetusoppiaine', params: { oppiaineId: oppiaine.id } }">
                <span v-if="oppiaine.nimi">{{ $kaanna(oppiaine.nimi) }}</span>
                <span v-else>{{$t('nimeton-oppiaine')}}</span>
                <span v-if="oppiaine.koodiArvo"> ({{ oppiaine.koodiArvo }})</span>
              </router-link>
            </div>
          </b-col>
        </b-row>
      </draggable>
    </template>

  </EpEditointi>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { PerusopetusOppiaineetStore } from '@/stores/PerusopetusOppiaineetStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import draggable from 'vuedraggable';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';

@Component({
  components: {
    EpButton,
    EpEditointi,
    draggable,
  },
})
export default class RouteOppiaineet extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: EditointiStore | null = null;

  async mounted() {
    const store = new PerusopetusOppiaineetStore(this.perusteId!, this.perusteStore);
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
    }];
  }

  async lisaaOppiaine() {
    const newOppiaine = await PerusopetusOppiaineStore.create(this.perusteId);
    await this.perusteStore.updateNavigation();
    await EditointiStore.cancelAll();
    this.$router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
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
