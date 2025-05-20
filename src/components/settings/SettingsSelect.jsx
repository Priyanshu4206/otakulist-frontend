import React from 'react';
import PropTypes from 'prop-types';
import CustomSelect from '../common/CustomSelect';
import { SelectContainer, SelectLabel, SelectDescription, SelectLoading } from './SettingsSelectStyles';

/**
 * SettingsSelect - A select/dropdown for enum or string settings.
 * @param {object} props
 * @param {string} props.label - The select label
 * @param {string} [props.description] - Optional description
 * @param {string|number} props.value - Current value
 * @param {Array<{label: string, value: string|number}>} props.options - Select options
 * @param {function} props.onChange - Change handler
 * @param {boolean} [props.loading] - Show loading indicator
 */
const SettingsSelect = ({ label, description, value, options, onChange, loading }) => (
  <SelectContainer>
    <div>
      <SelectLabel>{label}</SelectLabel>
      {description && <SelectDescription>{description}</SelectDescription>}
    </div>
    <div style={{ minWidth: 180, position: 'relative' }}>
      <CustomSelect
        options={options}
        value={value}
        onChange={onChange}
        disabled={loading}
      />
      {loading && <SelectLoading />}
    </div>
  </SelectContainer>
);

SettingsSelect.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default SettingsSelect; 