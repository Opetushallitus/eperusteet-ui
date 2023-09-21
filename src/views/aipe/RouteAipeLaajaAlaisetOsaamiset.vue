<template>
  <EpEditointi :store="store">
    <template #header>
      <h3>{{$t('laaja-alaiset-osaamiset')}}</h3>
    </template>
    <template #muokkaa>
      {{$t('muokkaa-jarjestysta')}}
    </template>
    <template #default="{ data, isEditing }">
      <div class="d-flex justify-content-end">
        <EpButton variant="outline" icon="add" @click="lisaaLaajaAlainenOsaaminen" :disabled="isEditing" v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
          {{ $t('uusi-laaja-alainen-osaaminen')}}
        </EpButton>
      </div>

      <b-row class="border-bottom-1 m-0">
        <b-col cols="5" class="font-weight-bold">{{$t('nimi')}}</b-col>
        <b-col cols="5" class="font-weight-bold">{{$t('muokattu')}}</b-col>
      </b-row>

      <draggable
        v-bind="defaultDragOptions"
        tag="div"
        v-model="data.laajaAlaisetOsaamiset">

        <b-row v-for="(lao, index) in data.laajaAlaisetOsaamiset" :key="'lao'+index" class="taulukko-rivi-varitys py-3 m-0">
          <b-col cols="5" class="d-flex">
            <div class="order-handle mr-2" v-if="isEditing">
              <fas icon="grip-vertical"></fas>
            </div>
            <div>
              <router-link :to="{ name: 'aipelaajaAlainenOsaaminen', params: { laoId: lao.id } }">{{ $kaanna(lao.nimi) }}</router-link>
            </div>
          </b-col>
          <b-col cols="5">
            <span v-if="lao.muokattu">{{$sdt(lao.muokattu)}}</span>
          </b-col>
        </b-row>
      </draggable>
    </template>
  </EpEditointi>

</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AipeLaajaAlaisetOsaamisetStore } from '@/stores/AipeLaajaAlaisetOsaamisetStore';
import { PerusteStore } from '@/stores/PerusteStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import draggable from 'vuedraggable';

@Component({
  components: {
    EpButton,
    EpSpinner,
    draggable,
    EpEditointi,
  },
})
export default class RouteAipeLaajaAlaisetOsaamiset extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  store: EditointiStore | null = null;

  async mounted() {
    const store = new AipeLaajaAlaisetOsaamisetStore(this.perusteId!, this.perusteStore);
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

  lisaaLaajaAlainenOsaaminen() {
    this.$router.push({
      name: 'aipelaajaAlainenOsaaminen',
    });
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'laot',
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
