import React from 'react';
import { getDaysDifference, isRenewalImminent } from '../utils/dateUtils';

export default function AlertBadge({ renewalDate, systemDate }) {
  const diff = getDaysDifference(systemDate, renewalDate);

  if (diff < 0) {
    return <span className="badge badge-overdue">Overdue</span>;
  }
  if (isRenewalImminent(renewalDate, systemDate)) {
    return <span className="badge badge-imminent">Renewal Imminent</span>;
  }
  return null;
}
