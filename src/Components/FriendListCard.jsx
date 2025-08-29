import React from 'react';
import FriendsList from './FriendsList.jsx'; // Adjust path as necessary

const FriendListCard = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-lg border border-gray-700/50 animation-initial animate-fade-in animation-delay-100 mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600">Lista de Amigos</h2>
      <FriendsList simplified={true} />
    </div>
  );
};

export default FriendListCard;
