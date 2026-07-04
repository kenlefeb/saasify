import React from 'react';
import { getDaysDifference } from '../utils/dateUtils';

export default function AlertBadge({ renewalDate, systemDate }) {
  const diff = getDaysDifference(systemDate, renewalDate);

  if (diff < 0) {
    return <span className="badge badge-overdue">Overdue</span>;
  }
  if (diff >= 0 && diff <= 7) {
    return <span className="badge badge-imminent">Renewal Imminent</span>;
  }
  return null;
}
