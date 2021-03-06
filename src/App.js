import 'bulma/css/bulma.css';

import firebase from 'firebase';
import React, { useContext } from 'react';
//import { createRoot } from 'react-dom';
import {
  AuthCheck,
  FirebaseAppProvider,
  SuspenseWithPerf,
  useAuth,
  useFirestore,
  useFirestoreCollectionData,
  useUser
} from 'reactfire';

const firebaseConfig = {
  apiKey: "AIzaSyBmNsJB_SBV4r_YKPndvkFaBpX0smIlt1g",
  authDomain: "testp1-50b80.firebaseapp.com",
  databaseURL: "https://testp1-50b80.firebaseio.com",
  projectId: "testp1-50b80",
  storageBucket: "testp1-50b80.appspot.com",
  messagingSenderId: "627986117535",
  appId: "1:627986117535:web:b00d8b52e12df0e77803aa",
  measurementId: "G-SC4ZGX6PE4"
};

function AuthenticationButtons() {
  const auth = useAuth();
  const signIn = async () => {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };
  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthCheck
      fallback={
        <button className='button is-primary' onClick={signIn}>
          Sign In
        </button>
      }
    >
      <button className='button is-info' onClick={signOut}>
        Sign Out
      </button>
    </AuthCheck>
  );
}

function Navbar() {
  return (
    <nav className='navbar'>
      <div className='navbar-brand'>Fire Lobby 🔥</div>
      <div className='navbar-menu'>
        <div className='navbar-start'></div>
        <div className='navbar-end'>
          <div className='navbar-item'>
            <div className='buttons'>
              <AuthenticationButtons />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const LobbyContext = React.createContext();

function LobbyProvider(props) {
  const { email, displayName, uid } = useUser();
  const lobbyCollection = useFirestore().collection('lobby');
  const lobby = useFirestoreCollectionData(lobbyCollection);

  const userInLobby = lobby.find(m => m.email === email);

  const joinLobby = async () => {
    await lobbyCollection.doc(uid).set({ email, displayName, ready: false });
  };

  const leaveLobby = async () => {
    await lobbyCollection.doc(uid).delete();
  };

  const toggleReadiness = async newReadiness => {
    await lobbyCollection.doc(uid).set({ ready: newReadiness }, { merge: true });
  };

  return (
    <LobbyContext.Provider value={{ userInLobby, lobby, joinLobby, leaveLobby, toggleReadiness }}>
      {props.children}
    </LobbyContext.Provider>
  );
}

function Lobby() {
  const { lobby } = useContext(LobbyContext);

  return (
    <div className='container is-fluid'>
      {lobby.map(m => {
        return (
          <article key={m.email} className='tile is-child notification'>
            <p className='title'>
              {m.displayName} - {m.ready ? 'Ready 🎮' : 'Not Ready ❌'}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function LobbyActions() {
  const { userInLobby, joinLobby, leaveLobby, toggleReadiness } = useContext(LobbyContext);
  const components = [];

  if (userInLobby) {
    components.push(
      <div key='readyButton' className='column is-1'>
        <button key='readyButton' className='button is-primary' onClick={() => toggleReadiness(!userInLobby.ready)}>
          {userInLobby.ready ? 'Not Ready!' : 'Ready!'}
        </button>
      </div>
    );
    components.push(
      <div key='leaveButton' className='column is-1'>
        <button className='button is-primary' onClick={leaveLobby}>
          Leave
        </button>
      </div>
    );
  } else {
    components.push(
      <div key='joinButton' className='column is-1'>
        <button className='button is-primary' onClick={joinLobby}>
          Join
        </button>
      </div>
    );
  }

  return (
    <div className='container is-fluid'>
      <div className='columns'>{components}</div>
    </div>
  );
}

export function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <SuspenseWithPerf fallback={<p>Loading...</p>} traceId={'loading-app-status'}>
        <Navbar />
        <AuthCheck fallback={<p>Not Logged In...</p>}>
          <LobbyProvider>
            <Lobby></Lobby>
            <LobbyActions />
          </LobbyProvider>
        </AuthCheck>
      </SuspenseWithPerf>
    </FirebaseAppProvider>
  );
}

//createRoot(document.getElementById('root')).render(<App />);
