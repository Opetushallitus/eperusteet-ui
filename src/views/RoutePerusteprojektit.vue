<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="perusteetStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'perusteprojektiLuonti' }"
                              :eiTuetutKoulutustyypit="eiTuetutKoulutustyypit">
      <h2 slot="upperheader">{{ $t('perusteprojektisi') }}</h2>
      <h2 slot="published-header">{{ $t('julkaistut-perusteet') }}</h2>
      <h2 slot="lowerheader">{{ $t('kaikki-perusteprojektit') }}</h2>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { EiTuetutKoulutustyypit } from '@/utils/perusteet';

@Component({
  components: {
    EpMainView,
    EpPerusteprojektiListaus,
  },
})
export default class RoutePerusteprojektit extends Vue {
  @Prop({ required: true })
  perusteetStore!: PerusteetStore;

  get eiTuetutKoulutustyypit() {
    return EiTuetutKoulutustyypit;
  }
}
</script>
