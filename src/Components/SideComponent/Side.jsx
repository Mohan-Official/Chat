import React from 'react';

export default function Side(props) {
  return (
    <div>
      <h2>Connected Users:</h2>
      <ul>
        {props.connectedUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
