import { computed } from 'vue';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Sisallot } from '@shared/api/eperusteet';
import { required, requiredIf } from '@vuelidate/validators';
import { koodistoKoodiValidator, requiredOneLang } from '@shared/validators/required';
import { AbstractPerusteenOsaViiteStore } from '@/stores/AbstractPerusteenOsaViiteStore';
import { LaajuusYksikko } from '@shared/tyypit';

export class TaiteenalaVaiheStore extends AbstractPerusteenOsaViiteStore implements IEditoitava {
  constructor(
    public perusteId?: number,
    public taiteenalaVaiheId?: number,
    public versionumero?: number,
    public isNew?: boolean,
  ) {
    super(perusteId, taiteenalaVaiheId, versionumero);
  }

  getOsanType() {
    return 'taiteenalavaihe';
  }

  public async load() {
    const data = await this.fetchPerusteenOsat();
    return {
      ...data,
      laajuusYksikko: data?.laajuusYksikko ?? LaajuusYksikko.OPINTOPISTE,
      tavoitealueet: data?.tavoitealueet ?? [],
      vapaatTekstit: data?.vapaatTekstit ?? [],
    };
  }

  public async editAfterLoad() {
    return !!this.isNew;
  }

  public readonly validator = computed(() => {
    return {
      koodi: { required },
      tavoitealueet: {
        $each: {
          otsikko: {
            required: requiredIf((value) => {
              return value && value.tavoiteAlueTyyppi === 'OTSIKKO';
            }),
          },
          tavoitteet: {
            $each: {
              ...koodistoKoodiValidator(),
              uri: { required },
            },
          },
          keskeisetSisaltoalueet: {
            $each: {
              ...requiredOneLang(),
            },
          },
        },
      },
    };
  });

  public static async create(taiteenalaViiteId: number) {
    const perusteenOsa = {
      perusteenOsa: {
        osanTyyppi: 'taiteenalavaihe',
        laajuusYksikko: LaajuusYksikko.OPINTOPISTE,
      } as any,
    };

    const tallennettu = await Sisallot.addSisaltoUusiLapsiViitteella(
      TaiteenalaVaiheStore.config.perusteStore.perusteId.value as number,
      TaiteenalaVaiheStore.config.perusteStore.perusteSuoritustapa.value as any,
      taiteenalaViiteId,
      perusteenOsa,
    );

    return tallennettu.data;
  }
}
