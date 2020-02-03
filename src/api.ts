import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@shared/utils/logger';
import _ from 'lodash';
import {
  DokumentitApi,
  DokumentitApiAxiosParamCreator,
  KayttajatApi,
  LiitetiedostotApi,
  Lops2019Api,
  TiedotteetApi,
  PerusteetApi,

} from '@/generated/api';

axios.defaults.headers.common['Caller-Id'] = '1.2.246.562.10.00000000001.eperusteet';

type FactoryFn<T> = (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const logger = createLogger('Axios');
const basePath = '';

export const baseURL = '/eperusteet-service/api';

const ax = axios.create({
  baseURL,
});

function axiosHandler(msg: string) {
  return async (err: any) => {
    logger.error(msg, err);
    throw err;
  };
}

// Apufuntio kirjautumiseen ja paluulinkin luontiin
function getCasURL() {
  const host = location.host;
  const protocol = location.protocol;
  const redirectURL = encodeURIComponent(window.location.href);
  return protocol + '//' + host + '/cas/login?service=' + redirectURL;
}

function successfulResponseHandler() {
  return async (res: any) => {
    try {
      if (res.status === 200) {
        const url = new URL(res.request.responseURL);
        if (_.startsWith(url.pathname, '/cas/login')) {
          // Uudelleenohjataan kirjautumiseen jos nykyinen pyyntö on jo mennyt kirjautumissivulle
          window.location.href = getCasURL();
        }
      }
    }
    catch (e) {
      return res;
    }
    return res;
  };
}

ax.interceptors.request.use(_.identity, axiosHandler('Request error'));
ax.interceptors.response.use(successfulResponseHandler(), axiosHandler('Response error'));

// https://github.com/Microsoft/TypeScript/issues/20719
type BaseAPIConstructor<T> = new(configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const configuration = { basePath };

function initApi<T>(X: BaseAPIConstructor<T>): T {
  return new X(configuration, basePath, ax);
}

export const Api = ax;
export const Dokumentit = initApi(DokumentitApi);
export const Kayttajat = initApi(KayttajatApi);
export const Liitetiedostot = initApi(LiitetiedostotApi);
export const Lops2019 = initApi(Lops2019Api);
export const Tiedotteet = initApi(TiedotteetApi);
export const Perusteet = initApi(PerusteetApi);

