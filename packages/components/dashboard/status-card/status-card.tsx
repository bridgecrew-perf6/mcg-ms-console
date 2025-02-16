import * as React from 'react';
import { HealthBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  Gallery,
  GalleryItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { MCG_MS_PROMETHEUS_URL, PrometheusEndpoint } from '../../../constants';
import HealthItem from '../../../utils/dashboard/status-card/HealthItem';
import { useCustomPrometheusPoll } from '../../../utils/hooks/custom-prometheus-poll';
import { getOperatorHealthState } from '../utils';

export const StatusCard: React.FC = () => {
  const { t } = useTranslation();

  const [healthStatusResult, healthStatusError, healthStatusLoading] =
    useCustomPrometheusPoll({
      query: 'NooBaa_health_status',
      endpoint: PrometheusEndpoint.QUERY as any,
      basePath: MCG_MS_PROMETHEUS_URL,
    });

  const operatorHealthStatus = getOperatorHealthState(
    healthStatusResult?.status,
    healthStatusLoading,
    healthStatusError
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Status')}</CardTitle>
      </CardHeader>
      <CardBody>
        <HealthBody>
          <Gallery className="co-overview-status__health" hasGutter>
            <GalleryItem>
              <HealthItem
                title={t('Data Federation service')}
                state={operatorHealthStatus.state}
              />
            </GalleryItem>
          </Gallery>
        </HealthBody>
      </CardBody>
    </Card>
  );
};
