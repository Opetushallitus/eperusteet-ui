<template>
  <div>
    <h3 class="peruste" v-if="nimi">
      <router-link :to="route">{{ nimi }}</router-link>
    </h3>
    <div v-if="validation.vaihtoOk" class="d-flex">
      <div class="material-icons no-errors">check_circle</div>
      <div class="ml-2">{{$t('ei-julkaisua-estavia-virheita')}}</div>
    </div>
    <div v-else class="d-flex">
      <div class="material-icons errors">info</div>
      <div class="ml-2">{{$t('loytyi-julkaisun-estavia-virheita')}}</div>
    </div>
    <div v-if="categories">
      <div v-for="(infot, category) in categories" :key="category">
        <ep-collapse :use-padding="true"
                     :border-bottom="false"
                     :tyyppi="category">

          <template v-slot:header>
            <h3>{{ $t('validointi-kategoria-' + category) }}</h3>
          </template>

          <ep-virhelistaus-table v-if="infot[StatusValidointiStatusTypeEnum.VIRHE]"
                                 :infot="infot[StatusValidointiStatusTypeEnum.VIRHE]">
            <template v-slot:viesti="{info}">
              <router-link :to="info.route" v-if="info.route">
                {{$t(info.viesti)}}
              </router-link>
              <span v-else>
                {{$t(info.viesti)}}
              </span>
            </template>
          </ep-virhelistaus-table>

          <ep-virhelistaus-table v-if="infot[StatusValidointiStatusTypeEnum.HUOMAUTUS]"
                                 :infot="infot[StatusValidointiStatusTypeEnum.HUOMAUTUS]">
            <template #heading>{{ $t('huomautukset') }}</template>
          </ep-virhelistaus-table>

        </ep-collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpVirhelistausTable from '@/components/EpVirhelistaus/EpVirhelistausTable.vue';
import { TilaUpdateStatus, StatusValidointiKategoriaEnum, StatusValidointiStatusTypeEnum } from '@shared/api/eperusteet';
import _ from 'lodash';

@Component({
  components: {
    EpCollapse,
    EpIcon,
    EpSpinner,
    EpVirhelistausTable,
  },
})
export default class EpVirhelistaus extends Vue {
  @Prop({ required: true })
  validation!: TilaUpdateStatus;

  StatusValidointiStatusTypeEnum = StatusValidointiStatusTypeEnum;

  get nimi() {
    const nimi = this.validation?.perusteprojekti?.peruste?.nimi;
    return nimi ? this.$kaanna(nimi) : this.validation?.perusteprojekti?.nimi;
  }

  get categories() {
    const groupedByCategory = _.groupBy(this.validation.infot, info => info.validointiKategoria
      ? info.validointiKategoria
      : StatusValidointiKategoriaEnum.MAARITTELEMATON) || null;
    const categoriesGroupedByStatus = {};

    Object.keys(groupedByCategory).forEach(key => {
      categoriesGroupedByStatus[key] = _.groupBy(groupedByCategory[key], 'validointiStatusType');
    });

    return categoriesGroupedByStatus;
  }

  get categoryCount() {
    return Object.keys(this.categories).length;
  }

  get route() {
    return {
      name: 'perusteprojekti',
      params: {
        projektiId: this.validation?.perusteprojekti?.id,
      },
    };
  }
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

.no-errors {
 color: $green;
}

.errors {
  color: $invalid;
}

::v-deep .ep-collapse {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

</style>
