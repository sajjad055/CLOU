/**
 * The salary-advance offer catalogue — the single source of truth for the two
 * demo credit lines (Festival, Gadget) shared across the offers-selection UI,
 * the activated-advances list, and the activation success screen.
 *
 * Keeping the names, amounts, illustrations, account prefixes and usage
 * restrictions here stops the same two offers being re-declared (and drifting)
 * in each screen that shows them.
 */

import festivalAdvanceImg from '@/assets/festival-vectorized.svg';
import gadgetAdvanceImg from '@/assets/gadget-vectorized.svg';

export interface AdvanceOffer {
  id: string;
  nameEn: string;
  nameTa: string;
  amount: string;
  image: string;
  /** Tailwind sizing/offset for the card illustration. */
  imageClass: string;
  /** Prefix used to synthesise a demo loan-account number. */
  accountPrefix: string;
  usageEn: string;
  usageTa: string;
}

export const ADVANCE_OFFERS: AdvanceOffer[] = [
  {
    id: 'festival',
    nameEn: 'Festival Advance',
    nameTa: 'பண்டிகை முன்பணம்',
    amount: '₹50,000',
    image: festivalAdvanceImg,
    imageClass: 'h-[110px] translate-y-[8px]',
    accountPrefix: 'festival',
    usageEn: 'This credit line can be used for festival-related purchases at any merchant.',
    usageTa: 'இந்த கடன் வரியை எந்த வணிகரிடமும் பண்டிகை தொடர்பான கொள்முதலுக்கு பயன்படுத்தலாம்.',
  },
  {
    id: 'gadget',
    nameEn: 'Gadget Purchase Advance',
    nameTa: 'கேஜெட் கொள்முதல் முன்பணம்',
    amount: '₹75,000',
    image: gadgetAdvanceImg,
    imageClass: 'h-[110px] translate-y-[8px]',
    accountPrefix: 'gadget',
    usageEn: 'This credit line can be used at authorized electronics, mobile, and computer stores.',
    usageTa: 'இந்த கடன் வரியை அங்கீகரிக்கப்பட்ட மின்னணு, மொபைல் மற்றும் கணினி கடைகளில் பயன்படுத்தலாம்.',
  },
];

export function getAdvanceOffer(id: string): AdvanceOffer | null {
  return ADVANCE_OFFERS.find((offer) => offer.id === id) ?? null;
}
