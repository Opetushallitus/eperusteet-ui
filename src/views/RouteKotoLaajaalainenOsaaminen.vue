<template>
  <div>Tahan tulee koton laaja-alaiset osaamiset</div>
</template>

<script lang="ts">

import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { PerusteStore } from '@/stores/PerusteStore';

export default class RouteKotoLaajaalainenOsaaminen extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  kotoLaajaalainenOsaaminenId!: number;
}

</script>
