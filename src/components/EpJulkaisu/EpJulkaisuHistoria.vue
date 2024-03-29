<template>
  <div class="mb-4">
    <h3 class="mb-2" slot="header">{{ $t('muutoshistoria') }}</h3>
    <EpSpinner v-if="!julkaisut"/>
    <template v-else>
      <div class="alert alert-info" v-if="julkaisut.length === 0">
        <slot name="empty">{{ $t('ei-julkaisuja') }}</slot>
      </div>
      <div v-else>
        <div v-for="(julkaisu, index) in julkaisutMapped" :key="'julkaisu'+index" class="julkaisu pb-3 pt-2 px-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="font-bold font-size pr-3 ">{{ $sdt(julkaisu.luotu) }}</span>
              <span v-if="julkaisu.nimi" class="pr-3">{{ julkaisu.nimi }}</span>
              <span v-if="latestJulkaisuRevision && latestJulkaisuRevision.revision === julkaisu.revision" class="julkaistu">{{$t('uusin-versio')}}</span>
              <span v-if ="julkaisu.tila === 'KESKEN'" class="julkaistu julkaistu--kesken">{{$t('julkaisu-kesken')}}</span>
              <span v-if ="julkaisu.tila === 'VIRHE'" class="julkaistu julkaistu--virhe">{{$t('julkaisu-epaonnistui')}}</span>
            </div>

            <div class="d-flex align-items-center">
              <div v-if="julkaisu.julkinen" class="d-flex pr-4">
                <EpMaterialIcon :color="'#4c7f00'">check_circle</EpMaterialIcon>
                <div class="ml-2">{{$t('nakyy-muutoshistoriassa')}}</div>
              </div>
              <EpButton v-if="julkaisu.tila === 'JULKAISTU'"
                        icon="edit"
                        variant="link"
                        @click="avaaMuokkausModal(julkaisu)"
                        v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
                {{ $t('muokkaa') }}
              </EpButton>

              <div class="btn btn-link btn-md btn-link">
                <slot name="katsele" :julkaisu="julkaisu" v-if="julkaisu.tila !== 'VIRHE'"></slot>
              </div>
              <EpButton v-if="latestJulkaisuRevision && latestJulkaisuRevision.revision !== julkaisu.revision && julkaisu.tila === 'JULKAISTU'"
                        icon="keyboard_return"
                        variant="link"
                        :showSpinner="julkaisu.palautuksessa"
                        @click="palautaConfirm(julkaisu)"
                        v-oikeustarkastelu="{ oikeus: 'muokkaus' }">
                {{ $t('palauta') }}
              </EpButton>
            </div>
          </div>
          <div v-if="julkaisu.muutosmaaraysVoimaan">
            <div v-for="(liiteData, index) in julkaisu.liitteet" :key="'maarays'+index" class="maarayslinkit">
              <a :href="liiteData.url" target="_blank" rel="noopener noreferrer">{{ liiteData.nimi }}</a>
            </div>
            <span>- {{ $sd(julkaisu.muutosmaaraysVoimaan) }} {{ $t('alkaen') }}</span>
          </div>
          <div v-if="julkaisu.muutosmaarays" class="d-flex">
            <EpPdfLink :url="julkaisu.muutosmaarays.url">{{ $kaanna(julkaisu.muutosmaarays.nimi) }}</EpPdfLink>
            <span class="pl-2"> - {{$t('voimassaolo-alkaa')}} {{$sd(julkaisu.muutosmaarays.voimassaoloAlkaa)}}</span>
          </div>
          <div  v-if="julkaisu.tiedote" class="mt-2">
            <span class="font-bold pr-1">{{ $t('tiedote') }}:</span>
            <div v-html="$kaanna(julkaisu.tiedote)" />
          </div>
          <div v-if="julkaisu.julkinenTiedote">
            <span class="font-bold pr-1">{{ $t('julkinen-tiedote') }}:</span>
            <div v-html="$kaanna(julkaisu.julkinenTiedote)" />
          </div>
        </div>
      </div>
    </template>
    <EpJulkaisuModal ref="julkaisuModal" :perusteStore="store"/>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuModal from './EpJulkaisuModal.vue';
import { PerusteStore } from '@/stores/PerusteStore';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { MaaraysLiiteDtoTyyppiEnum } from '@shared/generated/eperusteet';
import { MaarayksetParams, baseURL } from '@shared/api/eperusteet';

interface Julkaisu {
  revision?: number;
  tiedote?: { [key: string]: string; };
  luotu?: Date;
  kayttajanTieto?: any;
  tila?: 'JULKAISTU' | 'KESKEN' | 'VIRHE';
  liitteet?: any;
}

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpJulkaisuModal,
    EpMaterialIcon,
  },
})
export default class EpJulkaisuHistoria extends Vue {
  @Prop({ required: true })
  private store!: PerusteStore;

  @Prop({ required: false })
  private palauta!: Function;

  private palautuksessa: any | null = null;

  get julkaisut() {
    return this.store.julkaisut.value;
  }

  get perusteId() {
    return this.store.perusteId.value;
  }

  get julkaisukielet() {
    return this.store.julkaisukielet.value;
  }

  get julkaisutMapped() {
    return _.chain(this.julkaisut)
      .filter(julkaisu => julkaisu !== undefined)
      .map(julkaisu => {
        return {
          ...julkaisu,
          ...(julkaisu.kayttajanTieto && { nimi: parsiEsitysnimi(julkaisu.kayttajanTieto) }),
          tila: julkaisu.tila || 'JULKAISTU',
          palautuksessa: this.palautuksessa === julkaisu.revision,
          liitteet: this.muutosmaaraysLiite(julkaisu),
          ...(!!julkaisu.muutosmaarays && {
            muutosmaarays: {
              ...julkaisu.muutosmaarays,
              url: this.muutosmaaraysUrl(julkaisu.muutosmaarays),
            },
          }),
        };
      })
      .sortBy('revision')
      .reverse()
      .value();
  }

  get latestJulkaisuRevision() {
    return _.find(this.julkaisutMapped, julkaisu => julkaisu.tila === 'JULKAISTU');
  }

  async palautaConfirm(julkaisu) {
    if (await this.$bvModal.msgBoxConfirm((this.$t('toiminto-kopioi-ja-palauttaa-valitsemasi-version-julkiseksi') as any), {
      title: this.$t('palauta-versio-julkiseksi'),
      okVariant: 'primary',
      okTitle: this.$t('kylla') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...{} as any,
    })) {
      this.palautuksessa = julkaisu.revision;
      await this.palauta(julkaisu);
      this.palautuksessa = null;
    }
  }

  muutosmaaraysLiite(julkaisu) {
    if (julkaisu.liitteet && julkaisu.liitteet.length > 0) {
      julkaisu.liitteet.forEach(liiteData => {
        liiteData.url = `/eperusteet-service/api/perusteet/${julkaisu.peruste.id!}/julkaisu/liitteet/${liiteData.liite.id}`;
      });
      return julkaisu.liitteet;
    }
    else {
      return [];
    }
  }

  muutosmaaraysUrl(muutosmaarays) {
    if (!_.find(muutosmaarays.liitteet![this.$slang.value].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI)) {
      return null;
    }

    return baseURL + MaarayksetParams.getMaaraysLiite(_.toString(_.get(_.find(muutosmaarays.liitteet![this.$slang.value].liitteet, liite => liite.tyyppi === MaaraysLiiteDtoTyyppiEnum.MAARAYSDOKUMENTTI), 'id'))).url;
  }

  avaaMuokkausModal(julkaisu) {
    (this.$refs['julkaisuModal'] as any).muokkaa(julkaisu, this.latestJulkaisuRevision!.revision === julkaisu.revision);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.julkaisu:nth-of-type(even) {
  background-color: $gray-lighten-13;
}

.julkaistu {
  border-radius: 25px;
  background-color: $green-1;
  padding: 5px 10px;
  margin-left: 10px;
  color: $black;

  &--kesken {
    background-color: $yellow-1;
  }

  &--virhe {
    background-color: $red-lighten-1;
  }
}

.font-bold {
  font-weight: 600 !important;
}

.font-size {
  font-size: 110%;
}

.julkinen {
  color: $green;
}

.maarayslinkit {
  display: inline;
  padding-right: 5px;
}

</style>
