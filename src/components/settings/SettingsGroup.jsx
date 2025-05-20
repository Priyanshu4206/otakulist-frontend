import React from 'react';
import PropTypes from 'prop-types';
import { GroupContainer, GroupTitle, GroupDescription } from './SettingsGroupStyles';

/**
 * SettingsGroup - A container for grouping related settings.
 * @param {object} props
 * @param {string} props.title - The group title
 * @param {string} [props.description] - Optional group description
 * @param {React.ReactNode} props.children - The settings content
 */
const SettingsGroup = ({ title, description, children }) => (
  <GroupContainer>
    <GroupTitle>{title}</GroupTitle>
    {description && <GroupDescription>{description}</GroupDescription>}
    {children}
  </GroupContainer>
);

SettingsGroup.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default SettingsGroup; 