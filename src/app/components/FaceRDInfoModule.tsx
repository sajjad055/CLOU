import { useLanguage } from '../hooks/useLanguage';
import faceRdImg from '@/assets/facerd.svg';

/**
 * FaceRD info module — shows the user that FaceRD app is required for face verification.
 * Saved as a standalone component for reuse if the standalone-app model is needed.
 * Currently NOT rendered in the main flow (SDK model is used instead).
 */
export function FaceRDInfoModule() {
  const [selectedLanguage] = useLanguage();

  return (
    <div className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 flex items-start gap-3">
      <img src={faceRdImg} alt="FaceRD" className="w-8 h-8 object-contain flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-[#111827] mb-0.5">
          {selectedLanguage === 'English' ? 'Official FaceRD App Required' : 'அதிகாரப்பூர்வ FaceRD பயன்பாடு தேவை'}
        </p>
        <p className="text-[12px] text-[#6b7280] leading-relaxed">
          {selectedLanguage === 'English'
            ? 'When you proceed, please download and install the official FaceRD government app to securely complete this verification.'
            : 'நீங்கள் தொடரும்போது, இந்த சரிபார்ப்பைப் பாதுகாப்பாக முடிக்க அதிகாரப்பூர்வ FaceRD அரசு பயன்பாட்டைப் பதிவிறக்கி நிறுவவும்.'}
        </p>
      </div>
    </div>
  );
}
