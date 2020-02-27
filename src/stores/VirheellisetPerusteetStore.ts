import Vue from 'vue';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { getPerusteprojektit, ValidationDto, Perusteprojektit, PerusteQuery } from '@shared/api/eperusteet';
import { Page } from '@shared/tyypit';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class VirheellisetPerusteetStore {
  private state = reactive({
    validations: null as Page<ValidationDto> | null,
  })

  public readonly validations = computed(() => this.state.validations);
  public readonly sivu = computed(() => this.state.validations?.sivu || 0);
  public readonly sivukoko = computed(() => 10);
  public readonly kokonaismaara = computed(() => this.state.validations?.kokonaismäärä || 0);

  public readonly updateFilters = _.debounce(async (sivu = 0, sivukoko = 10) => {
    this.state.validations = null;
    const res = await Perusteprojektit.getVirheellisetPerusteprojektit(sivu, sivukoko);
    this.state.validations = res.data as any;
  }, 300);
}

export const virheellisetPerusteetStore = new VirheellisetPerusteetStore();
