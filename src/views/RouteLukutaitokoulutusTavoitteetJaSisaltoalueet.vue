<template>
  <EpEditointi
    v-if="editointiStore"
    :store="editointiStore"
    :versionumero="versionumero"
  >
    <template #header="{ data }">
      <h2
        v-if="data.nimi"
        class="!m-0"
      >
        {{ $kaanna(data.nimi) }}
      </h2>
      <h2
        v-else
        class="!m-0"
      >
        {{ $t('nimeton-tavoitteet-ja-sisaltoalueet') }}
      </h2>
    </template>
    <template #default="{ data, isEditing }">
      <template v-if="isEditing">
        <div class="mb-4 lg:w-2/3">
          <EpFormGroup
            class="p-0"
            :label="$t('nimi')"
            required
          >
            <EpInput
              v-model="data.nimi"
              :is-editing="isEditing"
            />
          </EpFormGroup>
        </div>

        <h3 class="mb-3">
          {{ $t('tavoitealueet') }}
        </h3>
        <div class="lg:w-2/3">
          <EpLukutaitoTavoitealueet :tavoitteet-ja-sisaltoalueet="data" />
        </div>
      </template>

      <template v-else>
        <div class="lg:w-2/3">
          <div
            v-for="(tavoitealue, tavoitealueIndex) in data.tavoitealueet"
            :key="'tavoitealue' + tavoitealueIndex"
            class="mb-5"
          >
            <h3 class="mb-3!">
              {{ $kaanna(tavoitealue.nimi) }}
            </h3>

            <div class="otsikko mb-2">
              {{ $t('opiskelija-osaa') }}
            </div>
            <ul
              v-if="tavoitealue.tavoitteet && tavoitealue.tavoitteet.length > 0"
              class="mb-0"
            >
              <li
                v-for="(tavoite, index) in tavoitealue.tavoitteet"
                :key="'tavoite' + tavoitealueIndex + '-' + index"
              >
                {{ $kaanna(tavoite) }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </template>
  </EpEditointi>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { LukutaitokoulutusTavoitteetJaSisaltoalueetStore } from '@/stores/LukutaitokoulutusTavoitteetJaSisaltoalueetStore';
import EpLukutaitoTavoitealueet from '@/components/lukutaitokoulutus/EpLukutaitoTavoitealueet.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteStore: PerusteStore;
  tavoitteetJaSisaltoalueetId: number;
}>();

const route = useRoute();
const editointiStore = ref<EditointiStore | null>(null);

const perusteId = computed(() => props.perusteStore.perusteId.value);
const versionumero = computed(() => _.toNumber(route.query.versionumero));

const fetch = async () => {
  await props.perusteStore.blockUntilInitialized();
  const store = new LukutaitokoulutusTavoitteetJaSisaltoalueetStore(perusteId.value!, Number(props.tavoitteetJaSisaltoalueetId), versionumero.value);
  editointiStore.value = new EditointiStore(store);
};

watch(() => props.tavoitteetJaSisaltoalueetId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(versionumero, async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
.otsikko {
  font-weight: 600;
}
</style>
