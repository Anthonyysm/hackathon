import React from 'react';
import PostCreationWithSync from '../Components/PostCreationWithSync';
import SocialFeed from '../Components/SocialFeed';
import WelcomeScreen from '../Components/WelcomeScreen';

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