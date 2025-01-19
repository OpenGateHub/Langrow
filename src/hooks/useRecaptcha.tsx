"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function useRecaptcha(siteKey: string) {
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    if (value) {
      setCaptchaError(null); 
    }
  };

  const validateCaptcha = () => {
    if (!captchaValue) {
      setCaptchaError("Por favor, verifica que no eres un robot.");
      return false;
    }
    return true;
  };

  return {
    captchaValue,
    captchaError,
    recaptchaRef,
    handleCaptchaChange,
    validateCaptcha,
    RecaptchaComponent: () => (
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={handleCaptchaChange}
        ref={recaptchaRef} 
      />
    ),
  };
}
