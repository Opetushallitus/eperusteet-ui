<template>
  <ep-spinner v-if="!store" />
  <EpEditointi v-else :store="store">
    <template #header="{ data }">
      <h2>{{ $t('muokkaa-jarjestysta') }}</h2>
    </template>
    <template #default="{ data, isEditing }">
      <b-tabs content-class="mt-3">
        <b-tab :title="$t('tutkinnon-osat')" v-if="data.tutkinnonOsat">
          <EpJarjesta
            v-model="data.tutkinnonOsat"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing">
          <template #default="{ node }">
            <span>
              {{ $kaanna(node.nimi) }}
            </span>
          </template>
          </EpJarjesta>
        </b-tab>
        <b-tab :title="$t('tekstikappaleet')" v-if="data.tekstit">
          <EpJarjesta
            v-model="data.tekstit.lapset"
            childField="lapset"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing">
          <template #default="{ node }">
            <span>
              {{ $kaanna(node.perusteenOsa.nimi) }}
            </span>
          </template>
          </EpJarjesta>
        </b-tab>
      </b-tabs>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { JarjestysStore } from '@/stores/JarjestysStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';

import { PerusteStore } from '@/stores/PerusteStore';

@Component({
  components: {
    EpEditointi,
    EpIcon,
    EpJarjesta,
    EpMainView,
    EpPerusteprojektiListaus,
    EpSpinner,
  },
})
export default class RouteJarjesta extends PerusteprojektiRoute {
  private store: EditointiStore | null = null;
  private stores: { [key: string]: IEditoitava } = {};

  async onProjektiChange(projektiId: number) {
    if (this.perusteId) {
      this.stores = {
        tekstit: new TekstiRakenneStore(this.perusteId),
      };

      if (this.isAmmatillinen) {
        this.stores.tutkinnonOsat = new TutkinnonOsaStore(this.perusteStore);
      }

      this.store = new EditointiStore(new JarjestysStore(this.stores));
    }
  }
}
</script>
