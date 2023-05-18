import React, { useContext, useEffect, useRef, useState } from 'react';
import type { StoredKey } from '../../persistence/StoredKeys/types';
import { StoredKeysContext } from '../../context/StoredKeysContext';

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
        className="col-2 btn d-flex pt-2"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => {
          onDeletePressed();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
        </svg>
      </div>

      <div onClick={startEditing} className="col-10">
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
