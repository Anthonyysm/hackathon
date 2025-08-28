import React from 'react';
import WelcomeScreen from '../Components/WelcomeScreen';
import PostCreationWithSync from '../Components/PostCreationWithSync';
import SocialFeed from '../Components/SocialFeed';

function HomePage() {
  return (
    <>
      <WelcomeScreen />
      <PostCreationWithSync />
      <SocialFeed />
    </>
  );
}

export default HomePage;
