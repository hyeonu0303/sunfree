const generateCouponNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `CP-${year}-${randomNum}`;
};

export { generateCouponNumber };
