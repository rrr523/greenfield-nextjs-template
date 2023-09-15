import { client, selectSp } from '@/client';
import { getOffchainAuthKeys } from '@/utils/offchainAuth';
import { ChangeEvent, useState } from 'react';
import { useAccount } from 'wagmi';

export const Demo = () => {
  const { address, connector } = useAccount();
  const [createBucketInfo, setCreateBucketInfo] = useState<{
    bucketName: string;
  }>({
    bucketName: '',
  });

  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Create Bucket Demo
          </h1>
          <p className="subtitle">
            Create Bucket Tx
          </p>
        </div>
      </section>

      <div className='box'>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Bucket</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={createBucketInfo.bucketName}
                  placeholder="bucket name"
                  onChange={(e) => {
                    setCreateBucketInfo({ ...createBucketInfo, bucketName: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="field">
          <button
            className="button is-primary"
            onClick={async () => {
            if (!address) return;

            const spInfo = await selectSp();
            console.log('spInfo', spInfo);

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            try {
              const createBucketTx = await client.bucket.createBucket(
                {
                  bucketName: createBucketInfo.bucketName,
                  creator: address,
                  visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
                  chargedReadQuota: '0',
                  spInfo: {
                    primarySpAddress: spInfo.primarySpAddress,
                  },
                  paymentAddress: address,
                },
                {
                  type: 'EDDSA',
                  domain: window.location.origin,
                  seed: offChainData.seedString,
                  address,
                },
              );

              const simulateInfo = await createBucketTx.simulate({
                denom: 'BNB',
              });

              console.log('simulateInfo', simulateInfo);

              const res = await createBucketTx.broadcast({
                denom: 'BNB',
                gasLimit: Number(simulateInfo?.gasLimit),
                gasPrice: simulateInfo?.gasPrice || '5000000000',
                payer: address,
                granter: '',
              });

              if (res.code === 0) {
                alert('success');
              }
            } catch (err) {
              console.log(typeof err)
              if (err instanceof Error) {
                alert(err.message);
              }
              if (err && typeof err ==='object') {
                alert(JSON.stringify(err))
              }
            }
            
          }}
          >
            broadcast with simulate
          </button>
        </div>
      </div>
    </>
  );
};
