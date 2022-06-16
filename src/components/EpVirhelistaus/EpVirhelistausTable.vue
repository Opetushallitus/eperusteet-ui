<template>
  <div>
    <h5 class="font-weight-bold"><slot name="heading" /></h5>
    <table class="table table-striped table-borderless">
      <tbody>
        <tr v-for="(info, idx) in infotRoute" :key="idx">
          <td>
            <div class="d-flex">
              <span
                class="mr-2"
                :class="{
                  'text-danger': info.validointiStatusType === StatusValidointiStatusTypeEnum.VIRHE,
                  'text-warning': info.validointiStatusType === StatusValidointiStatusTypeEnum.HUOMAUTUS,
                }">
                <fas icon="info" />
              </span>
              <slot name="viesti" :info="info">
                <span>{{ $t(info.viesti) }}</span>
              </slot>
            </div>
            <div v-if="info.nimet && info.nimet.length > 0"  class="pt-1">
              <div v-for="nimi in info.nimet" :key="nimi._id" class="ml-4">
                <router-link :to="nimi.route" v-if="nimi.route">{{ $kaanna(nimi) }}</router-link>
                <span v-else>{{ $kaanna(nimi) }}</span>
              </div>
            </div>
            <div v-if="info.validointi && info.validointi.ongelmat && info.validointi.ongelmat.length > 0" class="pt-1">
              <div v-for="ongelma in info.validointi.ongelmat" :key="ongelma.ongelma" class="ml-4">
                {{ $t(ongelma.ongelma) }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Status, StatusValidointiStatusTypeEnum } from '@shared/api/eperusteet';
import _ from 'lodash';
import { navigationNodeDtoToPerusteRoute } from '@shared/utils/NavigationBuilder';

@Component
export default class EpVirhelistausTable extends Vue {
  @Prop({ required: true })
  infot!: Status[];

  StatusValidointiStatusTypeEnum = StatusValidointiStatusTypeEnum;

  get infotRoute() {
    return _.map(this.infot, info => {
      return {
        ...info,
        nimet: _.map(info.nimet, (nimi: any) => {
          return {
            ...nimi,
            ...(nimi.navigationNode && { route: navigationNodeDtoToPerusteRoute(nimi.navigationNode) }),
          };
        }),
      };
    });
  }
}
</script>
