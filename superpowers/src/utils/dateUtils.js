export function getDaysDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2 - d1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isRenewalImminent(renewalDateStr, systemDateStr) {
  const diff = getDaysDifference(systemDateStr, renewalDateStr);
  return diff >= 0 && diff <= 7;
}
