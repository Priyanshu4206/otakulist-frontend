import React from 'react';
import PropTypes from 'prop-types';
import { ToggleContainer, ToggleLabel, ToggleDescription, ToggleSwitch, Slider, ToggleLoading } from './SettingsToggle.styles';

/**
 * SettingsToggle - A toggle switch for boolean settings.
 * @param {object} props
 * @param {string} props.label - The toggle label
 * @param {string} [props.description] - Optional description
 * @param {boolean} props.checked - Current checked
 * @param {function} props.onChange - Change handler
 * @param {boolean} [props.disabled] - Show disabled indicator
 */
const SettingsToggle = ({ label, description, checked, onChange, disabled }) => (
  <ToggleContainer>
    <div>
      <ToggleLabel>{label}</ToggleLabel>
      {description && <ToggleDescription>{description}</ToggleDescription>}
    </div>
    <ToggleSwitch>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <Slider />
      {disabled && <ToggleLoading />}
    </ToggleSwitch>
  </ToggleContainer>
);

SettingsToggle.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default SettingsToggle; 