import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Debounced } from '@shared/utils/delay';
import _ from 'lodash';
import { MessageApi, ThreadMessagesDto, PageThreadMessagesDto } from '@shared/api/ai';

Vue.use(VueCompositionApi);

export interface OpsAiQuery {
  startDate?: Date;
  endDate?: Date;
  sourceType?: Array<string>;
  educationLevel?: string;
  hasFeedbackOnly?: boolean;
  page: number;
  pagesize: number;
};

export enum SourceType {
  PERUSTE = 'peruste',
  YLOPS = 'ylops',
  AMOSAA = 'amosaa'
};

export class OpsAiKeskustelutStore {
  private state = reactive({
    threadMessages: null as PageThreadMessagesDto | null,
  });

  public readonly threadMessages = computed(() => this.state.threadMessages);

  @Debounced()
  public async fetch(query: OpsAiQuery) {
    this.state.threadMessages = null;
    this.state.threadMessages = (await MessageApi.getMessages(
      query.startDate,
      query.endDate,
      query.sourceType,
      query.educationLevel,
      query.hasFeedbackOnly,
      query.page,
      query.pagesize,
    )).data;
  }
}
