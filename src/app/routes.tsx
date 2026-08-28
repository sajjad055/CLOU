import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/HomePage";
import { LandingPage } from "./components/LandingPage";
import { PhoneInputPage } from "./components/PhoneInputPage";
import { OTPPage } from "./components/OTPPage";
import { PANVerificationPage } from "./components/PANVerificationPage";
import { PANPrefilledPage } from "./components/PANPrefilledPage";
import { PANPrefilledETBPage } from "./components/PANPrefilledETBPage";
import { PANPrefilledNTBIDPage } from "./components/PANPrefilledNTBIDPage";
import { PANPrefilledETBIDPage } from "./components/PANPrefilledETBIDPage";
import { PANVerificationETBPage } from "./components/PANVerificationETBPage";
import { PANVerificationNTBIDPage } from "./components/PANVerificationNTBIDPage";
import { PANVerificationETBIDPage } from "./components/PANVerificationETBIDPage";
import { AadhaarVerificationPage } from "./components/AadhaarVerificationPage";
import { CKYCConsentPage } from "./components/CKYCConsentPage";
import { CKYCPlusIDPage } from "./components/CKYCPlusIDPage";
import { CKYCCustomerDetailsPage } from "./components/CKYCCustomerDetailsPage";
import { EmployeeIDUploadPage } from "./components/EmployeeIDUploadPage";
import { KYCOptionsPage } from "./components/KYCOptionsPage";
import { AadhaarBiometricPage } from "./components/AadhaarBiometricPage";
import { CKYCVerificationPage } from "./components/CKYCVerificationPage";
import { AadhaarOTPPage } from "./components/AadhaarOTPPage";
import { SuccessSplashPage } from "./components/SuccessSplashPage";
import { LoadingPage } from "./components/LoadingPage";
import { ApplicationSuccessPage } from "./components/ApplicationSuccessPage";
import { CreditLineProcessingPage } from "./components/CreditLineProcessingPage";
import { CreditLineActivatedPage } from "./components/CreditLineActivatedPage";
import { UPIConnectionPage } from "./components/UPIConnectionPage";
import { PhonePeAppMock } from "./components/PhonePeAppMock";
import { CreditLineDashboard } from "./components/CreditLineDashboard";
import { HRMSDetailsPage } from "./components/HRMSDetailsPage";
import { DedupeOutcomePage } from "./components/DedupeOutcomePage";
import { PANAadhaarEntryPage } from "./components/PANAadhaarEntryPage";
import { KycResumePage } from "./components/KycResumePage";
import { Layout } from "./components/Layout";

// On GitHub Pages the app is served from "/CLOU/". Vite exposes that as
// BASE_URL; strip the trailing slash for react-router's basename. Locally
// BASE_URL is "/", which we map to undefined (react-router's default root).
const rawBase = import.meta.env.BASE_URL;
const basename = rawBase && rawBase !== '/' ? rawBase.replace(/\/$/, '') : undefined;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "advances-upi",
        Component: LandingPage,
      },
      {
        path: "phone-input",
        Component: PhoneInputPage,
      },
      {
        path: "otp-verification",
        Component: OTPPage,
      },
      {
        path: "pan-verification",
        Component: PANVerificationPage,
      },
      {
        path: "pan-prefilled",
        Component: PANPrefilledPage,
      },
      {
        path: "pan-prefilled-etb",
        Component: PANPrefilledETBPage,
      },
      {
        path: "pan-prefilled-ntb-id",
        Component: PANPrefilledNTBIDPage,
      },
      {
        path: "pan-prefilled-etb-id",
        Component: PANPrefilledETBIDPage,
      },
      {
        path: "pan-verification-etb",
        Component: PANVerificationETBPage,
      },
      {
        path: "pan-verification-ntb-id",
        Component: PANVerificationNTBIDPage,
      },
      {
        path: "pan-verification-etb-id",
        Component: PANVerificationETBIDPage,
      },
      {
        path: "aadhaar-verification",
        Component: AadhaarVerificationPage,
      },
      {
        path: "ckyc-consent",
        Component: CKYCConsentPage,
      },
      {
        path: "ckyc-plus-id",
        Component: CKYCPlusIDPage,
      },
      {
        path: "ckyc-customer-details",
        Component: CKYCCustomerDetailsPage,
      },
      {
        path: "employee-id-upload",
        Component: EmployeeIDUploadPage,
      },
      {
        path: "kyc-options",
        Component: KYCOptionsPage,
      },
      {
        path: "kyc-aadhaar-biometric",
        Component: AadhaarBiometricPage,
      },
      {
        path: "kyc-ckyc-verification",
        Component: CKYCVerificationPage,
      },
      {
        path: "kyc-aadhaar-otp",
        Component: AadhaarOTPPage,
      },
      {
        path: "success",
        Component: SuccessSplashPage,
      },
      {
        path: "loading",
        Component: LoadingPage,
      },
      {
        path: "sanctioned-offers",
        Component: ApplicationSuccessPage,
      },
      {
        path: "credit-line-processing",
        Component: CreditLineProcessingPage,
      },
      {
        path: "credit-line-activated",
        Component: CreditLineActivatedPage,
      },
      {
        path: "upi-connection",
        Component: UPIConnectionPage,
      },
      {
        path: "phonepe-app-mock",
        Component: PhonePeAppMock,
      },
      {
        path: "credit-line-dashboard",
        Component: CreditLineDashboard,
      },
      {
        path: "hrms-details",
        Component: HRMSDetailsPage,
      },
      {
        path: "hrms-dedupe-outcome",
        Component: DedupeOutcomePage,
      },
      {
        path: "hrms-pan-aadhaar",
        Component: PANAadhaarEntryPage,
      },
      {
        path: "kyc-resume",
        Component: KycResumePage,
      },
    ],
  },
], { basename });