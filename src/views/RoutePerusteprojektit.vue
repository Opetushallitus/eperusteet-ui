<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="perusteetStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'perusteprojektiLuonti' }"
                              :eiTuetutKoulutustyypit="eiTuetutKoulutustyypit">
      <template #upperheader>
        <h2>{{ $t('perusteprojektisi') }}</h2>
      </template>
      <template #published-header>
        <h2>{{ $t('julkaistut-perusteet') }}</h2>
      </template>
      <template #lowerheader>
        <h2>{{ $t('kaikki-perusteprojektit') }}</h2>
      </template>
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
