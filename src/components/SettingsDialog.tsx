import React, { useContext } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { EncryptionEngine } from '../persistence/settings';
import { settingsContext } from '../context/settingsContext';
import { useLiveQuery } from 'dexie-react-hooks';

interface SettingsDialogProps {
  show: boolean;
  onClose: () => void;
}

export default function SettingsDialog(props: SettingsDialogProps): JSX.Element {
  const settings = useContext(settingsContext);

  const encryptionEngine = useLiveQuery<EncryptionEngine>(async () => await settings.getEncryptionEngine());
  const onEncryptionEngineChanged = (event: React.SyntheticEvent): void => {
    if ('value' in event.target && typeof event.target.value === 'string') {
      settings.setEncryptionEngine(event.target.value as EncryptionEngine).catch(() => {
        alert('Failed to set the encryption engine');
      });
    }
  };

  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label htmlFor="encryptionEngineSelect">Encryption Engine</Form.Label>
        <Form.Select id="encryptionEngineSelect" value={encryptionEngine} onChange={onEncryptionEngineChanged}>
          <option value={EncryptionEngine.wasm}>WebAssembly</option>
          <option value={EncryptionEngine.js}>JavaScript</option>
        </Form.Select>
      </Modal.Body>
    </Modal>
  );
}
