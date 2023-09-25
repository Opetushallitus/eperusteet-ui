const kohdereititys = {
  viite: 'tekstikappale',
  opetussuunnitelma: 'opsTiedot',
  opetussuunnitelma_rakenne: 'jarjesta',
  poppiaine: 'paikallinenOppiaine',
  opintojakso: 'opintojakso',
  termi: 'opsKasitteet',
};

const kohdereititysId = {
  viite: 'osaId',
  poppiaine: 'paikallinenOppiaineId',
  opintojakso: 'opintojaksoId',
};

const kohdeIcon = {
  viite: 'edit',
  opetussuunnitelma: 'article',
  opetussuunnitelma_rakenne: 'low_priority',
  termi: 'book',
  kommentti: 'comment',
};

const tapahtumaIcon = {
  paivitys: 'edit',
  luonti: 'add',
  poisto: 'delete',
  palautus: 'keyboard_return',
};

const poistetutTabIndices = {
  opintojakso: 0,
  poppiaine: 1,
  viite: 2,
};

export function muokkaustietoRoute(id, kohde, tapahtuma) {
  if (tapahtuma === 'poisto') {
    return {
      name: 'opsPoistetut',
      params: {
        tabIndex: poistetutTabIndices[kohde],
      },
    };
  }

  const router = {
    name: kohdereititys[kohde],
    params: {},
  };

  if (kohdereititysId[kohde]) {
    router.params[kohdereititysId[kohde]] = id;
  }

  return router;
}

export function muokkaustietoIcon(kohde, tapahtuma) {
  if (kohde === 'kommentti' || kohde === 'opetussuunnitelma_rakenne') {
    return kohdeIcon[kohde];
  }

  return tapahtumaIcon[tapahtuma] ? tapahtumaIcon[tapahtuma] : 'question_mark';
}
