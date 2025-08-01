<template>
  <div v-if="!isInitializing && store">
    <EpEditointi :store="store">
      <template #header>
        <h2 class="m-0">
          {{ $t('kvliite') }}
        </h2>
      </template>
      <template #default="{ data, isEditing }">
        <EpInfoBanner
          v-if="data.kvliite.periytynyt"
          class="mb-4"
        >
          {{ $t('perusteen-kvliite-periytynyt') }}
          <router-link :to="{name: 'kvliite', params: { projektiId: data.kvliite.pohjaProjekti.id }}">
            {{ $kaanna(data.kvliite.pohjaProjekti.peruste.nimi) }}
          </router-link>
        </EpInfoBanner>

        <h3>{{ $t('tutkinnon-suorittaneen-ammatillinen-osaaminen') }}</h3>
        <b-form-group :label="$t('tutkinnon-muodostuminen')">
          <ep-content
            v-model="tutkinnonMuodostuminen"
            layout="simplified"
          />
        </b-form-group>

        <h3>{{ $t('tutkinnon-virallinen-asema') }}</h3>

        <b-form-group :label="$t('tutkintotodistuksen-antaja')">
          <ep-content
            v-model="data.kvliite.tutkintotodistuksenAntaja"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <b-form-group :label="$t('tutkinnosta-paattava-viranomainen')">
          <ep-content
            v-model="data.kvliite.tutkinnostaPaattavaViranomainen"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <b-form-group :label="$t('tutkinnon-taso')">
          <ul
            v-for="(taso, idx) in data.kvliite.tasot"
            :key="idx"
          >
            <li v-if="$t(taso.nimi)">
              {{ $kaanna(taso.nimi) }}
            </li>
          </ul>
        </b-form-group>

        <b-form-group :label="$t('arvosana-asteikko')">
          <div v-if="(!isEditing || data.kvliite.periytynyt) && data.kvliite._arvosanaAsteikko">
            <span
              v-for="(taso, idx) in data.arviointiasteikot[data.kvliite._arvosanaAsteikko].osaamistasot"
              :key="idx"
            >
              {{ $kaannaOlioTaiTeksti(taso.otsikko) }} {{ (data.arviointiasteikot[data.kvliite._arvosanaAsteikko].osaamistasot.length - 1) !== idx ? '/' : '' }}
            </span>
          </div>
          <div v-if="isEditing && !data.kvliite.periytynyt">
            <b-form-radio
              v-for="(asteikko , idx) in data.arviointiasteikot"
              :key="idx"
              v-model="data.kvliite._arvosanaAsteikko"
              :value="asteikko.id"
            >
              <span
                v-for="(taso, idx2) in asteikko.osaamistasot"
                :key="idx2"
              >
                {{ $kaannaOlioTaiTeksti(taso.otsikko) }} {{ (asteikko.osaamistasot.length - 1) !== idx2 ? '/' : '' }}
              </span>
            </b-form-radio>
          </div>
        </b-form-group>

        <b-form-group :label="$t('jatkoopinto-kelpoisuus')">
          <ep-content
            v-model="data.kvliite.jatkoopintoKelpoisuus"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <b-form-group :label="$t('kansainvaliset-sopimukset')">
          <ep-content
            v-model="data.kvliite.kansainvalisetSopimukset"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <b-form-group :label="$t('saadosperusta')">
          <ep-content
            v-model="data.kvliite.saadosPerusta"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <h3>{{ $t('tutkintotodistuksen-saaminen') }}</h3>

        <ep-content
          v-model="data.kvliite.tutkintotodistuksenSaaminen"
          layout="simplified"
          :is-editable="isEditing && !data.kvliite.periytynyt"
        />

        <b-form-group :label="$t('pohjakoulutusvaatimukset')">
          <ep-content
            v-model="data.kvliite.pohjakoulutusvaatimukset"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>

        <b-form-group :label="$t('lisatietoja')">
          <ep-content
            v-model="data.kvliite.lisatietoja"
            layout="simplified"
            :is-editable="isEditing && !data.kvliite.periytynyt"
          />
        </b-form-group>
      </template>
    </EpEditointi>
  </div>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePerusteprojekti } from './PerusteprojektiRoute';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { KvliiteEditStore } from '@/stores/KvliiteEditStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { perusteenSuoritustapa } from '@shared/utils/perusteet';
import { $t, $kaanna, $kaannaOlioTaiTeksti } from '@shared/utils/globals';
import { KayttajaStore } from '@/stores/kayttaja';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { TyoryhmaStore } from '@/stores/TyoryhmaStore';
import { PerusteStore } from '@/stores/PerusteStore';

const props = defineProps<{
  kayttajaStore: KayttajaStore;
  tiedotteetStore: TiedotteetStore;
  muokkaustietoStore: MuokkaustietoStore;
  aikatauluStore: AikatauluStore;
  tyoryhmaStore: TyoryhmaStore;
  perusteStore: PerusteStore;
}>();

const store = ref<EditointiStore | null>(null);
const route = useRoute();

const {
  isInitializing,
  perusteId,
} = usePerusteprojekti({
  perusteStore: props.perusteStore,
  kayttajaStore: props.kayttajaStore,
  tiedotteetStore: props.tiedotteetStore,
  muokkaustietoStore: props.muokkaustietoStore,
  aikatauluStore: props.aikatauluStore,
  tyoryhmaStore: props.tyoryhmaStore,
});

const tutkinnonMuodostuminen = computed(() => {
  if (props.perusteStore.perusteSuoritustapa.value && store.value?.data?.kvliite) {
    return store.value?.data?.kvliite.muodostumisenKuvaus[_.toLower(props.perusteStore.perusteSuoritustapa.value)];
  }
  return null;
});

// Setup watch for projektiId
onMounted(async () => {
  const projektiIdNumber = _.parseInt(route.params.projektiId as string);
  if (projektiIdNumber) {
    await onProjektiChange(projektiIdNumber, perusteId.value!);
  }
});

const onProjektiChange = async (projektiId: number, perusteId: number) => {
  store.value = new EditointiStore(new KvliiteEditStore(projektiId, perusteId));
};
</script>

<style lang="scss" scoped>
.valiviiva {
  display: block;
  height: 1px;
  width: 10px;
  border-top: 1px solid black;
}
</style>
