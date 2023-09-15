import { client } from '@/client';
import { getOffchainAuthKeys } from '@/utils/offchainAuth';
import { ChangeEvent, useState } from 'react';
import { useAccount } from 'wagmi';

export const Demo = () => {
  const { address, connector } = useAccount();
  const [file, setFile] = useState<File>();
  const [txHash, setTxHash] = useState<string>();
  const [createObjectInfo, setCreateObjectInfo] = useState({
    bucketName: '',
    objectName: '',
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
                placeholder="bucket name"
                value={createObjectInfo.bucketName}
                onChange={(e) => {
                  setCreateObjectInfo({ ...createObjectInfo, bucketName: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="field is-horizontal">
        <div className="field-label is-normal">
          <label className="label">Object</label>
        </div>
        <div className="field-body">
          <div className="field">
            <div className="control">
              <input
                className="input"
                type="text"
                value={createObjectInfo.objectName}
                placeholder="object name"
                onChange={(e) => {
                  setCreateObjectInfo({ ...createObjectInfo, objectName: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="field">
        <div className="file">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              placeholder="select a file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload"></i>
              </span>
              <span className="file-label">
                Choose a file…
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="field">
        <button
          className="button"
          onClick={async () => {
            if (!address || !file) {
              alert('Please select a file or address');
              return;
            }

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            const fileBytes = await file.arrayBuffer();
            const hashResult = await (window as any).FileHandle.getCheckSums(
              new Uint8Array(fileBytes),
            );
            const { contentLength, expectCheckSums } = hashResult;

            console.log('offChainData', offChainData);
            console.log('hashResult', hashResult);

            const createObjectTx = await client.object.createObject(
              {
                bucketName: createObjectInfo.bucketName,
                objectName: createObjectInfo.objectName,
                creator: address,
                visibility: 'VISIBILITY_TYPE_PRIVATE',
                fileType: file.type,
                redundancyType: 'REDUNDANCY_EC_TYPE',
                contentLength,
                expectCheckSums: JSON.parse(expectCheckSums),
              },
              {
                type: 'EDDSA',
                domain: window.location.origin,
                seed: offChainData.seedString,
                address,
                // type: 'ECDSA',
                // privateKey: ACCOUNT_PRIVATEKEY,
              },
            );

            const simulateInfo = await createObjectTx.simulate({
              denom: 'BNB',
            });

            console.log('simulateInfo', simulateInfo);

            const res = await createObjectTx.broadcast({
              denom: 'BNB',
              gasLimit: Number(simulateInfo?.gasLimit),
              gasPrice: simulateInfo?.gasPrice || '5000000000',
              payer: address,
              granter: '',
            });

            console.log('res', res);

            if (res.code === 0) {
              alert('create object tx success');

              setTxHash(res.transactionHash);
            }
          }}
        >
          1. create object tx
        </button>
      </div>

      <div className="field">
        <button
          className="button"
          onClick={async () => {
            if (!txHash) {
              alert('please create tx first')
              return;
            };
            if (!address || !file) {
              alert('please upload file')
              return;
            }

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            const uploadRes = await client.object.uploadObject(
              {
                bucketName: createObjectInfo.bucketName,
                objectName: createObjectInfo.objectName,
                body: file,
                txnHash: txHash,
              },
              {
                type: 'EDDSA',
                domain: window.location.origin,
                seed: offChainData.seedString,
                address,
              },
            );
            console.log('uploadRes', uploadRes);

            if (uploadRes.code === 0) {
              alert('success');
            }
          }}
        >
          2. upload
        </button>
      </div>
    </>
  );
};
