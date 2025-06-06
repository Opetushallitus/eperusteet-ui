import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import _ from 'lodash';

interface Breadcrumb {
  label: string;
  route: Location;
}

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  // State
  const crumbs = ref<Breadcrumb[]>([]);

  // Getters
  const breadcrumbs = computed(() => crumbs.value);

  // Actions
  const update = _.debounce(async (value: Breadcrumb[]) => {
    crumbs.value = value;
  }, 10);

  return {
    // State
    crumbs,
    // Getters
    breadcrumbs,
    // Actions
    update,
  };
});
