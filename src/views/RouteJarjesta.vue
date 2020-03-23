<template>
  <ep-spinner v-if="!store" />
  <EpEditointi v-else :store="store">
    <template #header="{ data }">
      <h2>{{ $t('rakenne') }}</h2>
    </template>
    <template #default="{ data, isEditing }">
      <EpJarjesta
        v-model="data.lapset"
        childField="lapset"
        group="sisaltoJarjestysGroup"
        :is-editable="isEditing">
        <template #default="{ node }">
          <span>
            {{ $kaanna(node.perusteenOsa.nimi) }}
          </span>
        </template>
      </EpJarjesta>
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
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';

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

  async onProjektiChange(projektiId: number) {
    if (this.perusteId) {
      const tkstore = new TekstiRakenneStore(this.perusteId);
      this.store = new EditointiStore(tkstore);
    }
  }
}
</script>
