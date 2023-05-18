import React from 'react';
import { StoredKeys } from '../persistence/StoredKeys/StoredKeys';

export const StoredKeysContext = React.createContext<StoredKeys>(new StoredKeys());
