import React, { useState } from 'react';
import { Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { KeyType } from '../encryption/Types';

interface ImportKeyDialogProps {
  show: boolean;
  onClose: () => void;
  onImport: (type: KeyType, name: string, keyText: string) => void;
}

export default function ImportKeyDialog(props: ImportKeyDialogProps): JSX.Element {
  const [keyType, setKeyType] = useState<KeyType>(KeyType.Symmetric);
  const [keyName, setKeyName] = useState<string>('');
  const [keyText, setKeyText] = useState<string>('');

  const selectedAlgorithmChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setKeyType(event.target.value as KeyType);
    }
  };

  const keyNameChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setKeyName(event.target.value);
    }
  };

  const keyTextChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setKeyText(event.target.value);
    }
  };

  const importButtonPressed = (): void => {
    setKeyName('');
    setKeyText('');
    props.onImport(keyType, keyName, keyText);
    props.onClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getToolTip = (props: any): JSX.Element => {
    let tooltipText = '';

    if (keyType === KeyType.Symmetric) {
      tooltipText = 'The key should be a valid hex encoded AES-256 key';
    } else if (keyType === KeyType.AsymmetricPublic) {
      tooltipText = 'The key should be a valid pem encoded pkcs8 public key';
    } else if (keyType === KeyType.AsymmetricPrivate) {
      tooltipText = 'The key should be a valid pem encoded pkcs8 private key';
    }

    return <Tooltip {...props}>{tooltipText}</Tooltip>;
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Key</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label htmlFor="encryptionTypeSelect">Key Type</Form.Label>
        <Form.Select id="encryptionTypeSelect" onChange={selectedAlgorithmChanged} value={keyType}>
          <option value={KeyType.Symmetric}>Symmetric encryption (AES) key</option>
          <option value={KeyType.AsymmetricPublic}>Asymmetric encryption (RSA) public key</option>
          <option value={KeyType.AsymmetricPrivate}>Asymmetric encryption (RSA) private key</option>
        </Form.Select>

        <Form.Label htmlFor="keyNameText">Key Name</Form.Label>
        <Form.Control type="text" id="keyNameText" value={keyName} onChange={keyNameChanged} />

        <Form.Label htmlFor="encryptionKeyTextarea">
          Key{' '}
          <OverlayTrigger placement="bottom" overlay={getToolTip}>
            <i data-testid="key-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
            </i>
          </OverlayTrigger>
        </Form.Label>

        <InputGroup>
          <Form.Control as="textarea" id="encryptionKeyTextarea" value={keyText} onChange={keyTextChanged} />
        </InputGroup>

        <button className="btn btn-primary mt-3" onClick={importButtonPressed}>
          Import and save
        </button>
      </Modal.Body>
    </Modal>
  );
}
