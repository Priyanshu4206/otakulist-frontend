import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-4px) scale(1.04);
  }
`;

const CircleCover = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.7rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
`;

const CoverImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaylistName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const OwnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.1rem;
  justify-content: center;
`;

const Avatar = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
`;

const Username = styled.span`
  font-size: 0.85rem;
  color: var(--textSecondary, #aaa);
  font-weight: 500;
`;

const TrendingPlaylistCard = ({ playlist }) => {
  const { _id, name, owner, coverImages } = playlist;
  const cover = coverImages && coverImages.length > 0 ? coverImages[0] : '/images/playlist-fallback.png';
  return (
    <Card to={`/playlist/${_id}`} title={name}>
      <CircleCover>
        <CoverImg src={cover} alt={name} />
      </CircleCover>
      <PlaylistName>{name}</PlaylistName>
      <OwnerRow>
        <Username>{owner?.username}</Username>
      </OwnerRow>
    </Card>
  );
};

export default TrendingPlaylistCard;