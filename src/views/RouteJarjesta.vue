<template>
  <ep-spinner v-if="!store" />
  <EpEditointi v-else :store="store">
    <template #header>
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
              <EpMaterialIcon v-if="node.perusteenOsa.liite"
                              v-b-popover="{content: $t('tekstikappale-naytetaan-liitteena'), trigger: 'hover'}"
                              size="18px">attach_file</EpMaterialIcon>
            </template>
          </EpJarjesta>
        </b-tab>
        <b-tab :title="$t('vaiheet')" v-if="data.vaiheet">
          <EpJarjesta
            v-model="data.vaiheet.vaiheet"
            group="sisaltoJarjestysGroup"
            :is-editable="isEditing">
          <template #default="{ node }">
            <span>
              {{ $kaanna(node.nimi) }}
            </span>
          </template>
          </EpJarjesta>
        </b-tab>
      </b-tabs>
    </template>
  </EpEditointi>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { JarjestysStore } from '@/stores/JarjestysStore';
import { PerusteprojektiRoute } from './PerusteprojektiRoute';
import { EditointiStore, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import { TekstiRakenneStore } from '@/stores/TekstiRakenneStore';
import { Koulutustyyppi } from '@shared/tyypit';
import { AipeVaiheetStore } from '@/stores/AipeVaiheetStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpEditointi,
    EpJarjesta,
    EpMainView,
    EpSpinner,
    EpMaterialIcon,
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

      if (this.peruste?.koulutustyyppi === Koulutustyyppi.aikuistenperusopetus) {
        this.stores.vaiheet = new AipeVaiheetStore(this.perusteId, this.perusteStore);
      }

      this.store = new EditointiStore(new JarjestysStore(this.stores));
    }
  }
}
</script>
