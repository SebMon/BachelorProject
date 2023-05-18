import React, { useContext, useEffect, useRef, useState } from 'react';
import type { StoredKey } from '../../persistence/StoredKeys/types';
import { StoredKeysContext } from '../../context/StoredKeysContext';
import { isStoredAESKey, isStoredRSAPublicKey, isStoredRSAPrivateKey } from '../../persistence/StoredKeys/types';
import { bytesToHex, bytesToText } from '../../encryption/encodeDecode';
import { KeyType } from '../../encryption/Types';

interface KeyMenuItemProps {
  keyObject: StoredKey;
}

export default function KeyMenuItem(props: KeyMenuItemProps): JSX.Element {
  const storedKeys = useContext(StoredKeysContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const key = props.keyObject;

  const [editing, setEditing] = useState(false);
  const [editableKeyName, setEditableKeyName] = useState(key.name);

  const onDeletePressed = (): void => {
    if (confirm(`Are you sure your want to delete "${key.name}"`)) {
      storedKeys.remove(key).catch((e) => {
        console.error('failed to remove the key');
        console.error(e);
      });
    }
  };

  useEffect(() => {
    if (editing && inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [editing]);

  const startEditing = (): void => {
    setEditing(true);
  };

  const stopEditing = (): void => {
    storedKeys.store({ ...key, name: editableKeyName }).catch((e) => {
      console.error('could store the key with the new name');
      console.error(e);
    });
    setEditing(false);
  };

  const editMade = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setEditableKeyName(event.target.value);
    }
  };

  const keyPressed = (event: React.SyntheticEvent): void => {
    if ('key' in event && event.key === 'Enter') {
      stopEditing();
    }
  };

  return (
    <div className="row d-flex flex-row">
      <div
        data-testid="delete-button"
        className="col-auto btn d-flex pt-2"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => {
          onDeletePressed();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#000000" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
        </svg>
      </div>
      <div
        data-testid="delete-button"
        className="col-auto btn d-flex pt-2"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          if (isStoredAESKey(key)) {
            await navigator.clipboard.writeText(bytesToText(key.aesKey));
            return;
          }
          if (isStoredRSAPublicKey(key)) {
            const convertedKey = await window.crypto.subtle
              .importKey(
                'jwk',
                {
                  kty: 'RSA',
                  e: bytesToHex(key.e),
                  n: bytesToHex(key.n),
                  alg: 'RSA-OAEP-256',
                  ext: true
                },
                {
                  name: 'RSA-OAEP',
                  hash: { name: 'SHA-256' }
                },
                true,
                ['encrypt']
              )
              .catch((e) => {
                console.log(e);
              });
            const keySpki = await window.crypto.subtle.exportKey('spki', convertedKey);
            await navigator.clipboard.writeText(spkiToPEM(keySpki, KeyType.AsymmetricPublic));
            return;
          }
          if (isStoredRSAPrivateKey(key)) {
            const convertedKey = await window.crypto.subtle
              .importKey(
                'jwk',
                {
                  kty: 'RSA',
                  e: bytesToHex(key.e),
                  n:
                    bytesToHex(key.n) +
                    bytesToHex(key.d) +
                    bytesToHex(key.p) +
                    bytesToHex(key.q) +
                    bytesToHex(key.dp) +
                    bytesToHex(key.dq) +
                    bytesToHex(key.qi),
                  alg: 'RSA-OAEP-256',
                  ext: true
                },
                {
                  name: 'RSA-OAEP',
                  hash: { name: 'SHA-256' }
                },
                true,
                ['decrypt']
              )
              .catch((e) => {
                console.log(e);
              });
            const keyTest = await window.crypto.subtle.exportKey('spki', convertedKey);
            console.log(spkiToPEM(keyTest, KeyType.AsymmetricPrivate));
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#000000" viewBox="0 0 512 512">
          <path d="M448 384H256c-35.3 0-64-28.7-64-64V64c0-35.3 28.7-64 64-64H396.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V320c0 35.3-28.7 64-64 64zM64 128h96v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H256c8.8 0 16-7.2 16-16V416h48v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192c0-35.3 28.7-64 64-64z" />
        </svg>
      </div>

      <div onClick={startEditing} className="col">
        {
          // eslint-disable-next-line multiline-ternary

          <input
            className="form-control mb-2"
            ref={inputRef}
            type="text"
            value={editableKeyName}
            onChange={editMade}
            onBlur={stopEditing}
            disabled={!editing}
            onKeyDown={keyPressed}
          />
        }
      </div>
    </div>
  );
}

function spkiToPEM(keydata: ArrayBuffer, keyType: KeyType): string {
  const keydataS = arrayBufferToString(keydata);
  const keydataB64 = window.btoa(keydataS);
  const keydataB64Pem = formatAsPem(keydataB64, keyType);
  return keydataB64Pem;
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

function formatAsPem(str: string, keyType: KeyType): string {
  let finalString = `-----BEGIN ${keyType === KeyType.AsymmetricPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----\n`;

  while (str.length > 0) {
    finalString += str.substring(0, 64) + '\n';
    str = str.substring(64);
  }

  finalString = finalString + `-----END ${keyType === KeyType.AsymmetricPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----`;

  return finalString;
}
