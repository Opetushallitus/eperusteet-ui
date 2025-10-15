<template>
  <div class="mt-2">
    <ep-tekstikappale-lisays
      v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
      :tallenna="tallennaUusiTekstikappale"
      :tekstikappaleet="perusteenOsat"
      :paatasovalinta="true"
      :osaamisalat="osaamisalat"
    >
      <template #default="{tekstikappale}">
        <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
        {{ $kaanna(tekstikappale.label) }}
      </template>
    </ep-tekstikappale-lisays>

    <template v-if="lisasisaltoLisays.length > 0">
      <div
        v-for="(lisasisalto, index) in lisasisaltoLisays"
        :key="'lisasisalto'+index"
      >
        <b-dropdown
          v-if="lisasisalto.groupedSisalto && lisasisalto.groupedSisalto.length > 0"
          variant="link"
          class="lisasisalto-dropdown mt-2"
          toggle-class="text-decoration-none"
          no-caret
        >
          <template #button-content>
            <ep-button
              variant="link"
              button-class="text-decoration-none"
            >
              <EpMaterialIcon
                :color="'inherit'"
                :background="'inherit'"
                size="18px"
              >
                add
              </EpMaterialIcon>
              <span>
                {{ $t(lisasisalto.groupedLinkkiteksti) }}
              </span>
            </ep-button>
          </template>

          <div
            v-for="(groupedLisasisalto, index) in lisasisalto.groupedSisalto"
            :key="'groupedLisasisalto'+index"
          >
            <hr
              v-if="index > 0"
              class="mt-2 mb-2"
            >

            <ep-tekstikappale-lisays
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              :tallenna="groupedLisasisalto.save"
              :tekstikappaleet="perusteenOsat"
              :paatasovalinta="true"
              :otsikko-required="false"
              :modal-id="'groupedLisasisaltoLisays'+index"
            >
              <template #lisays-btn-icon>
                <span />
              </template>
              <template #lisays-btn-text>
                {{ $t(groupedLisasisalto.label['uusi']) }}
              </template>
              <template #modal-title>
                {{ $t(groupedLisasisalto.label['uusi']) }}
              </template>
              <template #footer-lisays-btn-text>
                {{ $t(groupedLisasisalto.label['lisaa']) }}
              </template>
              <template #header>
                {{ $t(groupedLisasisalto.label['sijainti']) }}
              </template>
              <template #default="{tekstikappale}">
                <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                {{ $kaanna(tekstikappale.label) }}
              </template>
            </ep-tekstikappale-lisays>
          </div>
        </b-dropdown>

        <ep-button
          v-else-if="lisasisalto.call"
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          variant="link"
          button-class="text-decoration-none"
          :show-spinner="loading"
          @click="makeCall(lisasisalto.call)"
        >
          <EpMaterialIcon
            :color="'inherit'"
            :background="'inherit'"
            size="18px"
          >
            add
          </EpMaterialIcon>
          {{ $t(lisasisalto.label['uusi']) }}
        </ep-button>

        <ep-tekstikappale-lisays
          v-else
          v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
          :tallenna="lisasisalto.save"
          :tekstikappaleet="perusteenOsat"
          :paatasovalinta="true"
          :otsikko-required="false"
          :modal-id="'lisasisaltoLisays'+index"
        >
          <template #lisays-btn-text>
            {{ $t(lisasisalto.label['uusi']) }}
          </template>
          <template #modal-title>
            {{ $t(lisasisalto.label['uusi']) }}
          </template>
          <template #footer-lisays-btn-text>
            {{ $t(lisasisalto.label['lisaa']) }}
          </template>
          <template #header>
            {{ $t(lisasisalto.label['sijainti']) }}
          </template>
          <template #default="{tekstikappale}">
            <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
            {{ $kaanna(tekstikappale.label) }}
          </template>
        </ep-tekstikappale-lisays>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as _ from 'lodash';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { Koulutustyyppi } from '@shared/tyypit';
import { PerusteStore } from '@/stores/PerusteStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KoulutuksenOsaStore } from '@/stores/KoulutuksenOsaStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import { TavoitesisaltoalueStore } from '@/stores/TavoitesisaltoalueStore';
import { KotoKielitaitotasoStore } from '@/stores/Koto/KotoKielitaitotasoStore';
import { KotoOpintoStore } from '@/stores/Koto/KotoOpintoStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { NavigationNodeDtoTypeEnum, PerusteDtoTyyppiEnum } from '@shared/api/eperusteet';
import { chapterStringSort } from '@shared/utils/NavigationBuilder';
import { KotoLaajaalainenOsaaminenStore } from '@/stores/Koto/KotoLaajaalainenOsaaminenStore';
import { OsaamiskokonaisuusStore } from '@/stores/OsaamiskokonaisuusStore';
import { TaiteenalaStore } from '@/stores/TaiteenalaStore';
import { PerusopetusOppiaineStore } from '@/stores/PerusopetusOppiaineStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';

const props = defineProps<{
  perusteStore: PerusteStore;
  naviStore: EpTreeNavibarStore;
}>();

const router = useRouter();
const route = useRoute();

const loading = ref(false);

const projekti = computed(() => {
  return props.perusteStore.projekti.value;
});

const peruste = computed(() => {
  return props.perusteStore.peruste.value;
});

const tekstikappaleet = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.Viite);
});

const opintokokonaisuudet = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
});

const koulutuksenosat = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
});

const laajaalaisetosaamiset = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.Laajaalainenosaaminen);
});

const tavoitesisaltoalueet = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.Tavoitesisaltoalue);
});

const kotoKielitaitotasot = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.KotoKielitaitotaso);
});

const kotoOpinnot = computed(() => {
  return _.filter(props.naviStore!.connected, node => node.type === NavigationNodeDtoTypeEnum.KotoOpinto);
});

const perusteenOsat = computed(() => {
  return _.sortBy([
    ...tekstikappaleet.value,
    ...opintokokonaisuudet.value,
    ...koulutuksenosat.value,
    ...laajaalaisetosaamiset.value,
    ...tavoitesisaltoalueet.value,
    ...kotoKielitaitotasot.value,
    ...kotoOpinnot.value,
  ], osa => chapterStringSort(osa.chapter));
});

const tekstikappaleRoute = computed(() => {
  if (peruste.value && (peruste.value.tyyppi as any) === 'opas') {
    return 'oppaanTekstikappale';
  }

  return 'tekstikappale';
});

const oppiaineId = computed(() => {
  return route.params?.oppiaineId;
});

const currentLukioOppimaara = computed(() => {
  if (oppiaineId.value) {
    return _.get(_.find(props.naviStore.connected.value, node => node.id === _.toNumber(oppiaineId.value)), 'depth') === 3;
  }

  return undefined;
});

const lukioSisaltoLisays = computed(() => {
  return [
    ...(oppiaineId.value && !currentLukioOppimaara.value ? [
      {
        call: () => uusiLukioOppiaine(oppiaineId.value),
        label: {
          'uusi': 'uusi-oppimaara',
        },
      },
    ] : []),
    ...(oppiaineId.value ? [
      {
        call: () => uusiLukioModuuli(oppiaineId.value),
        label: {
          'uusi': 'uusi-moduuli',
        },
      },
    ] : []),
    {
      call: uusiLukioOppiaine,
      label: {
        'uusi': 'uusi-oppiaine',
      },
    },
  ];
});

const koulutustyypinLisasisaltoLisays = computed(() => {
  return {
    [Koulutustyyppi.aikuistenperusopetus]: [
      {
        groupedSisalto: [],
        call: uusiVaihe,
        label: {
          'uusi': 'uusi-vaihe',
        },
      },
    ],
    [Koulutustyyppi.tpo]: [
      {
        groupedSisalto: [],
        call: uusiTaiteenala,
        label: {
          'uusi': 'uusi-taiteenala',
        },
      },
    ],
    [Koulutustyyppi.perusopetus]: [
      {
        groupedSisalto: [],
        call: uusiPerusopetusoppiaine,
        label: {
          'uusi': route.params?.oppiaineId ? 'uusi-oppimaara' : 'uusi-oppiaine',
        },
      },
    ],
    [Koulutustyyppi.lukiokoulutus]: [
      ...lukioSisaltoLisays.value,
    ],
    [Koulutustyyppi.aikuistenlukiokoulutus]: [
      ...lukioSisaltoLisays.value,
    ],
    [Koulutustyyppi.vapaasivistystyo]: [
      {
        groupedSisalto: [],
        save: tallennaUusiOpintokokonaisuus,
        label: {
          'uusi': 'uusi-opintokokonaisuus',
          'lisaa': 'lisaa-opintokokonaisuus',
          'sijainti': 'opintokokonaisuuden-sijainti',
        },
      }],
    [Koulutustyyppi.vapaasivistystyolukutaito]: [
      {
        groupedSisalto: [],
        save: tallennaUusiTavoitesisaltoalue,
        label: {
          'uusi': 'tavoitteet-ja-sisaltoalueet',
          'lisaa': 'lisaa-tavoite-ja-sisaltoalue',
          'sijainti': 'tavoite-ja-sisaltoalue-sijainti',
        },
      }],
    [Koulutustyyppi.maahanmuuttajienkotoutumiskoulutus]: [
      {
        groupedLinkkiteksti: 'tavoitteet-ja-keskeiset-sisallot',
        groupedSisalto: [
          {
            save: tallennaKotoKielitaito,
            label: {
              'uusi': 'kielitaitotasot',
              'lisaa': 'lisaa-kielitaitotaso',
              'sijainti': 'kielitaitotasot-sijainti',
            },
          },
          {
            save: tallennaKotoOpinto,
            label: {
              'uusi': 'tyoelama-ja-yhteiskuntataitojen-opinnot',
              'lisaa': 'lisaa-tyoelama-ja-yhteiskuntataitojen-opinto',
              'sijainti': 'tyoelama-ja-yhteiskuntataitojen-opinnot-sijainti',
            },
          },
        ],
      },
      {
        groupedSisalto: [],
        save: tallennaUusiKotoLaajaAlainenOsaaminen,
        label: {
          'uusi': 'uusi-laaja-alainen-osaaminen',
          'lisaa': 'lisaa-laaja-alainen-osaaminen-perusteen-osa',
          'sijainti': 'laaja-alaisen-osaamisen-sijainti',
        },
      },
    ],
    [Koulutustyyppi.tutkintoonvalmentava]: [
      {
        groupedSisalto: [],
        save: tallennaUusiKoulutuksenOsa,
        label: {
          'uusi': 'uusi-koulutuksenosa',
          'lisaa': 'lisaa-koulutuksenosa',
          'sijainti': 'koulutuksen-osan-sijainti',
        },
      },
      {
        groupedSisalto: [],
        save: tallennaUusiLaajaAlainenOsaaminen,
        label: {
          'uusi': 'uusi-laaja-alainen-osaaminen',
          'lisaa': 'lisaa-laaja-alainen-osaaminen-perusteen-osa',
          'sijainti': 'laaja-alaisen-osaamisen-sijainti',
        },
      },
    ],
  };
});

const perusteTyyppiSisaltoLisays = computed(() => {
  return {
    [_.toLower(PerusteDtoTyyppiEnum.DIGITAALINENOSAAMINEN)]: [
      {
        groupedSisalto: [],
        save: tallennaUusiOsaamiskokonaisuus,
        label: {
          'uusi': 'uusi-osaamiskokonaisuus',
          'lisaa': 'lisaa-osaamiskokonaisuus',
          'sijainti': 'osaamiskokonaisuuden-sijainti',
        },
      }],
  };
});

const osaamisalat = computed(() => {
  return peruste.value?.osaamisalat;
});

const isLisasisaltoLisays = computed(() => {
  return !!peruste.value && (!!koulutustyypinLisasisaltoLisays.value[peruste.value.koulutustyyppi!] || !!perusteTyyppiSisaltoLisays.value[peruste.value.tyyppi!]);
});

const lisasisaltoLisays = computed(() => {
  return koulutustyypinLisasisaltoLisays.value[peruste.value!.koulutustyyppi!] || perusteTyyppiSisaltoLisays.value[peruste.value!.tyyppi!] || [];
});

const makeCall = async (call) => {
  loading.value = true;
  try {
    await call();
  }
  finally {
    loading.value = false;
  }
};

const tallennaUusiTekstikappale = async (otsikko, tekstikappaleIsa, osaamisala) => {
  const tkstore = new TekstikappaleStore(peruste.value!.id!, 0);
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa, osaamisala);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: tekstikappaleRoute.value,
    params: {
      tekstiKappaleId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiOpintokokonaisuus = async (otsikko, tekstikappaleIsa) => {
  const tkstore = new OpintokokonaisuusStore(peruste.value!.id!, 0);
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'opintokokonaisuus',
    params: {
      opintokokonaisuusId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiTavoitesisaltoalue = async (otsikko, tekstikappaleIsa) => {
  const tkstore = new TavoitesisaltoalueStore(peruste.value!.id!, 0);
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'tavoitesisaltoalue',
    params: {
      tavoitesisaltoalueId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiKoulutuksenOsa = async (otsikko, tekstikappaleIsa) => {
  const tkstore = new KoulutuksenOsaStore(peruste.value!.id!, 0);
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'koulutuksenosa',
    params: {
      koulutuksenosaId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiLaajaAlainenOsaaminen = async (otsikko, tekstikappaleIsa) => {
  const tkstore = new LaajaalainenOsaaminenStore(peruste.value!.id!, 0);
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'laajaalainenosaaminen',
    params: {
      laajaalainenosaaminenId: '' + tallennettu!.id,
    },
  });
};

const tallennaKotoKielitaito = async (otsikko, tekstikappaleIsa) => {
  const tkstore = new KotoKielitaitotasoStore();
  const tallennettu = await tkstore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'koto_kielitaitotaso',
    params: {
      kotokielitaitotasoId: '' + tallennettu!.id,
    },
  });
};

const tallennaKotoOpinto = async (otsikko, tekstikappaleIsa) => {
  const tallennettu = await new KotoOpintoStore().create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'koto_opinto',
    params: {
      kotoOpintoId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiKotoLaajaAlainenOsaaminen = async (otsikko, tekstikappaleIsa) => {
  const kotoStore = new KotoLaajaalainenOsaaminenStore(peruste.value!.id!, 0);
  const tallennettu = await kotoStore.create(otsikko, tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'koto_laajaalainenosaaminen',
    params: {
      kotoLaajaalainenOsaaminenId: '' + tallennettu!.id,
    },
  });
};

const tallennaUusiOsaamiskokonaisuus = async (otsikko, tekstikappaleIsa) => {
  const osaamiskokonaisuusStore = new OsaamiskokonaisuusStore(peruste.value!.id!, 0);
  const tallennettu = await osaamiskokonaisuusStore.create(tekstikappaleIsa);
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'osaamiskokonaisuus',
    params: {
      osaamiskokonaisuusId: '' + tallennettu!.id,
    },
  });
};

const uusiVaihe = async () => {
  router.push({ name: 'aipevaihe' });
};

const uusiLukioOppiaine = async (oppiaineId?) => {
  router.push({
    name: 'lukio_oppiaine',
    ...(oppiaineId && { query: { parentId: oppiaineId } }),
  });
};

const uusiLukioModuuli = async (oppiaineId) => {
  router.push({
    name: 'moduuli',
    params: {
      oppiaineId,
    },
  });
};

const uusiTaiteenala = async () => {
  const taiteenalaStore = new TaiteenalaStore(peruste.value!.id!, 0);
  const tallennettu = await taiteenalaStore.create();
  await props.perusteStore.updateNavigation();
  await router.push({
    name: 'taiteenala',
    params: {
      taiteenalaId: '' + tallennettu!.id,
      uusi: 'uusi',
    },
  });
};

const uusiPerusopetusoppiaine = async () => {
  const newOppiaine = await PerusopetusOppiaineStore.create(peruste.value!.id!, route.params?.oppiaineId);
  await props.perusteStore.updateNavigation();
  router.push({ name: 'perusopetusoppiaine', params: { oppiaineId: _.toString(newOppiaine.id), uusi: 'uusi' } });
};
</script>

<style lang="scss" scoped>
@import '@/styles/_variables';

.lisasisalto-dropdown :deep(ep-button),
.navigation :deep(.ep-button .btn) {
  font-size: 14px;
}

.lisasisalto-dropdown :deep(.btn) {
  &.dropdown-toggle {
    padding: 0;
    border: 0;

    .btn {
      padding-top: 0px;
    }
  }
}

.lisasisalto-dropdown :deep(.dropdown-menu .ep-button .btn) {
  color: $black;
  padding: 0;
}
</style>
