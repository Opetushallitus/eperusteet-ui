import { Julkaisut, Perusteprojektit, Maintenance } from '@shared/api/eperusteet';
import { $bvModal, $t, $success, $fail } from '@shared/utils/globals';
import * as _ from 'lodash';
import { h } from 'vue';

export async function vaihdaPerusteTilaConfirm({ meta, route, router }) {
  const vaihdaTila = await $bvModal.msgBoxConfirm($t(meta.confirm) as any, {
    title: $t(meta.title),
    okVariant: 'primary',
    okTitle: $t(meta.okTitle ? meta.okTitle : 'kylla') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (vaihdaTila) {
    try {
      await Perusteprojektit.updatePerusteprojektiTila(meta.projektiId ? meta.projektiId : route.params.projektiId, meta.tila);
      $success($t('tilan-vaihto-' + meta.tila + '-onnistui'));
    }
    catch (e) {
      $fail($t('tilan-vaihto-' + meta.tila + '-epaonnistui'));
    }
    if (meta.reroute) {
      router.push({
        name: meta.reroute(),
      });
    }
  }
}

export async function asetaValmiiksi({ route }) {
  const asetaValmiiksi = await $bvModal.msgBoxConfirm($t('peruste-valmis-varmistus') as any, {
    title: $t('aseta-peruste-valmiiksi') as any,
    okVariant: 'primary',
    okTitle: $t('aseta-valmiiksi') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
  });

  if (asetaValmiiksi) {
    try {
      await Perusteprojektit.updateProjektiTilaOnly(_.toNumber(route.params.projektiId), 'valmis');
      $success($t('tilan-vaihto-valmis-onnistui') as string);
    }
    catch (e) {
      $fail($t('tilan-vaihto-valmis-epaonnistui') as string);
    }
  }
}

export async function avaaPeruste({ route }) {
  const avaa = await $bvModal.msgBoxConfirm($t('peruste-avaus-varmistus') as any, {
    title: $t('avaa-peruste') as any,
    okVariant: 'primary',
    okTitle: $t('avaa') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (avaa) {
    try {
      await Perusteprojektit.avaaPerusteProjekti(_.toNumber(route.params.projektiId));
      $success($t('tilan-vaihto-onnistui') as string);
    }
    catch (e) {
      $fail($t('tilan-vaihto-epaonnistui') as string);
    }
  }
}

export async function kooditaPeruste({ meta }) {
  const avaa = await $bvModal.msgBoxConfirm($t('peruste-kooditus-varmistus') as any, {
    title: $t('koodita-peruste') as any,
    okVariant: 'primary',
    okTitle: $t('koodita') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (avaa) {
    try {
      await Julkaisut.kooditaPeruste(meta.getPerusteId());
      $success($t('kooditus-onnistui') as string);
    }
    catch (e) {
      $fail($t('kooditus-epaonnistui') as string);
    }
  }
}

export async function nollaaJulkaisuTila({ meta }) {
  const avaa = await $bvModal.msgBoxConfirm($t('nollaa-julkaisu-tila-varmistus') as any, {
    title: $t('nollaa-julkaisu-tila') as any,
    okVariant: 'primary',
    okTitle: $t('ok') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (avaa) {
    try {
      await Julkaisut.nollaaJulkaisuTila(meta.getPerusteId());
      $success($t('nollaus-onnistui') as string);
    }
    catch (e) {
      $fail($t('nollaus-epaonnistui') as string);
    }
  }
}

export async function pakotaJulkaisu({ meta }) {
  const vahvistusSisalto = h('div', {},
    [
      h('div', $t('pakota-julkaisu-varmistus') as string),
      ...(meta.validointiVirheet?.length > 0
        ? [
          h('br', ''),
          h('div', $t('julkaisun-estavat-virheet') as string),
          _.map(meta.validointiVirheet, (virhe) => {
            return h('div', ' - ' + $t(virhe.kuvaus) as string);
          })] : []),
    ],
  ).children;

  const pakota = await $bvModal.msgBoxConfirm(vahvistusSisalto as any, {
    title: $t('pakota-julkaisu') as any,
    okVariant: 'primary',
    okTitle: $t('ok') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (pakota) {
    try {
      await Maintenance.teeMaintenanceJulkaisu(meta.getPerusteId(), $t('pakotettu-julkaisu-tiedote') as string);
      $success($t('julkaisu-pakotettu') as string);
    }
    catch (e) {
      console.error(e);
      $fail($t('julkaisu-pakotettu-epaonnistui') as string);
    }
  }
}
