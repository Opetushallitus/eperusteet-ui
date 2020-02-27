import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { NavigationNodeDto, PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';
import { Computed } from '@shared/utils/interfaces';
import _ from 'lodash';

Vue.use(VueCompositionApi);


export class NavigationStore {

  constructor(
    private navigation: Computed<NavigationNodeDto>,
  ) {
  }

  private state = reactive({
  });

}
