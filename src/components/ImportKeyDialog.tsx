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

  const generateButtonPressed = (): void => {
    setKeyName('');
    setKeyText('');
    props.onImport(keyType, keyName, keyText);
    props.onClose();
  };

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
        <Modal.Title>Generate Key</Modal.Title>
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
            <i data-testid="key-info-icon" className="bi bi-info-circle" />
          </OverlayTrigger>
        </Form.Label>

        <InputGroup>
          <Form.Control as="textarea" id="encryptionKeyTextarea" value={keyText} onChange={keyTextChanged} />
        </InputGroup>

        <button className="btn btn-primary mt-3" onClick={generateButtonPressed}>
          Import and save
        </button>
      </Modal.Body>
    </Modal>
  );
}
