export type ReadyBoxTemplate = {
  id: string;
  name: string;
  subtitle: string;
  occasion: string;
  description: string;
  productNames: string[];
  boxFee: number;
};

export const readyBoxTemplates: ReadyBoxTemplate[] = [
  {
    id: "graduation-express",
    name: "Graduation Express Box",
    subtitle: "Celebrate their big moment",
    occasion: "Graduation",
    description:
      "A ready-to-order graduation box combining celebration favorites for a thoughtful last-minute surprise.",
    productNames: [
      "Graduation Celebration Box",
      "Premium Chocolate Collection",
    ],
    boxFee: 4,
  },
  {
    id: "birthday-rescue",
    name: "Birthday Rescue Box",
    subtitle: "Forgot the birthday? We got you.",
    occasion: "Birthday",
    description:
      "A cheerful birthday combination designed for quick gifting without losing the personal touch.",
    productNames: [
      "Blush Bloom Gift Box",
      "Premium Chocolate Collection",
    ],
    boxFee: 4,
  },
  {
    id: "self-care-surprise",
    name: "Self-Care Surprise Box",
    subtitle: "A little moment of comfort",
    occasion: "Self Care",
    description:
      "A calming gift option for someone who deserves a relaxing and thoughtful surprise.",
    productNames: [
      "Self Care Retreat Box",
      "Rose & Chocolate Duo",
    ],
    boxFee: 5,
  },
  {
    id: "congratulations-mini",
    name: "Quick Congratulations Box",
    subtitle: "Small box, big celebration",
    occasion: "Congratulations",
    description:
      "A compact ready-made gift for graduations, achievements, promotions, and happy news.",
    productNames: [
      "Mini Congratulations Box",
      "Celebration Flower Box",
    ],
    boxFee: 3,
  },
];