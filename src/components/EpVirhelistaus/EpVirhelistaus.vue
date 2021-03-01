<template>
  <div class="validation">
    <h3 class="peruste">
      <router-link :to="route">{{ nimi }}</router-link>
    </h3>
    <div v-if="categories">
      <div v-for="(infot, category, cid) in categories" :key="category">
        <ep-collapse :use-padding="false"
                     :border-bottom="cid < categories.length - 1"
                     :tyyppi="category">
          <template v-slot:header>
            <h3 class="pb-3" :class="{ 'mt-4': cid !== 0 }">
              {{ $t('validointi-kategoria-' + category) }}
            </h3>
          </template>
          <ep-virhelistaus-table
            v-if="infot[StatusValidointiStatusTypeEnum.VIRHE]"
            :infot="infot[StatusValidointiStatusTypeEnum.VIRHE]">
            <template #heading>{{ $t('julkaisun-estavat-virheet') }}</template>
            <template v-slot:viesti="{info}">
              <router-link :to="info.route" v-if="info.route">
                {{$t(info.viesti)}}
              </router-link>
              <span v-else>
                {{$t(info.viesti)}}
              </span>
            </template>
          </ep-virhelistaus-table>
          <ep-virhelistaus-table
            v-if="infot[StatusValidointiStatusTypeEnum.HUOMAUTUS]"
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
.validation {
  border: 1px solid #ccc;
  box-shadow: 0px 0px 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

</style>
