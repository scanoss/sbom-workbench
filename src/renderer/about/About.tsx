import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [user, setUser] = useState({ name: 'Test', lastName: 'Test 2' });

  return (
    <div>
      <h1>{user.name}</h1>
      <button
        type="button"
        onClick={() => setUser({ ...user, lastName: 'Test 3' })}
      >
        Change!
      </button>
      <Link to="/">Back</Link>
    </div>
  );
};

export default About;
