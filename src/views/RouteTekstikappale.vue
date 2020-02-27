<template>
  <div>
    <pre>{{ $route.name }}</pre>
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';


@Component
export default class RouteTekstikappale extends Vue {
}
</script>

<style lang="scss" scoped>
</style>

