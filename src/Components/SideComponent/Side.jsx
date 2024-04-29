import React from 'react';
import './Side.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as CircleSolid} from '@fortawesome/free-solid-svg-icons'


const OtherUserComponent = (props) => {
  return (
      <section id='otherUsers'>
        <div id='otherUserImgSec'>
          <div>
            <img src="https://wallpapercave.com/wp/wp13653972.jpg" alt="" />
          </div>
        </div>
        <div id='otherUserNameSec'>
          <h1>
            {props.userName}
          </h1>
        </div>
        <div id='otherUserActiveSec'>
          <span>
            Active
            <FontAwesomeIcon icon={CircleSolid} className='activeCircle' />
          </span>
        </div>
      </section>
  );
}

export default function Side(props) {
  const myName = localStorage.getItem("username");
  console.log("My name "+myName);
  return (
    <div id='container'>
      <div id='mySection'>
        <h1>{myName}</h1>
      </div>
      <div id='otherSection'>
        <h2>Connected Users:</h2>
          {props.connectedUsers.map((user, index) => (
            <OtherUserComponent key={index} userName = {user} />
          ))}        
      </div>

      
    </div>
  );
}
