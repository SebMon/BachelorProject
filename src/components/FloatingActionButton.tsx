import React, { forwardRef } from 'react';
import type { LegacyRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import type { Process } from '../types/Encryption';

interface CustomToggleProps {
  onClick: () => void;
}
// eslint-disable-next-line react/display-name
const CustomToggle = forwardRef(
  ({ onClick }: CustomToggleProps, ref): JSX.Element => (
    <button ref={ref as LegacyRef<HTMLButtonElement>} className="btn btn-lg rounded-circle" onClick={onClick}>
      <div className="spinner-border text-light" role="status"></div>
    </button>
  )
);

interface FloatingActionButtonProps {
  items: Process[];
}

export default function FloatingActionButton(props: FloatingActionButtonProps): JSX.Element {
  return (
    <Dropdown drop="up" className="position-absolute bottom-0 end-0 m-4 rounded-circle">
      <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
      <Dropdown.Menu>
        <ul className="list-group">
          {props.items.map((item) => {
            return (
              <li key={item.UUID} className="list-group-item">
                {item.name}
              </li>
            );
          })}
        </ul>
      </Dropdown.Menu>
    </Dropdown>
  );
}
