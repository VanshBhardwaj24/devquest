import React from 'react';
import { InternshipTracker as LifeInternshipTracker } from '../Life/InternshipTracker';

// Wrapper: Dashboard no longer hosts the internship quest implementation.
// This file forwards to the Life tab's implementation so imports remain valid.
export function InternshipTracker() {
  return <LifeInternshipTracker />;
}

export default InternshipTracker;
