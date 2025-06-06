import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Ulkopuoliset, getPerusteprojektit, PerusteHakuDto, getAllPerusteet, PerusteprojektiKevytDto, Perusteprojektit, PerusteQuery, PerusteprojektiListausDto, PerusteprojektiQuery } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import _ from 'lodash';

export const useDigitaalisetOsaamisetStore = defineStore('digitaalisetOsaamiset', () => {
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

  // Actions
  async function updateOwnProjects() {
    const res = _.map(await Promise.all(
      [
        findPerusteet({ tila: ['LAADINTA'] }),
        findPerusteet({ tila: ['JULKAISTU'] }),
      ],
    ), 'data') as any;
    ownProjects.value = _.uniqBy([...res[0], ...res[1]], projekti => projekti.id);
  }

  function clear() {
    ownProjects.value = null;
    projects.value = null;
  }

  const updateQuery = _.debounce(async (query: PerusteQuery) => {
    projects.value = (await findPerusteet({ tila: ['POISTETTU'] }));

    if (_.size(projects.value.data) > 0) {
      const rights = (await Perusteprojektit.getPerusteprojektienOikeudet(_.map(projects.value.data, 'id') as number[])).data;
      const resWithRights = {
        ...projects.value,
        data: (projects.value).data.map(proj => ({
          ...proj,
          oikeudet: rights[proj.id!],
        })),
      };

      projects.value = resWithRights;
    }
  }, 300);

  async function findPerusteet(query) {
    const res = await getPerusteprojektit({
      sivu: 0,
      sivukoko: 100,
      voimassaolo: false,
      siirtyma: false,
      tuleva: false,
      poistunut: false,
      tyyppi: ['DIGITAALINEN_OSAAMINEN'],
      nimi: '',
      jarjestysOrder: false,
      jarjestysTapa: 'nimi',
      perusteet: [],
      ...query,
    } as PerusteprojektiQuery);
    return res.data as Page<PerusteprojektiKevytDto>;
  }

  return {
    // State
    ownProjects,
    projects,
    perusteQuery,
    overrides,

    // Actions
    initialize,
    updateOwnProjects,
    clear,
    updateQuery,
    findPerusteet,
  };
});
