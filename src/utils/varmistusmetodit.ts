import { Julkaisut, Perusteprojektit, Maintenance } from '@shared/api/eperusteet';
import * as _ from 'lodash';

export async function vaihdaPerusteTilaConfirm(el, meta) {
  const vaihdaTila = await el.$bvModal.msgBoxConfirm(el.$t(meta.confirm) as any, {
    title: el.$t(meta.title),
    okVariant: 'primary',
    okTitle: el.$t(meta.okTitle ? meta.okTitle : 'kylla') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (vaihdaTila) {
    try {
      await Perusteprojektit.updatePerusteprojektiTila(meta.projektiId ? meta.projektiId : el.$route.params.projektiId, meta.tila);
      el.$success(el.$t('tilan-vaihto-' + meta.tila + '-onnistui'));
    }
    catch (e) {
      el.$fail(el.$t('tilan-vaihto-' + meta.tila + '-epaonnistui'));
    }
    if (meta.reroute) {
      el.$router.push({
        name: meta.reroute(),
      });
    }
  }
}

export async function asetaValmiiksi(el) {
  const asetaValmiiksi = await el.$bvModal.msgBoxConfirm(el.$t('peruste-valmis-varmistus') as any, {
    title: el.$t('aseta-peruste-valmiiksi') as any,
    okVariant: 'primary',
    okTitle: el.$t('aseta-valmiiksi') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: el,
  });

  if (asetaValmiiksi) {
    try {
      await Perusteprojektit.updateProjektiTilaOnly(_.toNumber(el.$route.params.projektiId), 'valmis');
      el.$success(el.$t('tilan-vaihto-valmis-onnistui') as string);
    }
    catch (e) {
      el.$fail(el.$t('tilan-vaihto-valmis-epaonnistui') as string);
    }
  }
}

export async function avaaPeruste(el) {
  const avaa = await el.$bvModal.msgBoxConfirm(el.$t('peruste-avaus-varmistus') as any, {
    title: el.$t('avaa-peruste') as any,
    okVariant: 'primary',
    okTitle: el.$t('avaa') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: el,
  });

  if (avaa) {
    try {
      await Perusteprojektit.avaaPerusteProjekti(_.toNumber(el.$route.params.projektiId));
      el.$success(el.$t('tilan-vaihto-onnistui') as string);
    }
    catch (e) {
      el.$fail(el.$t('tilan-vaihto-epaonnistui') as string);
    }
  }
}

export async function kooditaPeruste(el, meta) {
  const avaa = await el.$bvModal.msgBoxConfirm(el.$t('peruste-kooditus-varmistus') as any, {
    title: el.$t('koodita-peruste') as any,
    okVariant: 'primary',
    okTitle: el.$t('koodita') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (avaa) {
    try {
      await Julkaisut.kooditaPeruste(meta.getPerusteId());
      el.$success(el.$t('kooditus-onnistui') as string);
    }
    catch (e) {
      el.$fail(el.$t('kooditus-epaonnistui') as string);
    }
  }
}

export async function nollaaJulkaisuTila(el, meta) {
  const avaa = await el.$bvModal.msgBoxConfirm(el.$t('nollaa-julkaisu-tila-varmistus') as any, {
    title: el.$t('nollaa-julkaisu-tila') as any,
    okVariant: 'primary',
    okTitle: el.$t('ok') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (avaa) {
    try {
      await Julkaisut.nollaaJulkaisuTila(meta.getPerusteId());
      el.$success(el.$t('nollaus-onnistui') as string);
    }
    catch (e) {
      el.$fail(el.$t('nollaus-epaonnistui') as string);
    }
  }
}

export async function pakotaJulkaisu(el, meta) {
  const vahvistusSisalto = el.$createElement('div', {},
    [
      el.$createElement('div', el.$t('pakota-julkaisu-varmistus') as string),
      ...(meta.validointiVirheet?.length > 0
        ? [
          el.$createElement('br', ''),
          el.$createElement('div', el.$t('julkaisun-estavat-virheet') as string),
          _.map(meta.validointiVirheet, (virhe) => {
            return el.$createElement('div', ' - ' + el.$t(virhe.kuvaus) as string);
          })] : []),
    ],
  ).children;

  const pakota = await el.$bvModal.msgBoxConfirm(vahvistusSisalto as any, {
    title: el.$t('pakota-julkaisu') as any,
    okVariant: 'primary',
    okTitle: el.$t('ok') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (pakota) {
    try {
      await Maintenance.teeMaintenanceJulkaisu(meta.getPerusteId(), el.$t('pakotettu-julkaisu-tiedote') as string);
      el.$success(el.$t('julkaisu-pakotettu') as string);
    }
    catch (e) {
      el.$fail(el.$t('julkaisu-pakotettu-epaonnistui') as string);
    }
  }
}
