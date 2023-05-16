import React, { useState } from 'react';
import { Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EncryptionType } from '../encryption/Types';

export type EncryptionDialogVariant = 'encrypt' | 'decrypt';

interface EncryptDialogProps {
  show: boolean;
  variant: EncryptionDialogVariant;
  onClose: () => void;
  onEncrypt: (type: EncryptionType, key: string) => void;
}

export default function EncryptDialog(props: EncryptDialogProps): JSX.Element {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>(EncryptionType.Symmetric);
  const [encryptionKey, setEncryptionKey] = useState<string>('');

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
    }
  };

  const keyChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setEncryptionKey(event.target.value);
    }
  };

  const encryptButtonPressed = (event: React.SyntheticEvent): void => {
    props.onEncrypt(encryptionType, encryptionKey);
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

        <Form.Label htmlFor="encryptionKeyTextarea">
          Key{' '}
          <OverlayTrigger placement="bottom" overlay={getToolTip}>
            <i data-testid="key-info-icon" className="bi bi-info-circle" />
          </OverlayTrigger>
        </Form.Label>

        <InputGroup>
          <Form.Control as="textarea" id="encryptionKeyTextarea" value={encryptionKey} onChange={keyChanged} />
        </InputGroup>

        <button className="btn btn-primary mt-3" onClick={encryptButtonPressed}>
          {props.variant === 'encrypt' ? 'Encrypt!' : 'Decrypt!'}
        </button>
      </Modal.Body>
    </Modal>
  );
}
