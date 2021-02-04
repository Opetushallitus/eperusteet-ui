<template>
  <div>
    <h5 class="font-weight-bold"><slot name="heading" /></h5>
    <table class="table table-striped table-borderless">
      <tbody>
        <tr v-for="(info, idx) in infot" :key="idx">
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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Status, StatusValidointiStatusTypeEnum } from '@shared/api/eperusteet';

@Component
export default class EpVirhelistausTable extends Vue {
  @Prop({ required: true })
  infot!: Status[];

  StatusValidointiStatusTypeEnum = StatusValidointiStatusTypeEnum;
}
</script>
