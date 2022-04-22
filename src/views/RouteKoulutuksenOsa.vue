<template>
  <EpEditointi v-if="store" :store="store">
    <template #header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.nimi) || $t('nimeton-koulutuksen-osa') }}</h2>
    </template>
     <template #default="{ data, isEditing, validation }">
       <b-row class="mb-4">
         <b-col>
           <b-form-group :label="$t('koulutustyyppi') + (isEditing ? ' *' : '')" required>
            <p v-if="isEditing" class="font-size-08">{{ $t('koulutustyyppi-info') }}</p>
            <template v-if="isEditing">
              <b-form-radio
                v-for="type in koulutusOsanKoulutustyypit"
                :key="type"
                class="ml-1"
                v-model="data.koulutusOsanKoulutustyyppi"
                :value="type"
                name="koulutustyyppi"
                :validation="validation.koulutusOsanKoulutustyyppi">
                {{ $t(type) }}
              </b-form-radio>
            </template>
            <template v-else>{{ $t(data.koulutusOsanKoulutustyyppi) }}</template>
            <p v-if="!isEditing && !data.koulutusOsanKoulutustyyppi" class="font-italic">{{ $t('ei-asetettu') }}</p>
          </b-form-group>
         </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col md="6">
          <b-form-group :label="$t('koulutuksen-osan-nimi') + (isEditing ? ' *' : '')" required>
            <EpKoodistoSelect
              :store="koodisto"
              v-model="data.nimiKoodi"
              :is-editing="isEditing"
              :naytaArvo="false"
              @add="onNimiKoodiAdd()">
              <template #default="{ open }">
                <b-input-group>
                  <b-form-input
                    v-if="data.nimi && !data.nimiKoodi"
                    class="font-italic"
                    :value="$kaanna(data.nimi)"
                    disabled>
                  </b-form-input>
                  <b-form-input
                    v-else
                    :value="data.nimiKoodi ? $kaanna(data.nimiKoodi.nimi) : ''"
                    disabled>
                  </b-form-input>
                  <b-input-group-append>
                    <b-button
                      @click="open"
                      icon="plus"
                      variant="primary">
                      {{ $t('hae-koodistosta') }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </template>
              <div slot="empty" v-if="data.nimi">
                {{$kaanna(data.nimi)}}
              </div>
            </EpKoodistoSelect>
            <EpInput
              class="sr-only"
              aria-hidden="true"
              :value="data.nimi"
              @input="data.nimi = setNimiValue(data.nimiKoodi)"
              :is-editing="isEditing"
              :validation="validation.nimi"
              ref="inputNimi"/>
          </b-form-group>
        </b-col>
        <b-col md="4">
          <b-form-group :label="$t('laajuus') + (isEditing ? ' *' : '')" required>
            <div v-if="isEditing || !isEditing && data.laajuusMinimi && data.laajuusMaksimi" class="d-flex align-items-center">
              <EpInput
                v-model="data.laajuusMinimi"
                :is-editing="isEditing"
                :validation="validation.laajuusMinimi"
                type="number"
                :min="0"/>
              <span :class="isEditing ? 'mx-3' : 'mx-1'">-</span>
              <EpInput
                v-model="data.laajuusMaksimi"
                :is-editing="isEditing"
                :validation="validation.laajuusMaksimi"
                type="number"
                :min="data.laajuusMinimi"/>
              <span class="ml-2">{{ $t('viikkoa') }}</span>
            </div>
            <p v-else-if="!isEditing" class="font-italic">{{ $t('ei-asetettu') }}</p>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col>
           <b-form-group :label="$t('opintojen-tyyppi') + (isEditing ? ' *' : '')" required>
            <template v-if="isEditing">
              <b-form-radio
                v-for="type in koulutusOsanTyypit"
                :key="type"
                class="ml-1"
                v-model="data.koulutusOsanTyyppi"
                :value="type"
                name="koulutusOsanTyyppi"
                :validation="validation.koulutusOsanTyyppi">
                {{ $t(type) }}
              </b-form-radio>
            </template>
            <template v-else>{{ $t(data.koulutusOsanTyyppi) }}</template>
            <p v-if="!isEditing && !data.koulutusOsanTyyppi" class="font-italic">{{ $t('ei-asetettu') }}</p>
          </b-form-group>
         </b-col>
      </b-row>
      <b-row class="mb-4">
        <b-col md="10">
          <b-form-group :label="$t('kuvaus')">
            <EpContent
              v-if="isEditing || !isEditing && data.kuvaus"
              v-model="data.kuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuvaHandler="kuvaHandler"/>
            <EpAlert v-if="!isEditing && !data.kuvaus" :text="$t('ei-sisaltoa')" />
          </b-form-group>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <h3 class="mb-4">{{$t('tavoitteet')}}</h3>
          <b-form-group :label="$t('opiskelija')">
            <template v-if="isEditing">
              <draggable
                v-bind="tavoitteetOptions"
                tag="div"
                v-model="data.tavoitteet">
                <b-row v-for="(tavoite, i) in data.tavoitteet" :key="tavoite.id" class="pb-2">
                  <b-col cols="11">
                    <EpInput
                      v-model="data.tavoitteet[i]"
                      :is-editing="isEditing"
                      :disabled="tavoite.uri !== undefined">
                      <div class="order-handle m-2" slot="left">
                        <fas icon="grip-vertical"/>
                      </div>
                    </EpInput>
                  </b-col>
                  <b-col cols="1" v-if="isEditing">
                    <fas
                      icon="roskalaatikko"
                      class="default-icon clickable mt-2"
                      @click="onRemoveListItem(tavoite, 'tavoitteet')"/>
                  </b-col>
                </b-row>
              </draggable>
              <EpButton
                variant="outline"
                icon="plus"
                @click="onAddListItem('tavoitteet')"
                v-if="isEditing">
                {{ $t('lisaa-tavoite') }}
              </EpButton>
            </template>
            <template v-else-if="data.tavoitteet.length > 0">
              <ul>
                <li v-for="tavoite in data.tavoitteet" :key="tavoite.id">
                  {{$kaanna(tavoite)}}
                </li>
              </ul>
            </template>
            <p v-else-if="!isEditing" class="font-italic">{{ $t('ei-asetettu') }}</p>
          </b-form-group>
        </b-col>
      </b-row>
      <hr/>
       <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('laaja-alainen-osaaminen') }}</h3>
            <EpContent
              v-if="isEditing || !isEditing && data.laajaAlaisenOsaamisenKuvaus"
              v-model="data.laajaAlaisenOsaamisenKuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuvaHandler="kuvaHandler"/>
            <EpAlert v-if="!isEditing && !data.laajaAlaisenOsaamisenKuvaus" :text="$t('ei-sisaltoa')" />
          </b-form-group>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('keskeinen-sisalto') }}</h3>
            <EpContent
              v-if="isEditing || !isEditing && data.keskeinenSisalto"
              v-model="data.keskeinenSisalto"
              layout="normal"
              :is-editable="isEditing"
              :kuvaHandler="kuvaHandler"/>
            <EpAlert v-if="!isEditing && !data.keskeinenSisalto" :text="$t('ei-sisaltoa')" />
          </b-form-group>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('arviointi') }}</h3>
            <EpContent
              v-if="isEditing || !isEditing && data.arvioinninKuvaus"
              v-model="data.arvioinninKuvaus"
              layout="normal"
              :is-editable="isEditing"
              :kuvaHandler="kuvaHandler"/>
            <EpAlert v-if="!isEditing && !data.arvioinninKuvaus" :text="$t('ei-sisaltoa')" />
          </b-form-group>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner v-else class="my-3"/>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as _ from 'lodash';
import draggable from 'vuedraggable';

import { PerusteStore } from '@/stores/PerusteStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { KuvaStore } from '@/stores/KuvaStore';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { Koodisto, KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum, KoulutuksenOsaDtoKoulutusOsanTyyppiEnum } from '@shared/api/eperusteet';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpSpinner,
    EpEditointi,
    EpKoodistoSelect,
    EpInput,
    EpContent,
    EpButton,
    draggable,
    EpAlert,
  },
})
export default class RouteKoulutuksenOsa extends Vue {
  @Prop({ required: true })
  perusteStore!: PerusteStore;

  @Prop({ required: true })
  koulutuksenosaId!: number;

  private store: EditointiStore | null = null;
  private tempNimiValue = null;

  private readonly koodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('koulutuksenosattuva', query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  @Watch('koulutuksenosaId', { immediate: true })
  async onParamChange(id: string, oldId: string) {
    if (!id || id === oldId) {
      return;
    }
    await this.perusteStore.blockUntilInitialized();
    const tkstore = new KoulutuksenOsaStore(this.perusteId!, Number(id));
    this.store = new EditointiStore(tkstore);
    this.tempNimiValue = null;
  }

  onAddListItem(array): void {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: [
        ..._.get(this.store?.data.value, array),
        {},
      ],
    });
  }

  onRemoveListItem(rowToRemove, array) {
    this.store?.setData({
      ...this.store?.data.value,
      [array]: _.filter(_.get(this.store?.data.value, array), rivi => rivi !== rowToRemove),
    });
  }

  onNimiKoodiAdd() {
    ((this.$refs.inputNimi as Vue).$el.querySelector('input') as HTMLInputElement).dispatchEvent(new Event('input'));
  }

  setNimiValue(nimiKoodi) {
    const julkaisukielet = this.perusteStore.julkaisukielet.value;
    const sourceLang = _.includes(julkaisukielet as string[], 'fi') ? 'fi' : julkaisukielet[0];
    const mappedByLang = julkaisukielet.reduce((obj, key) => ({ ...obj, [key]: nimiKoodi.nimi?.[sourceLang] }), {});
    return mappedByLang;
  }

  get perusteId() {
    return this.perusteStore.perusteId.value;
  }

  get koulutusOsanKoulutustyypit(): string[] {
    return [
      _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.TUTKINTOKOULUTUKSEENVALMENTAVA),
      _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.PERUSOPETUS),
      _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.LUKIOKOULUTUS),
      _.toLower(KoulutuksenOsaDtoKoulutusOsanKoulutustyyppiEnum.AMMATILLINENKOULUTUS),
    ];
  }

  get koulutusOsanTyypit(): string[] {
    return [
      _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.YHTEINEN),
      _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.VALINNAINEN),
    ];
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.perusteId!));
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      disabled: !this.store!.isEditing,
      ghostClass: 'dragged',
    };
  }

  get tavoitteetOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'tavoitteet',
      },
    };
  }

  get arvioinnitOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'arvioinnit',
      },
    };
  }
}
</script>

<style scoped lang="scss">

</style>
