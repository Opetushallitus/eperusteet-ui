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
            <h4 class="pb-3">
              <span class="text-danger mr-1">
                <fas icon="info-fill" />
              </span>
              {{ $t('validointi-kategoria-' + category) }}
            </h4>
          </template>
          <h5 class="font-weight-bold">{{ $t('julkaisun-estavat-virheet') }}</h5>
          <table class="table table-striped table-borderless">
            <tbody>
              <tr v-for="(info, idx) in infot" :key="idx">
                <td>
                  <div class="text-nowrap">
                    <span class="text-danger mr-2">
                      <fas icon="info" />
                    </span>
                    <span>{{ $t(info.viesti) }}</span>
                  </div>
                  <div v-if="info.nimet && info.nimet.length > 0">
                    <div v-for="nimi in info.nimet" :key="nimi._id">
                      {{ $kaanna(nimi) }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
import { VirheellisetPerusteetStore } from '@/stores/VirheellisetPerusteetStore';
import { TilaUpdateStatus } from '@shared/api/eperusteet';
import _ from 'lodash';

@Component({
  components: {
    EpCollapse,
    EpIcon,
    EpSpinner,
  },
})
export default class EpVirhelistaus extends Vue {
  @Prop({ required: true })
  validation!: TilaUpdateStatus;

  get nimi() {
    const nimi = this.validation?.perusteprojekti?.peruste?.nimi;
    return nimi ? this.$kaanna(nimi) : this.validation?.perusteprojekti?.nimi;
  }

  get categories() {
    return _.groupBy(this.validation.infot, 'validointiKategoria') || null;
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
