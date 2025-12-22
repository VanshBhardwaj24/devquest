import React from 'react';
import { Fitness } from './Fitness';
import { Finance } from './Finance';
import { Relationships } from './Relationships';
import { Learning } from './Learning';
import { Accountability } from './Accountability';
import { LifeMap } from './LifeMap';
import { Mindfulness } from './Mindfulness';
import { Networking } from './Networking';
import { BucketList } from './BucketList';

interface LifeProps {
  section:
    | 'fitness'
    | 'finance'
    | 'relationships'
    | 'learning'
    | 'accountability'
    | 'lifemap'
    | 'mindfulness'
    | 'networking'
    | 'bucketlist';
}

export function Life({ section }: LifeProps) {
  switch (section) {
    case 'fitness':
      return <Fitness />;
    case 'finance':
      return <Finance />;
    case 'relationships':
      return <Relationships />;
    case 'learning':
      return <Learning />;
    case 'accountability':
      return <Accountability />;
    case 'lifemap':
      return <LifeMap />;
    case 'mindfulness':
      return <Mindfulness />;
    case 'networking':
      return <Networking />;
    case 'bucketlist':
      return <BucketList />;
    default:
      return <LifeMap />;
  }
}
