<template>
  <div class="content">

    <div class="row">
      <div class="col">
        <h3>{{$t('aikataulu')}}</h3>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { success } from '@/utils/notifications';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpAikataulu,
    EpAikatauluModal,
  },
})
export default class EpPerusteAikataulu extends Vue {

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .pohja {
    margin: 10px 0px;
    background-color: $gray-lighten-8;
    border-radius: 15px;
    height: 15px;
    position: relative;

    .kulunut-aika {
      background-color: $green-lighten-3;
      border-radius: 15px;
      height: 15px;
      position: absolute;
    }

    .aikataulu {
      height: 15px;
      width: 15px;
      border-radius: 30px;
      position: absolute;

      &.tavoite {
        background-color: $blue;
      }

      &.julkaisu {
        background-color: $blue-lighten-2;
      }
    }

  }

  .alainfo {
    position: relative;

    .julkaisu {
      position: absolute;
    }
  }

  .luomispaiva {
    border-left: 1px solid $gray-lighten-3;
    padding-left: 5px;
  }

  .julkaisupaiva {
    border-right: 1px solid $gray-lighten-3;
    padding-right: 5px;
  }

  .paiva-alatieto {
    color: $gray-lighten-1;
  }

</style>
