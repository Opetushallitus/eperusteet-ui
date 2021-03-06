<template>
  <div class="content text-left">
    <h3>{{$t('viimeaikainen-toiminta')}}</h3>

    <ep-spinner v-if="!muokkaustiedot || !peruste"/>

    <div class="container text-center" v-else>
      <div v-for="(muokkaustieto, index) in muokkaustiedotRouted" :key="index" class="row muokkaustieto">

        <div class="col col-auto ikoni-col center-block">
          <div class="ikoni d-inline-block">
            <fas :icon="muokkaustieto.icon" :class="muokkaustieto.iconClass"/>
          </div>
          <div class="aikajana" v-if="index != muokkaustiedotRouted.length - 1">&nbsp;</div>
        </div>

        <div class="col router-col text-left">
          <div v-if="muokkaustieto.poistettu">
            <div class="router-box" :class="{ 'router-box-poistettu': muokkaustieto.poistettu }">
              <div class="row">
                <div class="col nimi">{{muokkaustieto.kayttajaNimi}}</div>
                <div class="col aika text-right">{{$ago(muokkaustieto.luotu)}}</div>
              </div>
              <div class="kohde">{{muokkaustieto.tapahtumateksti}}</div>
            </div>
          </div>
          <router-link :to="muokkaustieto.route" v-else>
            <div class="router-box" :class="{ 'router-box-poistettu': muokkaustieto.poistettu }">
              <div class="row">
                <div class="col nimi">{{muokkaustieto.kayttajaNimi}}</div>
                <div class="col aika text-right">{{$ago(muokkaustieto.luotu)}}</div>
              </div>
              <div class="kohde">{{muokkaustieto.tapahtumateksti}}</div>
            </div>
          </router-link>
        </div>
      </div>

       <span class="tyhja" v-if="muokkaustiedot && muokkaustiedot.length === 0">{{$t('viimeaikainen-toiminta-tyhja')}}</span>

      <div v-else>
        <ep-button @click="haeLisaa" variant="link" v-if="!lisahaku && muokkaustiedotRouted.length % hakuLukumaara == 0 && muokkaustiedot && (!viimeinenHaku || viimeinenHaku.length > 0)">
          {{$t('nayta-lisaa')}}
        </ep-button>

        <ep-spinner v-if="lisahaku"></ep-spinner>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { muokkaustietoRoute, muokkaustietoIcon } from '@shared/utils/tapahtuma';
import { MuokkaustietoKayttajallaDto, PerusteDto } from '@shared/api/eperusteet';
import { parsiEsitysnimi } from '@/stores/kayttaja';

@Component({
  components: {
    EpSpinner,
    EpButton,
  },
})
export default class EpPerusteViimeaikainenToiminta extends Vue {
  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  private lisahaku: boolean = false;

  @Prop({ required: true })
  private peruste!: PerusteDto;

  get muokkaustiedot() {
    return this.muokkaustietoStore.muokkaustiedot.value;
  }

  get viimeinenHaku() {
    return this.muokkaustietoStore.viimeinenHaku.value;
  }

  get hakuLukumaara() {
    return this.muokkaustietoStore.hakuLukumaara.value;
  }

  async haeLisaa() {
    this.lisahaku = true;
    await this.muokkaustietoStore.update();
    this.lisahaku = false;
  }

  get muokkaustiedotRouted() {
    return _.chain(this.muokkaustiedot)
      .map((muokkaustieto: MuokkaustietoKayttajallaDto) => {
        return {
          ...muokkaustieto,
          route: muokkaustietoRoute(muokkaustieto.kohdeId, muokkaustieto.kohde, muokkaustieto.tapahtuma, this.peruste.tyyppi),
          icon: muokkaustietoIcon(muokkaustieto.kohde, muokkaustieto.tapahtuma),
          iconClass: this.muokkaustietoIconClass(muokkaustieto),
          kayttajaNimi: muokkaustieto.kayttajanTieto ? parsiEsitysnimi(muokkaustieto.kayttajanTieto) : muokkaustieto.muokkaaja,
          tapahtumateksti: this.tapahtumateksti(muokkaustieto),
        };
      })
      .sortBy('luotu')
      .reverse()
      .value();
  }

  tapahtumateksti(muokkaustieto) {
    if (muokkaustieto.lisatieto) {
      return this.$t(muokkaustieto.lisatieto);
    }

    return this.$t(this.tapahtumakaannos(muokkaustieto)) + ': ' + this.tapahtumakohde(muokkaustieto);
  }

  tapahtumakaannos(muokkaustieto) {
    if (muokkaustieto.tapahtuma === 'luonti') {
      return 'tapahtuma-' + muokkaustieto.tapahtuma + '-' + muokkaustieto.kohde;
    }

    return 'tapahtuma-' + muokkaustieto.tapahtuma;
  }

  tapahtumakohde(muokkaustieto) {
    return (this as any).$kaanna(muokkaustieto.nimi);
  }

  muokkaustietoIconClass(muokkaustieto) {
    if (muokkaustieto.kohde === 'kommentti') {
      return 'kommentointi';
    }

    return muokkaustieto.tapahtuma;
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .container {
    margin-top: 40px;
    margin-bottom: 20px;
    min-width: 450px;

    .muokkaustieto {
      margin-top: 0;
      margin-bottom: 10px;

      .ikoni-col {
        padding-top: 0;

        .ikoni {
          width:45px;
          border-radius: 30px;
          padding: 10px;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
          z-index: 15;
          background-color: #fff;
          color: $black;

          .luonti {
            color: $green-lighten-2;
          }

          .paivitys {
            color: $pink;
          }

          .kommentointi {
            color: $blue;
          }

          .luokaton {
            color: $gray;
          }

          .poisto {
            color: $gray;
          }

          .palautus {
            color: $blue-darken-1;
          }

        }

        .aikajana {
          z-index: 10;
          height: 100%;
          background: linear-gradient($gray-lighten-2, $gray-lighten-2) no-repeat center/2px 100%;
        }

      }

      .router-col {
        padding: 0;
        width: 0;

        .router-box {
          line-height: 1;
          padding: 10px;
          border-radius: 0.5rem;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
          color: $black;

          .nimi {
            font-weight: bold;
            padding-bottom: 10px;
          }

          .aika {
            color: $gray-lighten-2;
          }

          .kohde {
            padding-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

        }
      }
    }

  }

  .tyhja {
    color: $gray-lighten-2;
    font-style: italic;
  }
</style>
