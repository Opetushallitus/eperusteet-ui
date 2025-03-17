<template>
  <ep-main-view>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('ops.ai') }}</h1>
      </div>
    </template>

    <div class="row ml-0 mb-2 mt-4">

      <b-form-group :label="$t('keskustelun-aikavali')" class="col-3">
        <div class="d-flex align-items-center">
          <ep-datepicker v-model="query.startDate" :is-editing="true" />
          <div class="mx-2">-</div>
          <ep-datepicker v-model="query.endDate" :is-editing="true" endOfDay/>
        </div>
      </b-form-group>

      <b-form-group :label="$t('sisaltotyyppi')" class="col-2">
        <div class="d-flex pt-2">
          <EpToggle v-model="perusteValinta" checkbox>{{ $t('peruste') }}</EpToggle>
          <EpToggle v-model="opstotsuValinta" checkbox>{{ $t('ops-tai-totsu') }}</EpToggle>
        </div>
      </b-form-group>

      <b-form-group :label="$t('koulutustyyppi')" class="col-3">
        <KoulutustyyppiSelect v-model="query.educationLevel" :isEditing="true"/>
      </b-form-group>
    </div>

    <div class="row ml-0 mb-2 mt-4">
      <b-form-group :label="$t('palaute')" class="col-3">
        <EpToggle v-model="query.hasFeedbackOnly" checkbox>{{ $t('nayta-vain-palautteita-sisaltavat-keskustelut') }}</EpToggle>
      </b-form-group>
    </div>

    <EpSpinner v-if="!threadMessages" />
    <div v-else>
      <div class="d-flex align-items-center justify-content-between">
        <div>
          {{ $t('naytetaan-x-keskustelua', {kpl: total }) }}
        </div>
        <ep-button variant="link" @click="toggleAvaaSulje()" v-if="total > 0">
          {{$t('avaa-sulje-kaikki')}}
        </ep-button>
      </div>

      <EpCollapse
        ref="keskustelucollapse"
        :expandedByDefault="false"
        :borderBottom="false"
        :usePadding="false"
        class="keskustelu mb-2 py-2"
        v-for="keskustelu in threadMessages"
        :key="keskustelu.threadId">
          <template #header>
            <div class="d-flex justify-content-between">
              <div class="font-weight-600">
                {{ $sdt(keskustelu.startDate) }}
                <EpMaterialIcon class="ml-2 thumb" :outlined="!keskustelu.sisaltaaPositiivisen">thumb_up</EpMaterialIcon>
                <EpMaterialIcon class="ml-2 thumb" :outlined="!keskustelu.sisaltaaNegatiivisen">thumb_down</EpMaterialIcon>
              </div>
              <div class="mx-2">|</div>
              <div>{{ $t(keskustelu.koulutustyyppi) }}</div>
              <div class="mx-2">|</div>
              <div>{{ $kaanna(keskustelu.lahdeNimi) }}</div>
            </div>
          </template>

          <div class="messages h-100 d-flex flex-column">
            <EpOpsAiMessage
              v-for="message in keskustelu.messages"
              :key="message.messageId"
              :value="message">
              <template #user>
                {{ $t('kayttaja') }}
              </template>
            </EpOpsAiMessage>
          </div>

      </EpCollapse>

    </div>

    <ep-pagination
      v-model="page"
      :per-page="query.pagesize"
      :total-rows="total"/>
  </ep-main-view>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { OpsAiKeskustelutStore, OpsAiQuery, SourceType } from '@/stores/OpsAiKeskustelutStore';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import { FeedbackDtoResultEnum } from '@shared/api/ai';
import EpOpsAiMessage from '@shared/components/EpOpsAi/EpOpsAiMessage.vue';
import EpOpsAiMessageMeta from '@shared/components/EpOpsAi/EpOpsAiMessageMeta.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

@Component({
  components: {
    KoulutustyyppiSelect,
    EpMainView,
    EpOpsAiMessage,
    EpPagination,
    EpOpsAiMessageMeta,
  },
})
export default class RouteOpsAiKeskustelut extends Vue {
  private opsAiStore = new OpsAiKeskustelutStore();
  private query: OpsAiQuery = {
    startDate: undefined,
    endDate: new Date(),
    sourceType: [],
    educationLevel: undefined,
    hasFeedbackOnly: false,
    page: 0,
    pagesize: 10,
  };
  keskustelutAvattu = false;

  async mounted() {
    await this.opsAiStore.fetch(this.query);
  }

  @Watch('query', { deep: true })
  async onQueryChanged() {
    await this.opsAiStore.fetch(this.query);
  }

  get threadMessages() {
    if (!this.opsAiStore.threadMessages.value) {
      return null;
    }

    return _.chain(this.opsAiStore.threadMessages.value.content)
      .map(thread => {
        return {
          ...thread,
          messages: _.map(thread.messages, message => {
            return {
              ...message,
              ...(message.content && { content: message.content.replace(/\n/g, '<br>') }),
            };
          }),
          startDate: _.min(_.map(thread.messages, 'createdAt')),
          koulutustyyppi: _.first(thread.messages)?.meta?.educationLevel,
          lahdeNimi: _.first(thread.messages)?.meta?.sourceName,
          sisaltaaPositiivisen: _.some(thread.messages, message => message.feedback?.result === FeedbackDtoResultEnum.POSITIVE),
          sisaltaaNegatiivisen: _.some(thread.messages, message => message.feedback?.result === FeedbackDtoResultEnum.NEGATIVE),
        };
      })
      .sortBy('startDate')
      .reverse()
      .value();
  }

  get total() {
    return this.opsAiStore.threadMessages.value?.totalElements;
  }

  get page() {
    return this.query?.page! + 1;
  }

  set page(value: number) {
    this.query.page = value - 1;
  }

  get perusteValinta() {
    return this.query.sourceType!.includes(SourceType.PERUSTE);
  }

  set perusteValinta(val) {
    if (val) {
      this.query.sourceType!.push(SourceType.PERUSTE);
    }
    else {
      this.query.sourceType = this.query.sourceType!.filter((t) => t !== SourceType.PERUSTE);
    }
  }

  get opstotsuValinta() {
    return this.query.sourceType!.includes(SourceType.YLOPS) || this.query.sourceType!.includes(SourceType.AMOSAA);
  }

  set opstotsuValinta(val) {
    if (val) {
      this.query.sourceType!.push(SourceType.YLOPS);
      this.query.sourceType!.push(SourceType.AMOSAA);
    }
    else {
      this.query.sourceType = _.without(this.query.sourceType, SourceType.YLOPS);
      this.query.sourceType = _.without(this.query.sourceType, SourceType.AMOSAA);
    }
  }

  toggleAvaaSulje() {
    this.keskustelutAvattu = !this.keskustelutAvattu;
    _.forEach(this.$refs.keskustelucollapse, (keskustelu: any) => keskustelu.toggle(this.keskustelutAvattu));
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.keskustelu {
  border: 2px solid#E0E0E1;
  border-radius: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.thumb {
  font-size: 1.2rem;
  color: $blue-lighten-5;
}

::v-deep .collapse-button {
  margin-bottom: 0 !important;
}

</style>
