<template>
  <EpMainView>
    <template slot="icon">
      <EpIcon class="float-right" icon="tyoryhma" background-color="#82D4FF" />
    </template>

    <template slot="header">
      <h1>{{ $t('virheita-sisaltavat-julkiset-perusteet') }}</h1>
    </template>

    <div v-if="validations">
      <b-container fluid>
        <b-row v-for="validation in validations.data" :key="validation.perusteprojekti.id">
          <b-col lg="3">
            <div>
              <div class="projekti-nimi">
                {{ validation.perusteprojekti.nimi }}
              </div>
              <div class="projekti-diaarinumero text-muted">
                {{ validation.perusteprojekti.diaarinumero }}
              </div>
              <div class="projekti-tila">
                {{ $t('tila-' + validation.perusteprojekti.tila) }}
              </div>
            </div>
          </b-col>
          <b-col lg="9" class="p-4">
            <ul>
              <li v-for="(info, idx) in validation.infot" :key="idx">
                {{ $t(info.viesti) }}
                <ul v-if="info.nimet.length > 0">
                  <li v-for="nimi in info.nimet" :key="nimi._id">
                  </li>
                </ul>
              </li>
            </ul>
          </b-col>
        </b-row>
      </b-container>
      <b-pagination
        v-model="sivu"
        align="center"
        per-page="sivukoko"
        />
    </div>
    <ep-spinner v-else />

  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';

@Component({
  components: {
    EpMainView,
    EpIcon,
    EpSpinner,
  },
})
export default class RouteVirheellisetPerusteet extends Vue {
  @Prop({ required: true })
  virheellisetPerusteetStore!: VirheellisetPerusteetStore;

  mounted() {
    this.virheellisetPerusteetStore.updateFilters(0, 10);
  }

  get validations() {
    return this.virheellisetPerusteetStore.validations.value;
  }

  get sivukoko() {
    return this.virheellisetPerusteetStore.sivukoko.value;
  }

  get sivu() {
    return this.virheellisetPerusteetStore.sivu.value + 1;
  }

  set sivu(value: number) {
    if (value !== null && this.sivu !== value - 1) {
      this.virheellisetPerusteetStore.updateFilters(value - 1, 10);
    }
  }
}
</script>

<style lang="scss">
</style>
