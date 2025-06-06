<template>
  <div class="box d-inline-flex flex-column  align-items-center justify-content-center text-center">
    <div class="count">{{props.count}}</div>
    <div class="topic">{{props.topic}}</div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';

const props = defineProps<{
  topic: string;
  count: number;
}>();
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .box {
    width: 125px;
    height: 140px;
    margin-right: 10px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f7f8fc;

    .count {
      font-size: 2.375rem;
      line-height: 1;

      .secondary {
        font-size: 1rem;
        color: $gray-lighten-1;
      }
    }

    .topic {
      font-size: 0.7rem;
      padding-top: 10px;
    }
  }

</style>
