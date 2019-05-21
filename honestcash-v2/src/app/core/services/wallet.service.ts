import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import Wallet from '../models/wallet';
import {isPlatformBrowser} from '@angular/common';
import {ISimpleBitcoinWallet, WalletUtils} from '../../shared/lib/WalletUtils';
import {LoginSuccessResponse, OkResponse, SignupSuccessResponse} from '../models/authentication';
import {Logger} from './logger.service';
import {defer, Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';
import {HttpService} from '..';

export const API_ENDPOINTS = {
  setWallet: `/auth/set-wallet`,
};

export const WALLET_LOCALSTORAGE_KEYS = {
  HD_PATH: 'HC_BCH_HD_PATH',
  MNEMONIC: 'HC_BCH_MNEMONIC',
  PRIVATE_KEY: 'HC_BCH_PRIVATE_KEY'
};

export const WALLET_DEFAULT_HD_PATH = `m/44'/0'/0'/0/0`;

@Injectable({providedIn: 'root'})
export class WalletService {
  _wallet: Wallet = null;
  wallet: Wallet = null;

  private logger: Logger;
  readonly locallySavedMnemonic: string | void;
  readonly isPlatformBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject('LOCALSTORAGE') private localStorage: Storage,
    private http: HttpService,
    private authenticationService: AuthenticationService,
  ) {
    this.logger = new Logger('WalletService');
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    this.locallySavedMnemonic = this.getWalletMnemonic();
  }

  public setupWallet(payload?: LoginSuccessResponse | SignupSuccessResponse) {
    return defer(
      async () => {
        let simpleWallet: ISimpleBitcoinWallet;

        if (payload) {
          if ((<LoginSuccessResponse>payload).wallet) {
            // if there is a payload and a wallet attached
            // it means it is a login action
            this.logger.info('Setting up an already existing wallet');
            simpleWallet = await WalletUtils.generateWalletWithEncryptedRecoveryPhrase(
              (<LoginSuccessResponse>payload).wallet.mnemonicEncrypted,
              payload.password
            );
          } else {
            // if there is a payload but NO wallet attached
            // it means it is a signup action with only the password
            this.logger.info('Creating new wallet.');
            simpleWallet = await WalletUtils.generateNewWallet(payload.password);
          }
        } else {
          if (this.authenticationService.getToken() && this.locallySavedMnemonic) {
            // if there is no payload
            // but there is a decrypted mnemonic and a token in the localstorage
            // it means the app loads wallet from localStorage
            simpleWallet = await WalletUtils.generateWalletWithDecryptedRecoveryPhrase(this.locallySavedMnemonic);
          }
          /*
              there needs to be an else if block here
              else if (this.authenticationService.getToken() && !this.locallySavedMnemonic)
              so it should somehow load a wallet via API request because user auto-logs in
              to get encrypted mnemonic (but also requires the password to decrypt and load wallet)
              or that it creates a brand new wallet but it also requires a password but there is no payload
              because it is appload

           */
        }
        return simpleWallet;
      }
    );
  }

  public getWalletMnemonic(): string | void {
    if (this.isPlatformBrowser) {
      return this.localStorage.getItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC);
    }
  }

  public setWallet(wallet: ISimpleBitcoinWallet | Wallet): Observable<OkResponse> {
    if (this.isPlatformBrowser) {
      this.localStorage.setItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC, wallet.mnemonic);
    }
    return this.http.post<OkResponse>(API_ENDPOINTS.setWallet, wallet.mnemonicEncrypted);
  }

  public unsetWallet(): void {
    if (this.isPlatformBrowser) {
      this.localStorage.removeItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC);
    }
  }
}
