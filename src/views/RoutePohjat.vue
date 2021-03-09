<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="pohjatStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'pohjaLuonti' }"
                              :is-pohja="true"
                              :luontioikeus="{ 'oikeus': 'hallinta', 'kohde': 'pohja' }"
                              :showCards="$isAdmin()">
      <h2 slot="upperheader">{{ $t('pohjasi') }}</h2>
      <h2 slot="lowerheader">{{ $t('kaikki-pohjat') }}</h2>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';

@Component({
  components: {
    EpIcon,
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
