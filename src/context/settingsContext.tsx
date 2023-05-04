import React from 'react';
import { Settings } from '../persistence/settings';

export const settingsContext = React.createContext<Settings>(new Settings());
