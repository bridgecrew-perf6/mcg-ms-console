import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { DATA_FEDERATION_NAMESPACE } from '../constants';
import {
  ClusterServiceVersionModel,
  NooBaaBucketClassModel,
  NooBaaNamespaceStoreModel,
  PersistentVolumeClaimModel,
  SecretModel,
  NooBaaObjectBucketClaimModel,
} from '../models';
import { referenceForModel } from '../utils';

export const secretResource: WatchK8sResource = {
  isList: true,
  kind: SecretModel.kind,
  namespace: DATA_FEDERATION_NAMESPACE,
};

export const pvcResource: WatchK8sResource = {
  isList: true,
  kind: PersistentVolumeClaimModel.kind,
  namespace: DATA_FEDERATION_NAMESPACE,
};

export const bucketClassResource = {
  kind: referenceForModel(NooBaaBucketClassModel),
  namespace: DATA_FEDERATION_NAMESPACE,
  isList: true,
};

export const nameSpaceStoreResource = {
  kind: referenceForModel(NooBaaNamespaceStoreModel),
  namespace: DATA_FEDERATION_NAMESPACE,
  isList: true,
};

export const operatorResource: WatchK8sResource = {
  kind: referenceForModel(ClusterServiceVersionModel),
  namespace: DATA_FEDERATION_NAMESPACE,
  isList: true,
};

export const bucketClaimResource = {
  kind: referenceForModel(NooBaaObjectBucketClaimModel),
  isList: true,
};

export const eventsResource = {
  isList: true,
  kind: 'Event',
  prop: 'events',
  namespace: DATA_FEDERATION_NAMESPACE,
};
