const VND_FORMATTER = new Intl.NumberFormat('vi-VN');

/** Raw VND amount with thousands separators: 3240000 → "3,240,000". */
export const formatVnd = (n: number) => VND_FORMATTER.format(n);

/** VND amount with the ₫ suffix: 3240000 → "3,240,000₫". */
export const formatTuition = (n: number) => `${VND_FORMATTER.format(n)}₫`;
