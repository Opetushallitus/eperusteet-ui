<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="oppaatStore"
                              :edit-route="'opas'"
                              :new-route="{ name: 'opasLuonti' }">
      <h2 slot="upperheader">{{ $t('oppaat') }}</h2>
      <h2 slot="lowerheader">{{ $t('kaikki-oppaat') }}</h2>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { PerusteStore } from '@/stores/PerusteStore';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpPerusteprojektiListaus,
  },
})
export default class RouteOppaat extends Vue {
  @Prop({ required: true })
  oppaatStore!: PerusteStore;
}
</script>

<style lang="scss">
</style>
