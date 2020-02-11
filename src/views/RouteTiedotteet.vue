<template>
  <EpMainView>
    <template slot="icon">
      <EpIcon class="float-right" icon="tyoryhma" background-color="#82D4FF" />
    </template>

    <template slot="header">
      <h1>{{ $route.name }}</h1>
    </template>

    Sisältö
  </EpMainView>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';


@Component({
  components: {
    EpMainView,
    EpIcon,
  },
})
export default class RouteTiedotteet extends Vue {
}
</script>


<style lang="scss">
</style>
