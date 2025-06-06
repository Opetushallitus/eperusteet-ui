import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Ulkopuoliset, getPerusteprojektit, PerusteHakuDto, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto, PerusteprojektiQuery } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import { IProjektiProvider } from '@/components/EpPerusteprojektiListaus/types';
import _ from 'lodash';

export const usePerusteetStore = (storeType: string) => {

  return defineStore('perusteet-'+storeType, () => {
  // Parameters that would have been passed to constructor
    const overrides = ref<PerusteQuery & any>({});

    // State
    const ownProjects = ref<PerusteprojektiListausDto[] | null>(null);
    const projects = ref<Page<PerusteprojektiKevytDto> | null>(null);
    const perusteQuery = ref<PerusteQuery>({});

    // Initialize with parameters (replacing constructor functionality)
    function initialize(params: PerusteQuery & any) {
      overrides.value = params;
    }

    // Getters
    const filteredOwnProjects = computed(() => {
      if (ownProjects.value) {
        return _.filter(ownProjects.value, p => {
          const tyyppi = overrides.value?.tyyppi;
          return !tyyppi || _.includes(tyyppi, _.toUpper(p.peruste?.tyyppi));
        });
      }
      return null;
    });

    // Actions
    async function updateOwnProjects() {
      const res = _.map(await Promise.all([Perusteprojektit.getOmatPerusteprojektit(), Perusteprojektit.getOmatJulkaistutPerusteprojektit()]), 'data') as any;
      ownProjects.value = _.uniqBy([...res[0], ...res[1]], projekti => projekti.id);
    }

    function clear() {
      ownProjects.value = null;
      projects.value = null;
    }

    const updateQuery = _.debounce(async (query: PerusteQuery) => {
      const res = (await getPerusteprojektit({
        ...query,
        ...overrides.value,
      } as PerusteprojektiQuery)).data as any;
      const projectIds = _.chain((res).data)
        .map('id')
        .value() as number[];

      if (_.size(projectIds) > 0) {
        const rights = (await Perusteprojektit.getPerusteprojektienOikeudet(projectIds)).data;
        const resWithRights = {
          ...res,
          data: (res).data.map((proj: PerusteprojektiKevytDto) => ({
            ...proj,
            oikeudet: rights[proj.id!],
          })),
        };

        projects.value = resWithRights;
      }
      else {
        projects.value = res;
      }
    }, 300);

    async function findPerusteet(query: PerusteQuery) {
      const res = await getAllPerusteet({
        ...query,
      });
      return res.data as Page<PerusteHakuDto>;
    }

    return {
      // State
      ownProjects,
      projects,
      perusteQuery,
      overrides,

      // Getters
      filteredOwnProjects,

      // Actions
      initialize,
      updateOwnProjects,
      clear,
      updateQuery,
      findPerusteet,
    };
  });
};
