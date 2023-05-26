// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonSubmitInvert } from '@polkadotcloud/core-ui';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useActivePools } from 'contexts/Pools/ActivePools';
import type { ClaimPermission } from 'contexts/Pools/types';
import { Warning } from 'library/Form/Warning';
import { useSignerWarnings } from 'library/Hooks/useSignerWarnings';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { SubmitTx } from 'library/SubmitTx';
import { WarningsWrapper } from 'modals/Wrappers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const SetClaimPermission = ({ setSection, section }: any) => {
  const { t } = useTranslation('modals');
  const { api } = useApi();
  const { setStatus: setModalStatus } = useModal();
  const { activeAccount } = useConnect();
  const { isOwner, isMember } = useActivePools();
  const { getSignerWarnings } = useSignerWarnings();

  // Valid to submit transaction
  const [valid, setValid] = useState<boolean>(false);

  // Updated claim permission value
  const [claimPermission, setClaimPermission] = useState<ClaimPermission>();

  // Determine current pool metadata and set in state.
  useEffect(() => {
    // TODO: set real claim permission.
    const currentClaimPermission = null;
    if (currentClaimPermission) {
      setClaimPermission(currentClaimPermission);
    }
  }, [section]);

  useEffect(() => {
    setValid(isOwner() || isMember());
  }, [isOwner(), isMember()]);

  // tx to submit
  const getTx = () => {
    if (!valid || !api) {
      return null;
    }

    // TODO: dynamically insert claim permission:
    // Permissioned, PermissionlessCompound, PermissionlessWithdraw, PermissionlessAll
    return api.tx.nominationPools.setClaimPermission('PermissionlessAll');
  };

  const submitExtrinsic = useSubmitExtrinsic({
    tx: getTx(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  // TODO: handle claim permission change.
  // const handleClaimPermissionChange = (
  //   e: React.FormEvent<HTMLInputElement>
  // ) => {
  //   setValid(true);
  // };

  const warnings = getSignerWarnings(
    activeAccount,
    false,
    submitExtrinsic.proxySupported
  );

  return (
    <>
      <div className="padding">
        {warnings.length > 0 ? (
          <WarningsWrapper>
            {warnings.map((text, i) => (
              <Warning key={`warning${i}`} text={text} />
            ))}
          </WarningsWrapper>
        ) : null}
        {/* <input
          className="textbox"
          style={{ width: '100%' }}
          placeholder={`${t('poolName')}`}
          type="text"
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            handleMetadataChange(e)
          }
          value={metadata ?? ''}
        /> */}
        <p>
          Updating your claim permissions will take effect immediately on chain.
        </p>
      </div>
      <SubmitTx
        valid={valid}
        buttons={[
          <ButtonSubmitInvert
            key="button_back"
            text={t('back')}
            iconLeft={faChevronLeft}
            iconTransform="shrink-1"
            onClick={() => setSection(0)}
          />,
        ]}
        {...submitExtrinsic}
      />
    </>
  );
};
