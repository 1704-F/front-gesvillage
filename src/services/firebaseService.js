import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import firebaseConfig from '../config/firebase-config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

// Retirer cette ligne pour la production
// auth.settings.appVerificationDisabledForTesting = true;

const firebaseService = {
  initRecaptcha() {
    try {
      if (!window.recaptchaVerifier) {
        console.log('Initialisation du reCAPTCHA...');
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA vérifié avec succès');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expiré, réinitialisation...');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });
      }
      return window.recaptchaVerifier;
    } catch (error) {
      console.error('Erreur reCAPTCHA:', error);
      throw error;
    }
  },

  async sendSMS(phoneNumber) {
    try {
      console.log('Tentative d\'envoi SMS à', phoneNumber);
      
      // S'assurer que le reCAPTCHA est propre
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      const appVerifier = this.initRecaptcha();
      
      // Envoi réel du SMS
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      
      console.log('SMS envoyé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur envoi SMS:', {
        code: error.code,
        message: error.message
      });
      
      // Nettoyage en cas d'erreur
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      throw error;
    }
  },

  async verifyCode(code) {
    try {
      if (!window.confirmationResult) {
        throw new Error('Pas de SMS en attente de vérification');
      }

      const result = await window.confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      console.error('Erreur vérification code:', error);
      throw error;
    }
  }
};

export default firebaseService;