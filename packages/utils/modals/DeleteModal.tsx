import * as React from 'react';
import {
  k8sDelete,
  k8sList,
  K8sResourceCommon,
  OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import * as _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Alert, Button, Modal, ModalVariant } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { ClusterServiceVersionModel } from '../../models';
import { ClusterServiceVersionKind } from '../../types';
import { groupVersionFor, referenceForOwnerRef } from '../common';
import { LoadingInline } from '../generics/Loading';
import { ModalBody, ModalFooter, ModalHeader, CommonModalProps } from './Modal';

type DeleteModalExtraProps = {
  resource: K8sResourceCommon;
  resourceModel: K8sModel;
  redirectPath?: string;
};

const isOwnedByOperator = (
  csv: ClusterServiceVersionKind,
  owner: OwnerReference
) => {
  const { group } = groupVersionFor(owner.apiVersion);
  return csv.spec?.customresourcedefinitions?.owned?.some((owned) => {
    const ownedGroup = owned.name.substring(owned.name.indexOf('.') + 1);
    return owned.kind === owner.kind && ownedGroup === group;
  });
};

const isOwnedByCSV = (
  csv: ClusterServiceVersionKind,
  owner: OwnerReference
) => {
  const { group } = groupVersionFor(owner.apiVersion);
  return (
    group === ClusterServiceVersionModel.apiGroup &&
    owner.kind === ClusterServiceVersionModel.kind &&
    csv.metadata.name === owner.name
  );
};

export const findOwner = (
  obj: K8sResourceCommon,
  csvs: ClusterServiceVersionKind[]
) => {
  return obj?.metadata?.ownerReferences?.find((o) =>
    csvs?.some((csv) => isOwnedByOperator(csv, o) || isOwnedByCSV(csv, o))
  );
};

const DeleteModal: React.FC<CommonModalProps<DeleteModalExtraProps>> = ({
  closeModal,
  isOpen,
  extraProps: { resource, resourceModel, redirectPath = '/' },
}) => {
  const { t } = useTranslation('plugin__mcg-ms-console');
  const history = useHistory();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [isChecked, setIsChecked] = React.useState(true);
  const [owner, setOwner] = React.useState(null);
  React.useEffect(() => {
    const namespace = resource?.metadata?.namespace;
    if (!namespace || !resource?.metadata?.ownerReferences?.length) {
      return;
    }
    k8sList<ClusterServiceVersionKind>({
      model: ClusterServiceVersionModel,
      queryParams: { namespace },
      requestInit: null,
    })
      .then((data) => {
        const resourceOwner = findOwner(resource, data as any);
        setOwner(resourceOwner);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Could not fetch CSVs', e);
      });
  });

  const submit = (event) => {
    event.preventDefault();
    setLoading(true);

    //https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/
    const propagationPolicy =
      isChecked && resourceModel ? resourceModel.propagationPolicy : 'Orphan';
    const json = propagationPolicy
      ? { kind: 'DeleteOptions', apiVersion: 'v1', propagationPolicy }
      : null;

    k8sDelete({ resource, model: resourceModel, json, requestInit: null })
      .then(() => {
        // If we are currently on the deleted resource's page, redirect to the resource list page
        const re = new RegExp(`/${resource.metadata.name}(/|$)`);
        if (re.test(window.location.pathname)) {
          history.replace(redirectPath);
        } else {
          closeModal();
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const header = (
    <ModalHeader>
      <ExclamationTriangleIcon color="#f0ab00" className="icon--spacer" />
      {t('Delete {{kind}}?', {
        kind: resourceModel
          ? resourceModel.labelKey
            ? t(resourceModel.labelKey)
            : resourceModel.label
          : '',
      })}
    </ModalHeader>
  );

  const isNamespaced: boolean = !!resource?.metadata?.namespace;
  const isPropagative = !!resourceModel.propagationPolicy;

  return (
    <Modal
      variant={ModalVariant.small}
      header={header}
      isOpen={isOpen}
      onClose={closeModal}
      showClose={false}
      hasNoBodyWrapper={true}
    >
      <ModalBody>
        {isNamespaced ? (
          <Trans t={t}>
            Are you sure you want to delete{' '}
            <strong className="co-break-word">
              {{ resourceName: resource.metadata.name }}
            </strong>{' '}
            in namespace{' '}
            <strong>{{ namespace: resource.metadata.namespace }}</strong>?
          </Trans>
        ) : (
          <Trans t={t}>
            Are you sure you want to delete{' '}
            <strong className="co-break-word">
              {{ resourceName: resource.metadata.name }}
            </strong>
            ?
          </Trans>
        )}
        {isPropagative && (
          <div className="checkbox">
            <label className="control-label">
              <input
                type="checkbox"
                onChange={() => setIsChecked(!isChecked)}
                checked={!!isChecked}
              />
              {t('Delete dependent objects of this resource')}
            </label>
          </div>
        )}
        {owner && (
          <Alert
            className="co-alert co-alert--margin-top"
            isInline
            variant="warning"
            title={t('Managed resource')}
          >
            <Trans t={t}>
              This resource is managed by{' '}
              <ResourceLink
                className="modal__inline-resource-link"
                inline
                kind={referenceForOwnerRef(owner)}
                name={owner.name}
                namespace={resource.metadata.namespace}
                onClick={closeModal}
              />
              and any modifications may be overwritten. Edit the managing
              resource to preserve changes.
            </Trans>
          </Alert>
        )}
        {error && (
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {(error as any)?.message}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button key="cancel" variant="secondary" onClick={closeModal}>
          {t('Cancel')}
        </Button>
        {!loading ? (
          <Button key="delete" variant="danger" onClick={submit}>
            {t('Delete')}
          </Button>
        ) : (
          <LoadingInline />
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
