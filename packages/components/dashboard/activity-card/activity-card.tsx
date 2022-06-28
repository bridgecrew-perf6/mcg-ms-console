import * as React from 'react';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  OngoingActivityBody,
  RecentEventsBody,
} from '@openshift-console/dynamic-plugin-sdk-internal';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/internal-types';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import {
  dataResiliencyQueryMap,
  MCG_MS_PROMETHEUS_URL,
} from '../../../constants';
import { getResiliencyProgress, isObjectStorageEvent } from '../../../utils';
import { useCustomPrometheusPoll } from '../../../utils/hooks/custom-prometheus-poll';
import { eventsResource } from '../../resources';
import './activity-card.scss';

const OngoingActivity: React.FC = () => {
  const [progress, , progressLoading] = useCustomPrometheusPoll({
    query: dataResiliencyQueryMap.MCG_REBUILD_PROGRESS_QUERY,
    endpoint: 'api/v1/query' as any,
    basePath: MCG_MS_PROMETHEUS_URL,
  });
  const [eta] = useCustomPrometheusPoll({
    query: dataResiliencyQueryMap.MCG_REBUILD_TIME_QUERY,
    endpoint: 'api/v1/query' as any,
    basePath: MCG_MS_PROMETHEUS_URL,
  });

  const prometheusActivities = [];

  if (getResiliencyProgress(progress) < 1) {
    prometheusActivities.push({
      results: [progress, eta],
      loader: () =>
        import('./data-resiliency-activity/data-resiliency-activity').then(
          (m) => m.NoobaaDataResiliency
        ),
    });
  }

  return (
    <OngoingActivityBody
      loaded={!progressLoading}
      prometheusActivities={prometheusActivities}
    />
  );
};

const ActivityCard: React.FC = () => {
  const { t } = useTranslation();
  const [data, loaded, loadError] =
    useK8sWatchResource<EventKind[]>(eventsResource);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Activity')}</CardTitle>
      </CardHeader>
      <CardBody className="activity-card-body ">
        <OngoingActivity />
        <RecentEventsBody
          events={{
            data,
            loaded,
            loadError,
          }}
          filter={isObjectStorageEvent}
        />
      </CardBody>
    </Card>
  );
};

export default ActivityCard;
