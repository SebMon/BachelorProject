import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EncryptionType } from '../encryption/Types';
import type { EncryptionKey } from '../encryption/Types';
import type { StoredKey } from '../persistence/StoredKeys/types';
import { isStoredAESKey, isStoredRSAPrivateKey, isStoredRSAPublicKey } from '../persistence/StoredKeys/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { StoredKeysContext } from '../context/StoredKeysContext';
import { textToBytes } from '../encryption/encodeDecode';
import { PrivateKeyFromPem, PublicKeyFromPem } from '../encryption/RSA/keys';
import type { AESKey } from '../encryption/AES';
import { getAESKeyFromPassword } from '../encryption/KeyGenerator';

enum KeyInputMethod {
  Stored = 'stored',
  Write = 'write',
  Password = 'password'
}

interface KeyListElement extends StoredKey {
  index: number;
}

export type EncryptionDialogVariant = 'encrypt' | 'decrypt';

interface EncryptDialogProps {
  show: boolean;
  variant: EncryptionDialogVariant;
  onClose: () => void;
  onEncrypt: (type: EncryptionType, key: EncryptionKey) => void;
}

export default function EncryptDialog(props: EncryptDialogProps): JSX.Element {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>(EncryptionType.Symmetric);
  const [keyInputMethod, setKeyInputMethod] = useState<KeyInputMethod>(KeyInputMethod.Stored);
  const [writtenKey, setWrittenKey] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);

  const storedKeys = useContext(StoredKeysContext);
  const keys = useLiveQuery(async () => await storedKeys.getAll());
  const SymmetricKeys = keys?.filter(isStoredAESKey);
  const AsymmetricKeys = keys?.filter((key) => isStoredRSAPublicKey(key) || isStoredRSAPrivateKey(key));
  const selectableKeys = useMemo<KeyListElement[] | undefined>((): KeyListElement[] | undefined => {
    if (encryptionType === EncryptionType.Symmetric) {
      if (SymmetricKeys === undefined) {
        return undefined;
      }
      return SymmetricKeys.map((key, index) => {
        return { ...key, index };
      });
    } else {
      if (AsymmetricKeys === undefined) {
        return undefined;
      }
      return AsymmetricKeys?.map((key, index) => {
        return { ...key, index };
      });
    }
  }, [encryptionType, keys]);

  useEffect(() => {
    if (selectableKeys === undefined || selectableKeys.length === 0) {
      setSelectedKeyIndex(-1);
    } else {
      setSelectedKeyIndex(0);
    }
  }, [selectableKeys]);

  useEffect(() => {
    setPassword('');
  }, [props.show, keyInputMethod]);

  const getToolTip = (props: any): JSX.Element => {
    let tooltipText = '';

    if (encryptionType === EncryptionType.Symmetric) {
      tooltipText = 'The key should be a valid hex encoded AES-256 key';
    } else if (encryptionType === EncryptionType.Asymmetric) {
      tooltipText = 'The key should be a valid pem encoded pkcs8 public or private key';
    }

    return <Tooltip {...props}>{tooltipText}</Tooltip>;
  };

  const selectedAlgorithmChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setEncryptionType(event.target.value as EncryptionType);
      if (keyInputMethod === KeyInputMethod.Password) {
        setKeyInputMethod(KeyInputMethod.Stored);
      }
    }
  };

  const keyInputMethodChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setKeyInputMethod(event.target.value as KeyInputMethod);
    }
  };

  const selectedKeyIndexChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setSelectedKeyIndex(parseInt(event.target.value));
    }
  };

  const writtenKeyChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setWrittenKey(event.target.value);
    }
  };

  const passwordChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setPassword(event.target.value);
    }
  };

  async function parseRSAKey(key: string): Promise<EncryptionKey> {
    if (key.includes('-----BEGIN PUBLIC KEY-----')) {
      return await PublicKeyFromPem(key);
    } else if (key.includes('-----BEGIN PRIVATE KEY-----')) {
      return await PrivateKeyFromPem(key);
    }

    throw Error("RSA key didn't incude include '-----BEGIN PUBLIC KEY-----' or '-----BEGIN PRIVATE KEY-----'");
  }

  const getKeyFromTextField = async (): Promise<EncryptionKey> => {
    if (encryptionType === EncryptionType.Symmetric) {
      return { aesKey: textToBytes(writtenKey) };
    } else {
      return await parseRSAKey(writtenKey);
    }
  };

  const getSelectedKey = (): EncryptionKey => {
    if (selectableKeys === undefined) {
      throw Error();
    }
    if (encryptionType === EncryptionType.Symmetric) {
      const key = selectableKeys[selectedKeyIndex];
      if (!isStoredAESKey(key)) {
        throw Error();
      }
      return key;
    } else {
      const key = selectableKeys[selectedKeyIndex];
      if (!(isStoredRSAPublicKey(key) || isStoredRSAPrivateKey(key))) {
        throw Error();
      }
      return key;
    }
  };

  const getKey = async (): Promise<EncryptionKey> => {
    if (keyInputMethod === KeyInputMethod.Write) {
      return await getKeyFromTextField();
    } else if (keyInputMethod === KeyInputMethod.Stored) {
      return getSelectedKey();
    } else {
      return await getAESKeyFromPassword(password);
    }
  };

  const encryptButtonPressed = async (event: React.SyntheticEvent): Promise<void> => {
    props.onEncrypt(encryptionType, await getKey());
    props.onClose();
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{props.variant === 'encrypt' ? 'Encrypt' : 'Decrypt'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label htmlFor="encryptionTypeSelect">Algorithm</Form.Label>
        <Form.Select id="encryptionTypeSelect" onChange={selectedAlgorithmChanged} value={encryptionType}>
          <option value={EncryptionType.Symmetric}>Symmetric encryption (AES)</option>
          <option value={EncryptionType.Asymmetric}>Asymmetric encryption (RSA)</option>
        </Form.Select>

        <Form.Label htmlFor="keyInputMethodSelect">How will you input your key?</Form.Label>
        <Form.Select id="keyInputMethodSelect" onChange={keyInputMethodChanged} value={keyInputMethod}>
          <option value={KeyInputMethod.Stored}>Select a stored key</option>
          <option value={KeyInputMethod.Write}>Input into a text field</option>

          {
            // eslint-disable-next-line multiline-ternary
            encryptionType === EncryptionType.Symmetric ? (
              <option value={KeyInputMethod.Password}>Type a password</option>
            ) : null
          }
        </Form.Select>

        {
          // eslint-disable-next-line multiline-ternary
          keyInputMethod === KeyInputMethod.Stored ? (
            <div>
              <Form.Label htmlFor="encryptionTypeSelect">Select key</Form.Label>
              <Form.Select id="encryptionTypeSelect" onChange={selectedKeyIndexChanged} value={selectedKeyIndex}>
                {selectableKeys?.map((key) => {
                  return (
                    <option key={key.index} value={key.index}>
                      {key.name}
                    </option>
                  );
                })}
              </Form.Select>
            </div>
          ) : undefined
        }

        {
          // eslint-disable-next-line multiline-ternary
          keyInputMethod === KeyInputMethod.Write ? (
            <div>
              <Form.Label htmlFor="encryptionKeyTextarea">
                Key{' '}
                <OverlayTrigger placement="bottom" overlay={getToolTip}>
                  <i data-testid="key-info-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </i>
                </OverlayTrigger>
              </Form.Label>

              <InputGroup>
                <Form.Control
                  as="textarea"
                  id="encryptionKeyTextarea"
                  value={writtenKey}
                  onChange={writtenKeyChanged}
                />
              </InputGroup>
            </div>
          ) : undefined
        }

        {
          // eslint-disable-next-line multiline-ternary
          keyInputMethod === KeyInputMethod.Password ? (
            <div>
              <Form.Label htmlFor="passwordTextInput">Password</Form.Label>

              <InputGroup>
                <Form.Control type="password" id="passwordTextInput" value={password} onChange={passwordChanged} />
              </InputGroup>
            </div>
          ) : undefined
        }

        <button
          className="btn btn-primary mt-3"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={encryptButtonPressed}
          disabled={
            (keyInputMethod === KeyInputMethod.Stored && selectableKeys?.length === 0) ||
            (keyInputMethod === KeyInputMethod.Write && writtenKey === '')
          }
        >
          {props.variant === 'encrypt' ? 'Encrypt!' : 'Decrypt!'}
        </button>
      </Modal.Body>
    </Modal>
  );
}
