<template>
  <div>
    <VueDraggable
      v-bind="dragOptions"
      v-model="tjsData.tavoitealueet"
      tag="div"
    >
      <div
        v-for="(tavoitealue, index) in tjsData.tavoitealueet"
        :key="'tavoitealue' + index"
        class="tavoitealue p-3 mb-4"
      >
        <div class="flex items-center mb-2">
          <div class="order-handle tavoitealue-handle mr-1">
            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
          </div>
          <span class="otsikko">{{ $t('tavoitealueen-otsikko') }}</span>
        </div>

        <div class="pl-5">
          <EpInput
            v-model="tavoitealue.nimi"
            class="mb-2"
            :is-editing="true"
          />

          <div class="otsikko mb-2">
            {{ $t('opiskelija-osaa') }}
          </div>
          <EpLukutaitoTekstilista
            v-model="tavoitealue.tavoitteet"
            lisaa-teksti="lisaa-tavoite"
          >
            <template #toiminnot>
              <EpButton
                variant="link"
                icon="delete"
                @click="poista(index)"
              >
                {{ $t('poista-tavoitealue') }}
              </EpButton>
            </template>
          </EpLukutaitoTekstilista>
        </div>
      </div>
    </VueDraggable>

    <EpButton
      variant="outline"
      icon="add"
      @click="lisaa()"
    >
      {{ $t('lisaa-tavoitealue') }}
    </EpButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { $t } from '@shared/utils/globals';
import EpLukutaitoTekstilista from './EpLukutaitoTekstilista.vue';

const props = defineProps<{
  tavoitteetJaSisaltoalueet: any;
}>();

const tjsData = computed(() => props.tavoitteetJaSisaltoalueet);

const dragOptions = computed(() => ({
  ...DEFAULT_DRAGGABLE_PROPERTIES,
  emptyInsertThreshold: 10,
  handle: '.tavoitealue-handle',
  disabled: false,
  group: {
    name: 'lukutaitotavoitealueet',
  },
}));

const lisaa = () => {
  tjsData.value.tavoitealueet.push({ nimi: {}, tavoitteet: [] });
};

const poista = (index: number) => {
  tjsData.value.tavoitealueet.splice(index, 1);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.tavoitealue {
  border: 1px solid $gray-lighten-3;
  border-radius: 3px;
}

.otsikko {
  font-weight: 600;
}
</style>
