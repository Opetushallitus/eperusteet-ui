<template>
  <EpMainView>
    <EpPerusteprojektiListaus :provider="perusteetStore"
                              :edit-route="'perusteprojekti'"
                              :new-route="{ name: 'perusteprojektiLuonti' }">
      <h2 slot="upperheader">{{ $t('perusteprojektisi') }}</h2>
      <h2 slot="lowerheader">{{ $t('kaikki-perusteprojektit') }}</h2>
    </EpPerusteprojektiListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPerusteprojektiListaus from '@/components/EpPerusteprojektiListaus/EpPerusteprojektiListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { KayttajaStore } from '@/stores/kayttaja';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpPerusteprojektiListaus,
  },
})
export default class RoutePerusteprojektit extends Vue {
  @Prop({ required: true })
  perusteetStore!: PerusteetStore;
}
</script>
