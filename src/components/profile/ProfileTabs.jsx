import React from 'react';
import { Trophy, ListFilter, Sliders } from 'lucide-react';
import { TabsContainer, Tab } from './ProfileStyles';

export const TABS = {
  ACHIEVEMENTS: 'achievements',
  PLAYLISTS: 'playlists',
};

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <TabsContainer>
      <Tab 
        active={activeTab === TABS.ACHIEVEMENTS}
        onClick={() => setActiveTab(TABS.ACHIEVEMENTS)}
      >
        <Trophy size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Achievements
      </Tab>
      <Tab 
        active={activeTab === TABS.PLAYLISTS}
        onClick={() => setActiveTab(TABS.PLAYLISTS)}
      >
        <ListFilter size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Playlists
      </Tab>
    </TabsContainer>
  );
};

export default ProfileTabs; 