import React, { createContext, useState, useContext } from 'react';

const FriendshipContext = createContext(undefined);

export const FriendshipProvider = ({ children }) => {
  const [friendshipStatusChanged, setFriendshipStatusChanged] = useState(false);

  return (
    <FriendshipContext.Provider value={{ friendshipStatusChanged, setFriendshipStatusChanged }}>
      {children}
    </FriendshipContext.Provider>
  );
};

export const useFriendship = () => {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error('useFriendship must be used within a FriendshipProvider');
  }
  return context;
};
