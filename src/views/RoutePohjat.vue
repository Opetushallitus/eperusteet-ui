<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="pohjatStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'pohjaLuonti' }"
                              :is-pohja="true"
                              :luontioikeus="{ 'oikeus': 'hallinta', 'kohde': 'pohja' }"
                              :showCards="$isAdmin()">
      <template #upperheader>
        <h2>{{ $t('pohjasi') }}</h2>
      </template>
      <template #lowerheader>
        <h2>{{ $t('kaikki-pohjat') }}</h2>
      </template>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';

@Component({
  components: {
    EpMainView,
    EpPerusteprojektiListaus,
  },
})
export default class RoutePohjat extends Vue {
  @Prop({ required: true })
  pohjatStore!: PerusteetStore;
}
</script>

<style lang="scss">
</style>
