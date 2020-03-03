<template>

  <div class="content">
    <h3>{{$t('projektin-tiedot')}}</h3>

    <div class="data-content d-flex flex-row">
      <div class="pr-3"><fas class="icon" icon="info" /></div>
      <div>
        <div class="topic">{{ $t('projektin-kuvaus')}}</div>
        <div>{{projektinKuvaus}}</div>
      </div>
    </div>

    <div class="row">
        <div class="col-7">

          <div class="data-content d-flex flex-row">
            <div class="pr-3"><fas class="icon" icon="tyoryhma" /></div>
            <div>
              <div class="topic">{{ $t('tyoryhma')}}</div>
              <div>
                <p v-for="virkailija in virkailijat" :key="virkailija.oid" class="mb-1">
                  {{ virkailija.esitysnimi }}
                </p>
                <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
                  {{$t('nayta-lisaa')}}
                </ep-button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-5">

          <div class="data-content d-flex flex-row">
            <div class="pr-3"><fas class="icon" icon="comment" /></div>
            <div>
              <div class="topic">{{ $t('yhteyshenkilo')}}</div>
              <div>{{yhteyshenkilo}}</div>
            </div>
          </div>

          <div class="data-content d-flex flex-row">
            <div class="pr-3"><fas class="icon" icon="kielet" /></div>
            <div>
              <div class="topic">{{ $t('julkaisukielet')}}</div>
              <div>{{ julkaisukielet}}</div>
            </div>
          </div>

        </div>
      </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kielet } from '@shared/stores/kieli';
import { PerusteprojektiDto, PerusteDto, Perusteprojektit, Perusteet } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
    EpButton,
  },
})
export default class EpPerustePerustiedot extends Vue {
  private tyoryhmaAlkuMaara = 5;
  private naytaLisaaTyoryhmaa: boolean = false;

  @Prop({ required: true })
  private projekti!: PerusteprojektiDto;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  get projektinKuvaus() {
    if (this.peruste) {
      return this.peruste.kuvaus;
    }
  }

  get yhteyshenkilo() {
    return 'teppo testaaja';
  }

  get julkaisukielet() {
    if (this.peruste) {
      return _.map(this.peruste.kielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
    }
  }

  get virkailijat() {
    return [
      {
        esitysnimi: 'teppo testaaja',
        oid: '123',
      },
    ];
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .content {

    .data-content {
      padding:10px;
      min-width: 160px;

      .icon {
        color: $blue-lighten-6;
      }

      .topic {
        font-weight: bold;
      }
    }

  }

</style>
