import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { EncryptionType } from '../encryption/EncryptionType';

export type EncryptionDialogVariant = 'encrypt' | 'decrypt';

interface KeyDialogProps {
  show: boolean;
  onClose: () => void;
  onGenerate: (type: EncryptionType, name: string) => void;
}

export default function KeyDialog(props: KeyDialogProps): JSX.Element {
  const [encryptionType, setEncryptionType] = useState<EncryptionType>(EncryptionType.Symmetric);
  const [keyName, setKeyName] = useState<string>('');

  const selectedAlgorithmChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setEncryptionType(event.target.value as EncryptionType);
    }
  };

  const keyNameChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      setKeyName(event.target.value);
    }
  };

  const generateButtonPressed = (): void => {
    props.onGenerate(encryptionType, keyName);
    props.onClose();
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Generate Key</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label htmlFor="encryptionTypeSelect">Key Type</Form.Label>
        <Form.Select id="encryptionTypeSelect" onChange={selectedAlgorithmChanged} value={encryptionType}>
          <option value={EncryptionType.Symmetric}>Symmetric encryption (AES)</option>
          <option value={EncryptionType.Asymmetric}>Asymmetric encryption (RSA)</option>
        </Form.Select>

        <Form.Label htmlFor="keyNameText">Key Name</Form.Label>
        <Form.Control type="text" id="keyNameText" value={keyName} onChange={keyNameChanged} />

        <button className="btn btn-primary mt-3" onClick={generateButtonPressed}>
          Generate and save
        </button>
      </Modal.Body>
    </Modal>
  );
}
